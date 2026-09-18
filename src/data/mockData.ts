// src/data/mockData.ts

export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'normal' | 'warning' | 'critical';
  waterLevel: number; // in cm
  soc: number; // percentage 0-100
  powerOutput: number; // in mW
  signalStrength: number; // in dBm
  aiPrediction: 'LOW' | 'MEDIUM' | 'HIGH';
  lastSync: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  nodeId: string;
  stationName: string;
}

export interface WaterLevelHistory {
  nodeId: string;
  labels: string[];
  datasets: { data: number[] }[];
}

export const MOCK_NODES: Node[] = [
  {
    id: 'node-03',
    name: 'Node #03 - Sabang Estero',
    lat: 13.6250,
    lng: 123.1900,
    status: 'normal',
    waterLevel: 45,
    soc: 98,
    powerOutput: 3.2,
    signalStrength: -75,
    aiPrediction: 'LOW',
    lastSync: '1m ago',
  },
  {
    id: 'node-05',
    name: 'Node #05 - Triangulo Drain',
    lat: 13.6180,
    lng: 123.1950,
    status: 'warning',
    waterLevel: 95,
    soc: 92,
    powerOutput: 2.9,
    signalStrength: -80,
    aiPrediction: 'MEDIUM',
    lastSync: '2m ago',
  },
  {
    id: 'node-07',
    name: 'Node #07 - Concepcion Pequena',
    lat: 13.6200,
    lng: 123.2000,
    status: 'normal',
    waterLevel: 67,
    soc: 95,
    powerOutput: 3.1,
    signalStrength: -85,
    aiPrediction: 'LOW',
    lastSync: '30s ago',
  },
  {
    id: 'node-12',
    name: 'Node #12 - Mabolo Outfall',
    lat: 13.6150,
    lng: 123.1850,
    status: 'critical',
    waterLevel: 127,
    soc: 88,
    powerOutput: 2.5,
    signalStrength: -90,
    aiPrediction: 'HIGH',
    lastSync: '5m ago',
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'critical',
    title: 'CRITICAL - Node #12',
    message: 'Water level at 127cm - EXCEEDED THRESHOLD',
    timestamp: '2:34 PM',
    nodeId: 'node-12',
    stationName: 'Mabolo Outfall',
  },
  {
    id: 'a2',
    type: 'warning',
    title: 'WARNING - Node #05',
    message: 'Rising trend detected (+15cm/hr)',
    timestamp: '1:15 PM',
    nodeId: 'node-05',
    stationName: 'Triangulo Drain',
  },
  {
    id: 'a3',
    type: 'info',
    title: 'INFO - Node #03',
    message: 'Transmission resumed',
    timestamp: '12:00 PM',
    nodeId: 'node-03',
    stationName: 'Sabang Estero',
  },
];

export const MOCK_CHART_DATA: WaterLevelHistory = {
  nodeId: 'node-07',
  labels: ['0h', '-4h', '-8h', '-12h', '-16h', '-20h', '-24h'],
  datasets: [
    {
      data: [67, 65, 60, 55, 58, 62, 65],
    },
  ],
};

export const NODE_CHART_DATA_MAP: Record<string, WaterLevelHistory> = {
  'node-07': MOCK_CHART_DATA,
  'node-03': {
    nodeId: 'node-03',
    labels: ['0h', '-4h', '-8h', '-12h', '-16h', '-20h', '-24h'],
    datasets: [{ data: [45, 43, 44, 42, 40, 41, 43] }],
  },
  'node-05': {
    nodeId: 'node-05',
    labels: ['0h', '-4h', '-8h', '-12h', '-16h', '-20h', '-24h'],
    datasets: [{ data: [95, 90, 82, 75, 68, 65, 62] }],
  },
  'node-12': {
    nodeId: 'node-12',
    labels: ['0h', '-4h', '-8h', '-12h', '-16h', '-20h', '-24h'],
    datasets: [{ data: [127, 122, 115, 108, 98, 85, 78] }],
  },
};
