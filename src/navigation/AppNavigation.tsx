import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Appbar } from 'react-native-paper';
import 'react-native-get-random-values';


import Home from '../screens/Home';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ToolDetail from '../screens/ToolDetail';
import CreateTool from '../screens/CreateTool';
import ChatScreen from '../screens/ChatScreen';
import Map from '../screens/Map';
import { RootStackParamList } from '../types/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: { [key: string]: string } = { Home: 'home', CreateTool: 'add', Map: 'pin-drop', LocationScreen: 'my-location'};
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#6200ee',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { paddingBottom: 5, backgroundColor: '#ffffff' },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="CreateTool" component={CreateTool} />
    {/* <Tab.Screen name="Register" component={Register} /> */}
    <Tab.Screen name="Map" component={Map} />
    {/* <Tab.Screen name="LocationScreen" component={LocationScreen} /> */}
    <Tab.Screen name="Login" component={Login} />
  </Tab.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      header: ({ navigation, route, options }) => (
        <Appbar.Header>
          {navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
          <Appbar.Content title={options.title ?? route.name} />
        </Appbar.Header>
      ),
    }}
  >
    <Stack.Screen
      name="Main"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Login"
      component={Login}
      options={{ title: 'Entrar' }}
    />
    <Stack.Screen
      name="Register"
      component={Register}
      options={{ title: 'Cadastrar' }}
    />
    <Stack.Screen
      name="ToolDetail"
      component={ToolDetail}
      options={{ title: 'Detalhes da Ferramenta' }}
    />
    <Stack.Screen
      name="CreateTool"
      component={CreateTool}
      options={{ title: 'Cadastrar Ferramenta' }}
    />
    <Stack.Screen
    name="ChatScreen"
    component={ChatScreen}
    options={{ title: 'Chat' }}
    />

  </Stack.Navigator>
  
);

export default AppStack;