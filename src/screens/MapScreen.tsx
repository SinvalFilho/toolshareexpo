import React, { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import useGeolocation from '../hooks/useGeolocation';
import { getNearbyTools } from '../services/api';
import { Tool } from '../types';

const categories = ['Todas', 'Furadeira', 'Serra', 'Andaime', 'Outros'];

const MapScreen = () => {
  const { location } = useGeolocation();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
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
    let filtered = Array.isArray(tools) ? [...tools] : [];
    
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) filtered = filtered.filter(tool => tool.price <= price);
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
            typeof tool.latitude === 'number' && 
            typeof tool.longitude === 'number'
          )
          .map(tool => (
            <Marker
              key={tool.id}
              coordinate={{
                latitude: tool.latitude,
                longitude: tool.longitude,
              }}
              title={tool.name}
              description={`R$ ${tool.price?.toFixed(2) || '0.00'} / dia`}
              pinColor="red"
              onPress={() => navigation.navigate('ToolDetail', { toolId: tool.id })}
            />
          ))}
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