// src/context/TelemetryContext.tsx
// Live telemetry engine — simulates real BMFC sensor network data
// Architecture matches the MLP model in estago-ai-analysis/edge_ai_prediction_graph.py
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Node, Alert, MOCK_NODES, MOCK_ALERTS } from '../data/mockData';
import { predictEsteroLevel, ModelPrediction } from '../ai/hydrologyModel';

export interface EsgStats {
  totalKwhOffset: number;       // SDG 7 - Energy
  eWasteEradicated: number;     // SDG 12 - AA batteries replaced
  bodReductionPct: number;      // SDG 6 - Water quality
  h2sMitigationKg: number;     // Health metric
  averageSoc: number;           // Average SOC across all nodes
  activeNodes: number;
  lastSyncTime: string;
}

interface TelemetryContextProps {
  nodes: Node[];
  alerts: Alert[];
  esgStats: EsgStats;
  aiPrediction: ModelPrediction | null;
  isRunning: boolean;
  autoDispatch: boolean;
  setIsRunning: (val: boolean) => void;
  setAutoDispatch: (val: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  dispatchSiren: (nodeId: string) => void;
  getNodeById: (id: string) => Node | undefined;
}

const defaultEsg: EsgStats = {
  totalKwhOffset: 2.4,
  eWasteEradicated: 144,
  bodReductionPct: 78,
  h2sMitigationKg: 1.8,
  averageSoc: 93,
  activeNodes: 4,
  lastSyncTime: 'Just now',
};

const TelemetryContext = createContext<TelemetryContextProps>({
  nodes: MOCK_NODES,
  alerts: MOCK_ALERTS,
  esgStats: defaultEsg,
  aiPrediction: null,
  isRunning: true,
  autoDispatch: false,
  setIsRunning: () => {},
  setAutoDispatch: () => {},
  acknowledgeAlert: () => {},
  dispatchSiren: () => {},
  getNodeById: () => undefined,
});

export const useTelemetry = () => useContext(TelemetryContext);

// Simulate rainfall inputs for the MLP model (Naga City monsoon pattern)
// These simulate the rain_t0, rain_t1, rain_t2 LoRaWAN sensor readings
const generateRainfallInputs = (waterLevel: number): [number, number, number] => {
  // Back-calculate approximate rainfall from current water level
  // Matches the formula in edge_ai_prediction_graph.py:
  // water_level[i] = 50 + (rainfall[i-1] * 2.5) + (rainfall[i-2] * 1.5)
  const baseRain = Math.max(0, (waterLevel - 50) / 4.0);
  const t0 = Math.max(0, baseRain + (Math.random() * 2 - 1));
  const t1 = Math.max(0, baseRain * 0.7 + (Math.random() * 2 - 1));
  const t2 = Math.max(0, baseRain * 0.4 + (Math.random() * 1 - 0.5));
  return [t2, t1, t0];
};

const computeEsgStats = (nodes: Node[]): EsgStats => {
  const totalPower = nodes.reduce((sum, n) => sum + n.powerOutput, 0);
  const averageSoc = nodes.reduce((sum, n) => sum + n.soc, 0) / nodes.length;
  // 1 BMFC node replaces ~3 AA batteries/month = 36/yr per node
  const eWaste = nodes.length * 36;
  // Power (mW) → energy over 30 days → kWh, scaled for demonstration
  const kwhOffset = parseFloat(((totalPower * 24 * 30) / 1000000).toFixed(2));
  // BOD reduction tied to biofilm health (voltage proxy)
  const avgVoltage = nodes.reduce((sum, n) => sum + n.voltage, 0) / nodes.length;
  const bodPct = Math.min(95, Math.round(50 + (avgVoltage / 3.3) * 45));
  const h2s = parseFloat((nodes.length * 0.45).toFixed(1));

  return {
    totalKwhOffset: Math.max(kwhOffset, 2.1),
    eWasteEradicated: eWaste,
    bodReductionPct: bodPct,
    h2sMitigationKg: h2s,
    averageSoc: Math.round(averageSoc),
    activeNodes: nodes.length,
    lastSyncTime: 'Just now',
  };
};

let alertIdCounter = 100;

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>(MOCK_NODES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [esgStats, setEsgStats] = useState<EsgStats>(computeEsgStats(MOCK_NODES));
  const [aiPrediction, setAiPrediction] = useState<ModelPrediction | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const isRunningRef = useRef(isRunning);
  const autoDispatchRef = useRef(autoDispatch);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { autoDispatchRef.current = autoDispatch; }, [autoDispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunningRef.current) return;

      setNodes((prevNodes) => {
        const newNodes = prevNodes.map((node) => {
          // Realistic water level fluctuation — matches MLP training data patterns
          const waterDelta = (Math.random() * 5) - 2;
          let newWaterLevel: number;

          // Node-12 Mabolo is always near critical (flood zone baseline)
          if (node.id === 'node-12') {
            newWaterLevel = Math.max(116, Math.min(138, node.waterLevel + waterDelta));
          } else if (node.id === 'node-05') {
            // Triangulo Drain — rising flood scenario
            newWaterLevel = Math.max(82, Math.min(108, node.waterLevel + waterDelta));
          } else {
            // Normal estero stations
            newWaterLevel = Math.max(38, Math.min(75, node.waterLevel + waterDelta));
          }

          // Update status thresholds from proposal Section 4.2
          let status: 'normal' | 'warning' | 'critical' = 'normal';
          if (newWaterLevel >= 120) status = 'critical';
          else if (newWaterLevel >= 80) status = 'warning';

          // BMFC voltage/power — correlates to biofilm metabolic activity
          const newVoltage = parseFloat(Math.max(2.5, Math.min(3.3,
            node.voltage + (Math.random() * 0.08 - 0.04)
          )).toFixed(2));
          const newPower = parseFloat(Math.max(2.0, Math.min(3.5,
            node.powerOutput + (Math.random() * 0.15 - 0.075)
          )).toFixed(2));

          // SOC fluctuates based on solar/BMFC charging
          const newSoc = Math.max(80, Math.min(100,
            node.soc + Math.floor(Math.random() * 3 - 1)
          ));

          // AI prediction risk level using the MLP formula
          const [t2, t1, t0] = generateRainfallInputs(newWaterLevel);
          const prediction = predictEsteroLevel(t2, t1, t0, newWaterLevel);
          const newAiPrediction: 'LOW' | 'MEDIUM' | 'HIGH' = prediction.riskLevel;

          return {
            ...node,
            waterLevel: parseFloat(newWaterLevel.toFixed(1)),
            voltage: newVoltage,
            powerOutput: newPower,
            soc: newSoc,
            status,
            aiPrediction: newAiPrediction,
            lastSync: 'just now',
          };
        });

        // Run AI prediction on highest-risk node (node-12)
        const riskyNode = newNodes.find(n => n.id === 'node-12') || newNodes[0];
        const [t2, t1, t0] = generateRainfallInputs(riskyNode.waterLevel);
        const prediction = predictEsteroLevel(t2, t1, t0, riskyNode.waterLevel);
        setAiPrediction(prediction);

        // Compute live ESG stats
        setEsgStats(computeEsgStats(newNodes));

        // Auto-generate alerts when nodes cross critical threshold
        setAlerts((prevAlerts) => {
          let newAlerts = [...prevAlerts];
          for (const node of newNodes) {
            const wasAlreadyAlerted = prevAlerts.some(
              a => a.nodeId === node.id && a.type === 'critical' &&
                   !a.acknowledged && Date.now() - (a.createdAt || 0) < 60000
            );
            if (node.status === 'critical' && !wasAlreadyAlerted) {
              const newAlert: Alert = {
                id: `auto-${alertIdCounter++}`,
                type: 'critical',
                title: `CRITICAL — ${node.name.split(' - ')[0]}`,
                message: `Water level at ${node.waterLevel.toFixed(0)}cm EXCEEDS 120cm threshold. AI model predicts SURGE in ${predictEsteroLevel(0, 0, 0, node.waterLevel).leadTimeHours}h. ${autoDispatchRef.current ? 'Siren auto-dispatched.' : 'Manual dispatch required.'}`,
                timestamp: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                nodeId: node.id,
                stationName: node.name.split(' - ')[1] || node.name,
                acknowledged: false,
                createdAt: Date.now(),
              };
              newAlerts = [newAlert, ...newAlerts.slice(0, 9)]; // Keep max 10 alerts
            }
          }
          return newAlerts;
        });

        return newNodes;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const dispatchSiren = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const sirenAlert: Alert = {
      id: `siren-${alertIdCounter++}`,
      type: 'info',
      title: `Siren Dispatched — ${node?.name.split(' - ')[1] || nodeId}`,
      message: `Emergency siren activated by CDRRMO operator. Evacuation protocols initiated for affected barangays.`,
      timestamp: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
      nodeId,
      stationName: node?.name.split(' - ')[1] || nodeId,
      acknowledged: true,
      createdAt: Date.now(),
    };
    setAlerts(prev => [sirenAlert, ...prev]);
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <TelemetryContext.Provider value={{
      nodes, alerts, esgStats, aiPrediction,
      isRunning, autoDispatch,
      setIsRunning, setAutoDispatch,
      acknowledgeAlert, dispatchSiren, getNodeById,
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};
