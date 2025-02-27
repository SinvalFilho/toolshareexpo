export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined; 
  ToolDetail: { toolId: number };
  CreateTool: undefined;
  LocationScreen: undefined;
  Chat: { toolId: number; token: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}