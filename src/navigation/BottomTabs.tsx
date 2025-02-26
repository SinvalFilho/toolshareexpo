import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Chat from '../screens/Chat';
import Map from '../screens/Map';

const Tab = createBottomTabNavigator();

const BottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: { [key: string]: string } = {
            Home: 'home',
            Profile: 'person',
            Chat: 'chat',
            Map: 'map',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Map" component={Map} />
    </Tab.Navigator>
  );
};

export default BottomTabs;