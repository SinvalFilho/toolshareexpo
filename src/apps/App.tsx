import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from '../navigation/AppNavigation';
import useAuth from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';
import 'react-native-get-random-values';

const App = () => {
  const { isLoading } = useAuth();

  return (
    <PaperProvider>
      <NavigationContainer>
        {isLoading ? <LoadingScreen /> : <AppStack />}
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;