import { NavigatorScreenParams } from '@react-navigation/native';

export type MapStackParamList = {
  MapScreen: undefined;
  NodeDetailScreen: { nodeId?: string };
};

export type MainTabParamList = {
  MapTab: NavigatorScreenParams<MapStackParamList>;
  NetworkTab: undefined;
  AlertsTab: undefined;
  AnalyticsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  LoginScreen: undefined;
  MainTabNavigator: NavigatorScreenParams<MainTabParamList> | undefined;
};
