export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined; 
  ToolDetail: { toolId: number };
  CreateTool: undefined;
  LocationScreen: undefined;
  MapScreen: undefined;
  Chat: { toolId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}