import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#6200ee" />
  </View>
);

export default LoadingScreen;
