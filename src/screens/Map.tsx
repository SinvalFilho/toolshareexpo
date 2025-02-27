import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../components/styles';
import { getTools, getNearbyTools } from '../services/api';
import { Tool } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Map: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };
    getLocation();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        let toolsData = location
          ? await getNearbyTools(location.coords.latitude, location.coords.longitude)
          : await getTools();
        setTools(toolsData.tools);
      } catch (error) {
        console.error('Erro ao carregar ferramentas', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [location]);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? tool.status === selectedStatus : true;
    return matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Ferramentas</Text>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerLabelContainer}>
            <Icon name="category" size={20} color={colors.text} />
            <Text style={styles.pickerLabel}>Categoria</Text>
          </View>
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Todas as Categorias" value="" />
            <Picker.Item label="Ferramentas Elétricas" value="Ferramentas Elétricas" />
            <Picker.Item label="Ferramentas Manuais" value="Ferramentas Manuais" />
            <Picker.Item label="Medição e instrumentação" value="Medição e instrumentação" />
            <Picker.Item label="Caixas Organizadoras" value="Caixas Organizadoras" />
            <Picker.Item label="Ferramentas para jardim" value="Ferramentas para jardim" />
            <Picker.Item label="Acessórios" value="Acessórios" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerLabelContainer}>
            <Icon name="info" size={20} color={colors.text} />
            <Text style={styles.pickerLabel}>Status</Text>
          </View>
          <Picker
            selectedValue={selectedStatus}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedStatus(itemValue)}
            dropdownIconColor={colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Todos os Status" value="" />
            <Picker.Item label="disponível" value="disponível" />
            <Picker.Item label="alugada" value="alugada" />
          </Picker>
        </View>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || -23.5505,
          longitude: location?.coords.longitude || -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            title="Minha Localização"
            pinColor={colors.primary}
          />
        )}
        {filteredTools.map((tool) => (
          <Marker
            key={tool.id}
            coordinate={{ latitude: parseFloat(tool.latitude), longitude: parseFloat(tool.longitude) }}
            title={tool.name}
            description={`Status: ${tool.status}`}
            pinColor={tool.status === 'disponível' ? colors.income : colors.error}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.surface,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  pickerLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  picker: {
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
});

export default Map;
