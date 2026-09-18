import { NavigatorScreenParams } from '@react-navigation/native';

export type MapStackParamList = {
  MapScreen: undefined;
  NodeDetailScreen: { nodeId?: string };
};

// LGU (Admin) tab navigator — full access
export type MainTabParamList = {
  MapTab: NavigatorScreenParams<MapStackParamList>;
  NetworkTab: undefined;
  AlertsTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

// Citizen tab navigator — simplified public access
export type CitizenTabParamList = {
  CitizenHomeTab: undefined;
  CitizenMapTab: undefined;
  CitizenAlertsTab: undefined;
  CitizenHotlinesTab: undefined;
};

export type RootStackParamList = {
  LoginScreen: undefined;
  MainTabNavigator: NavigatorScreenParams<MainTabParamList> | undefined;
  CitizenNavigator: NavigatorScreenParams<CitizenTabParamList> | undefined;
};
