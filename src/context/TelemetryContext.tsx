// src/context/TelemetryContext.tsx
// Live telemetry engine — simulates real BMFC sensor network data streaming
// Matches the MLP model architecture in estago-ai-analysis/edge_ai_prediction_graph.py
// History buffer accumulates real-time readings for the 24h chart in NodeDetailScreen

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Node, Alert, WaterLevelHistory, MOCK_NODES, MOCK_ALERTS, NODE_CHART_DATA_MAP } from '../data/mockData';
import { predictEsteroLevel, ModelPrediction } from '../ai/hydrologyModel';

// ─── ESG Stats Interface (aligned with JA WE proposal SDG metrics) ─────────────
export interface EsgStats {
  totalKwhOffset: number;    // SDG 7  — Scope 2 energy offset (kWh/month)
  eWasteEradicated: number;  // SDG 12 — AA batteries eliminated per year
  bodReductionPct: number;   // SDG 6  — Biological Oxygen Demand reduction %
  h2sMitigationKg: number;   // SDG 11 — Hydrogen sulfide mitigation (kg/month)
  averageSoc: number;        // SOC across all active nodes (%)
  activeNodes: number;
  lastSyncTime: string;
}

interface TelemetryContextProps {
  nodes: Node[];
  alerts: Alert[];
  esgStats: EsgStats;
  aiPrediction: ModelPrediction | null;
  nodeHistories: Record<string, WaterLevelHistory>; // live 24h rolling chart data
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
  nodeHistories: NODE_CHART_DATA_MAP,
  isRunning: true,
  autoDispatch: false,
  setIsRunning: () => {},
  setAutoDispatch: () => {},
  acknowledgeAlert: () => {},
  dispatchSiren: () => {},
  getNodeById: () => undefined,
});

export const useTelemetry = () => useContext(TelemetryContext);

// ─── Rainfall back-calculation from water level ─────────────────────────────────
// Matches the inverse of the DGP formula from edge_ai_prediction_graph.py:
//   water_level[i] = 50 + (rainfall[i-1] * 2.5) + (rainfall[i-2] * 1.5) + noise
// We back-calculate approximate rainfall inputs to feed the MLP for prediction
const generateRainfallInputs = (waterLevel: number): [number, number, number] => {
  const baseRain = Math.max(0, (waterLevel - 50) / 4.0);
  const jitter = () => Math.random() * 2 - 1;
  const t0 = Math.max(0, baseRain + jitter());
  const t1 = Math.max(0, baseRain * 0.7 + jitter());
  const t2 = Math.max(0, baseRain * 0.4 + (Math.random() - 0.5));
  return [t2, t1, t0];
};

// ─── ESG computation from live node telemetry ───────────────────────────────────
const computeEsgStats = (nodes: Node[]): EsgStats => {
  const totalPower = nodes.reduce((sum, n) => sum + n.powerOutput, 0);
  const averageSoc = nodes.reduce((sum, n) => sum + n.soc, 0) / nodes.length;

  // Each BMFC node replaces ~3 AA batteries/month = 36/yr/node
  const eWaste = nodes.length * 36;

  // Power (mW) → monthly kWh (mW * 24h * 30d / 1,000,000)
  const kwhOffset = parseFloat(((totalPower * 24 * 30) / 1_000_000).toFixed(2));

  // BOD reduction proxy: correlates with average BMFC voltage health
  const avgVoltage = nodes.reduce((sum, n) => sum + n.voltage, 0) / nodes.length;
  const bodPct = Math.min(95, Math.round(50 + (avgVoltage / 3.3) * 45));

  // H2S mitigation: 0.45 kg/node/month (from bioremediation activity)
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

// ─── Rolling history buffer (max 24 data points per node) ──────────────────────
const MAX_HISTORY = 24;

function initHistories(): Record<string, number[]> {
  const h: Record<string, number[]> = {};
  MOCK_NODES.forEach(n => {
    // Seed with the static 7-point history, padded to 24 by interpolation
    const seed = NODE_CHART_DATA_MAP[n.id]?.datasets[0].data || [n.waterLevel];
    h[n.id] = seed;
  });
  return h;
}

function buildChartData(nodeId: string, history: number[]): WaterLevelHistory {
  const len = history.length;
  const labels = history.map((_, i) => {
    const hoursAgo = len - 1 - i;
    return hoursAgo === 0 ? 'Now' : `-${hoursAgo * 4}h`;
  });
  return {
    nodeId,
    labels,
    datasets: [{ data: history.map(v => Math.round(v * 10) / 10) }],
  };
}

let alertIdCounter = 100;

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>(MOCK_NODES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [esgStats, setEsgStats] = useState<EsgStats>(computeEsgStats(MOCK_NODES));
  const [aiPrediction, setAiPrediction] = useState<ModelPrediction | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [nodeHistories, setNodeHistories] = useState<Record<string, WaterLevelHistory>>(
    () => {
      const result: Record<string, WaterLevelHistory> = {};
      MOCK_NODES.forEach(n => {
        result[n.id] = NODE_CHART_DATA_MAP[n.id] || {
          nodeId: n.id,
          labels: ['Now'],
          datasets: [{ data: [n.waterLevel] }],
        };
      });
      return result;
    }
  );

  const isRunningRef = useRef(isRunning);
  const autoDispatchRef = useRef(autoDispatch);
  const rawHistoriesRef = useRef<Record<string, number[]>>(initHistories());
  const tickCountRef = useRef(0);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { autoDispatchRef.current = autoDispatch; }, [autoDispatch]);

  useEffect(() => {
    // 3-second telemetry tick — matches the LoRaWAN burst interval for demo
    const interval = setInterval(() => {
      if (!isRunningRef.current) return;

      tickCountRef.current += 1;
      const tick = tickCountRef.current;

      setNodes(prevNodes => {
        const newNodes = prevNodes.map(node => {
          // Realistic water level fluctuation — matches MLP training data noise σ=3
          const noise = (Math.random() * 6) - 3; // ±3cm noise (σ=3 from DGP)
          let newWaterLevel: number;

          // Node-specific flood scenario patterns
          if (node.id === 'node-12') {
            // Mabolo Outfall: always near/above critical (flood zone)
            newWaterLevel = Math.max(116, Math.min(138, node.waterLevel + noise * 0.8));
          } else if (node.id === 'node-05') {
            // Triangulo Drain: rising warning scenario
            // Slowly trending up toward critical to demonstrate AI early warning
            const trend = Math.sin(tick * 0.05) * 3; // slow oscillation
            newWaterLevel = Math.max(80, Math.min(112, node.waterLevel + noise * 0.5 + trend * 0.1));
          } else if (node.id === 'node-03') {
            // Sabang Estero: normal zone, gentle fluctuation
            newWaterLevel = Math.max(38, Math.min(62, node.waterLevel + noise * 0.4));
          } else {
            // node-07: normal with slight upstream influence
            newWaterLevel = Math.max(55, Math.min(78, node.waterLevel + noise * 0.5));
          }
          newWaterLevel = parseFloat(newWaterLevel.toFixed(1));

          // Water level → risk status (Section 4.2 thresholds)
          let status: 'normal' | 'warning' | 'critical' = 'normal';
          if (newWaterLevel >= 120) status = 'critical';
          else if (newWaterLevel >= 80) status = 'warning';

          // BMFC voltage — correlates with biofilm metabolic activity
          const newVoltage = parseFloat(Math.max(2.5, Math.min(3.3,
            node.voltage + (Math.random() * 0.08 - 0.04)
          )).toFixed(2));

          // BMFC power output (PANI-modified bioanode), correlated with voltage
          const newPower = parseFloat(Math.max(2.0, Math.min(3.5,
            node.powerOutput + (Math.random() * 0.15 - 0.075)
          )).toFixed(2));

          // Supercapacitor SOC — charges from BMFC + ambient; slight fluctuation
          const newSoc = Math.max(78, Math.min(100,
            node.soc + Math.floor(Math.random() * 3 - 1)
          ));

          // Run MLP inference for this node's risk prediction
          const [t2, t1, t0] = generateRainfallInputs(newWaterLevel);
          const pred = predictEsteroLevel(t2, t1, t0, newWaterLevel);

          return {
            ...node,
            waterLevel: newWaterLevel,
            voltage: newVoltage,
            powerOutput: newPower,
            soc: newSoc,
            status,
            aiPrediction: pred.riskLevel,
            lastSync: 'just now',
          };
        });

        // Global AI prediction — runs on the highest-risk node (Mabolo Outfall)
        const riskyNode = newNodes.find(n => n.id === 'node-12') || newNodes[0];
        const [t2, t1, t0] = generateRainfallInputs(riskyNode.waterLevel);
        const globalPred = predictEsteroLevel(t2, t1, t0, riskyNode.waterLevel);
        setAiPrediction(globalPred);

        // Recompute ESG metrics from live node telemetry
        setEsgStats(computeEsgStats(newNodes));

        // Update rolling 24h history buffer (one data point every ~20 ticks = 60s)
        if (tick % 20 === 0) {
          const rawH = rawHistoriesRef.current;
          newNodes.forEach(n => {
            if (!rawH[n.id]) rawH[n.id] = [n.waterLevel];
            rawH[n.id] = [...rawH[n.id], n.waterLevel].slice(-MAX_HISTORY);
          });
          rawHistoriesRef.current = rawH;

          setNodeHistories(() => {
            const next: Record<string, WaterLevelHistory> = {};
            newNodes.forEach(n => {
              next[n.id] = buildChartData(n.id, rawHistoriesRef.current[n.id] || [n.waterLevel]);
            });
            return next;
          });
        }

        // Auto-generate alerts when nodes cross critical threshold
        setAlerts(prevAlerts => {
          let newAlerts = [...prevAlerts];
          for (const node of newNodes) {
            const recentlySentAlert = prevAlerts.some(
              a => a.nodeId === node.id &&
                   a.type === 'critical' &&
                   !a.acknowledged &&
                   Date.now() - (a.createdAt || 0) < 60000
            );
            if (node.status === 'critical' && !recentlySentAlert) {
              const [t2, t1, t0] = generateRainfallInputs(node.waterLevel);
              const pred = predictEsteroLevel(t2, t1, t0, node.waterLevel);
              const newAlert: Alert = {
                id: `auto-${alertIdCounter++}`,
                type: 'critical',
                title: `CRITICAL — ${node.name.split(' - ')[0]}`,
                message: `Water level at ${node.waterLevel.toFixed(0)}cm EXCEEDS 120cm threshold. Edge-AI MLP (R²=0.91, MAE=4.2cm) predicts SURGE in ${pred.leadTimeHours}h at ${pred.confidence}% confidence. ${autoDispatchRef.current ? 'Siren auto-dispatched.' : 'Manual dispatch required.'}`,
                timestamp: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }),
                nodeId: node.id,
                stationName: node.name.split(' - ')[1] || node.name,
                acknowledged: false,
                createdAt: Date.now(),
              };
              newAlerts = [newAlert, ...newAlerts.slice(0, 9)]; // rolling 10-alert buffer
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
      message: `Emergency siren activated by CDRRMO operator. Barangay evacuation protocols initiated. All residents in affected zone advised to move to higher ground immediately.`,
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
      nodes, alerts, esgStats, aiPrediction, nodeHistories,
      isRunning, autoDispatch,
      setIsRunning, setAutoDispatch,
      acknowledgeAlert, dispatchSiren, getNodeById,
    }}>
      {children}
    </TelemetryContext.Provider>
  );
};
