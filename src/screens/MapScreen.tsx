import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbyTools } from '../services/api';  // Função que retorna as ferramentas perto de você
import { Tool } from '../types';

const categories = ['Todas', 'Furadeira', 'Serra', 'Andaime', 'Outros'];

// Função para calcular a distância usando a fórmula de Haversine
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em quilômetros
};

const MapScreen = () => {
  const { location } = useGeolocation();
  const [tools, setTools] = useState<Tool[]>([]);  // Armazenando ferramentas
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);  // Ferramentas filtradas
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [maxPrice, setMaxPrice] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTools = async () => {
      if (!location?.coords) return;
      try {
        const toolsData = await getNearbyTools(location.coords.latitude, location.coords.longitude);
        setTools(toolsData || []);
        setFilteredTools(toolsData || []);
      } catch (error) {
        setTools([]);
        setFilteredTools([]);
      }
    };
    fetchTools();
  }, [location]);

  useEffect(() => {
    let filtered = [...tools];

    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        filtered = filtered.filter(tool => tool.price <= price);
      }
    }

    setFilteredTools(filtered);
  }, [selectedCategory, maxPrice, tools]);

  if (!location?.coords) {
    return (
      <View style={styles.container}>
        <Text>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Text style={styles.label}>Categoria:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          style={styles.picker}>
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>

        <Text style={styles.label}>Preço Máximo:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100"
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
        />
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Minha Localização"
          description="Você está aqui!"
          pinColor="blue"
        />

        {Array.isArray(filteredTools) && filteredTools
          .filter(tool => 
            typeof tool.latitude === 'string' && 
            typeof tool.longitude === 'string'
          )
          .map(tool => {
            const latitude = parseFloat(tool.latitude);
            const longitude = parseFloat(tool.longitude);

            if (isNaN(latitude) || isNaN(longitude)) {
              return null;
            }

            const distance = haversineDistance(
              location.coords.latitude,
              location.coords.longitude,
              latitude,
              longitude
            );

            return (
              <Marker
                key={tool.id}
                coordinate={{
                  latitude: latitude,
                  longitude: longitude,
                }}
                title={tool.name}
                description={`R$ ${tool.price?.toFixed(2) || '0.00'} / dia | Distância: ${distance.toFixed(2)} km`}
                pinColor="red"
                onPress={() => navigation.navigate('ToolDetail', { toolId: tool.id })}  // Navegação para detalhes da ferramenta
              />
            );
          })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    backgroundColor: 'white',
    padding: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  picker: {
    height: 40,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;