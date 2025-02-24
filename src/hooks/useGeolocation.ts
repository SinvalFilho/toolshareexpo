import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const useGeolocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permissão de localização negada');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation(locationData);
    };

    getLocation();
  }, []);

  return { location, error };
};

export default useGeolocation;
