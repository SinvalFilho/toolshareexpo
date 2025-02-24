import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useGeolocation from '../hooks/useGeolocation';

const LocationScreen = () => {
  const { location, error } = useGeolocation();

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.error}>Erro: {error}</Text>
      ) : location ? (
        <Text>
          Latitude: {location.coords.latitude} {"\n"}
          Longitude: {location.coords.longitude}
        </Text>
      ) : (
        <Text>Obtendo localização...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  error: {
    color: 'red',
  },
});

export default LocationScreen;
