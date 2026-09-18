import React, { createContext, useContext, useState, useEffect } from 'react';
import { Node, MOCK_NODES } from '../data/mockData';

interface TelemetryContextProps {
  nodes: Node[];
  getNodeById: (id: string) => Node | undefined;
}

const TelemetryContext = createContext<TelemetryContextProps>({
  nodes: MOCK_NODES,
  getNodeById: () => undefined,
});

export const useTelemetry = () => useContext(TelemetryContext);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>(MOCK_NODES);

  useEffect(() => {
    // Simulate real-time telemetry fluctuations every 3 seconds
    const interval = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          // Fluctuate water level by -2 to +2 cm
          const waterDelta = (Math.random() * 4) - 2;
          let newWaterLevel = node.waterLevel + waterDelta;
          
          // Constrain water levels based on their baseline
          if (node.id === 'node-12') newWaterLevel = Math.max(120, Math.min(135, newWaterLevel));
          else if (node.id === 'node-05') newWaterLevel = Math.max(85, Math.min(105, newWaterLevel));
          else newWaterLevel = Math.max(40, Math.min(75, newWaterLevel));

          // Calculate status based on dynamic water level
          let status: 'normal' | 'warning' | 'critical' = 'normal';
          if (newWaterLevel >= 120) status = 'critical';
          else if (newWaterLevel >= 80) status = 'warning';

          // Slight fluctuation in power output & voltage
          const newVoltage = Math.max(2.5, Math.min(3.3, node.voltage + ((Math.random() * 0.1) - 0.05)));
          const newPower = Math.max(2.0, Math.min(3.5, node.powerOutput + ((Math.random() * 0.2) - 0.1)));

          return {
            ...node,
            waterLevel: parseFloat(newWaterLevel.toFixed(1)),
            voltage: parseFloat(newVoltage.toFixed(2)),
            powerOutput: parseFloat(newPower.toFixed(2)),
            status,
            lastSync: 'just now',
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <TelemetryContext.Provider value={{ nodes, getNodeById }}>
      {children}
    </TelemetryContext.Provider>
  );
};
