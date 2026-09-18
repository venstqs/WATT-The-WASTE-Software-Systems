// src/data/mockData.ts

export interface Node {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'normal' | 'warning' | 'critical';
  waterLevel: number; // in cm
  soc: number; // percentage 0-100
  voltage: number; // supercap voltage up to 3.3V
  powerOutput: number; // in mW from PANI-Modified Bioanode
  biofilmResistance: number; // in ohms (e.g., 5.5)
  signalStrength: number; // in dBm
  aiPrediction: 'LOW' | 'MEDIUM' | 'HIGH';
  lastSync: string;
  dutyCycle: string; // e.g. '30m', '15m', '2m'
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  nodeId: string;
  stationName: string;
  acknowledged?: boolean;
  createdAt?: number;
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
    voltage: 3.25,
    powerOutput: 3.2,
    biofilmResistance: 5.5,
    signalStrength: -75,
    aiPrediction: 'LOW',
    lastSync: '1m ago',
    dutyCycle: '30m',
  },
  {
    id: 'node-05',
    name: 'Node #05 - Triangulo Drain',
    lat: 13.6180,
    lng: 123.1950,
    status: 'warning',
    waterLevel: 95,
    soc: 92,
    voltage: 3.10,
    powerOutput: 2.9,
    biofilmResistance: 5.8,
    signalStrength: -80,
    aiPrediction: 'MEDIUM',
    lastSync: '2m ago',
    dutyCycle: '15m',
  },
  {
    id: 'node-07',
    name: 'Node #07 - Concepcion Pequena',
    lat: 13.6200,
    lng: 123.2000,
    status: 'normal',
    waterLevel: 67,
    soc: 95,
    voltage: 3.20,
    powerOutput: 3.1,
    biofilmResistance: 5.6,
    signalStrength: -85,
    aiPrediction: 'LOW',
    lastSync: '30s ago',
    dutyCycle: '30m',
  },
  {
    id: 'node-12',
    name: 'Node #12 - Mabolo Outfall',
    lat: 13.6150,
    lng: 123.1850,
    status: 'critical',
    waterLevel: 127,
    soc: 88,
    voltage: 2.95,
    powerOutput: 2.5,
    biofilmResistance: 6.2,
    signalStrength: -90,
    aiPrediction: 'HIGH',
    lastSync: '5m ago',
    dutyCycle: '2m',
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    type: 'critical',
    title: 'CRITICAL — Node #12',
    message: 'Water level at 127cm — EXCEEDED 120cm THRESHOLD. Adaptive duty cycle shifted to 2m bursts. MLP model confidence: 96.8%.',
    timestamp: '2:34 PM',
    nodeId: 'node-12',
    stationName: 'Mabolo Outfall',
    acknowledged: false,
    createdAt: Date.now() - 300000,
  },
  {
    id: 'a2',
    type: 'warning',
    title: 'WARNING — Node #05',
    message: 'Rising trend detected (+15cm/hr). LSTM model predicts HIGH risk in 3 hours. Standby pumping at Triangulo Drain.',
    timestamp: '1:15 PM',
    nodeId: 'node-05',
    stationName: 'Triangulo Drain',
    acknowledged: false,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'a3',
    type: 'info',
    title: 'INFO — Node #03',
    message: 'Supercapacitor bank fully recharged in 7.8 seconds. BMFC bioanode outputting 3.2mW at 3.25V.',
    timestamp: '12:00 PM',
    nodeId: 'node-03',
    stationName: 'Sabang Estero',
    acknowledged: true,
    createdAt: Date.now() - 3600000,
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
