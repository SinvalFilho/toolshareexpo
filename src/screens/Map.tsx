import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text } from 'react-native'; // Adicionei o Text aqui
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

  // Busca a localização do usuário
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

  // Busca as ferramentas com base na localização
  useEffect(() => {
    const fetchTools = async () => {
      try {
        let toolsData;
        if (location) {
          toolsData = await getNearbyTools(location.coords.latitude, location.coords.longitude);
        } else {
          toolsData = await getTools();
        }
        setTools(toolsData.tools);
      } catch (error) {
        console.error('Erro ao carregar ferramentas', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [location]);

  // Filtra as ferramentas com base na categoria e status selecionados
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? tool.status === selectedStatus : true;
    return matchesCategory && matchesStatus;
  });

  // Exibe um loading enquanto os dados são carregados
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mapa de Ferramentas</Text>
      </LinearGradient>

      {/* Filtros de categoria e status */}
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
            <Picker.Item label="em manutenção" value="em manutenção" />
          </Picker>
        </View>
      </View>

      {/* Mapa com marcadores */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || -23.5505,
          longitude: location?.coords.longitude || -46.6333,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Marcador da localização do usuário */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Minha Localização"
            description="Você está aqui!"
            pinColor={colors.primary}
          />
        )}

        {/* Marcadores das ferramentas */}
        {filteredTools.map((tool) => (
          <Marker
            key={tool.id}
            coordinate={{
              latitude: parseFloat(tool.latitude),
              longitude: parseFloat(tool.longitude),
            }}
            title={tool.name}
            description={`Status: ${tool.status}`}
            pinColor={tool.status === 'disponível' ? colors.income : colors.error}
          />
        ))}
      </MapView>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  picker: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
});

export default Map;