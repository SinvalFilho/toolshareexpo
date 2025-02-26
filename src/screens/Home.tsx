import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../components/styles';
import { getTools, getNearbyTools } from '../services/api';
import { Tool } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function Home({ navigation }: any) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  // Obter a localização do usuário
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão de localização negada');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);
  };

  const fetchTools = async () => {
    try {
      if (userLocation) {
        const toolsData = await getNearbyTools(userLocation.coords.latitude, userLocation.coords.longitude);
        setTools(toolsData.tools);
        setError(null);
      } else {
        const toolsData = await getTools();
        setTools(toolsData.tools);
        setError(null);
      }
    } catch (error) {
      console.error('Erro ao carregar ferramentas', error);
      setError('Erro ao carregar as ferramentas');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async () => {
    try {
      const token = await AsyncStorage.getItem('@access_token');
      if (token) {
        const storedName = await AsyncStorage.getItem('@user_name');
        if (storedName) {
          setUserName(storedName);
          setIsLoggedIn(true);
        } else {
          console.error('Nome do usuário não encontrado no AsyncStorage');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Erro ao recuperar nome do usuário', error);
      setIsLoggedIn(false);
    }
  };

  // Recarrega os dados sempre que a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        await getLocation();
        await fetchUserName();
        await fetchTools();
      };
      loadData();
    }, [userLocation]) // Recarrega as ferramentas quando a localização muda
  );

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            await AsyncStorage.multiRemove(['@access_token', '@user_name', '@user_email', '@user_id', '@user_type']);
            setIsLoggedIn(false);
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleToolDetail = (toolId: number) => {
    if (isLoggedIn) {
      navigation.navigate('ToolDetail', { toolId });
    } else {
      Alert.alert(
        'Login Necessário',
        'Você precisa estar logado para ver os detalhes da ferramenta.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  };

  const handleAddTool = () => {
    if (isLoggedIn) {
      navigation.navigate('CreateTool');
    } else {
      Alert.alert(
        'Login Necessário',
        'Você precisa estar logado para adicionar uma nova ferramenta.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }
  };

  const renderTool = ({ item }: { item: Tool }) => (
    <View style={styles.toolCard}>
      <Text style={styles.toolName}>{item.name}</Text>
      <Text style={styles.toolCategory}>{item.category}</Text>
      <Text style={styles.toolPrice}>R$ {item.price.toFixed(2)} / dia</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleToolDetail(item.id)}
      >
        <Text style={styles.buttonText}>Ver Detalhes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isLoggedIn ? (
          <>
            <Text style={styles.greeting}>Olá, {userName}</Text>
            <Button title="Logout" onPress={handleLogout} color={colors.error} />
          </>
        ) : (
          <Button title="Login" onPress={() => navigation.navigate('Login')} color={colors.primary} />
        )}
      </View>

      <Text style={styles.title}>Bem-vindo à ToolShare</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : userLocation ? (
        <>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Minha Localização"
              description="Você está aqui!"
              pinColor="blue"
            />

            {tools.map((tool) => (
              <Marker
                key={tool.id}
                coordinate={{
                  latitude: parseFloat(tool.latitude),
                  longitude: parseFloat(tool.longitude),
                }}
                title={tool.name}
                description={`R$ ${tool.price.toFixed(2)} / dia`}
                pinColor="red"
                onPress={() => handleToolDetail(tool.id)}
              />
            ))}
          </MapView>

          <FlatList
            data={tools}
            renderItem={renderTool}
            keyExtractor={(item) => item.id.toString()}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
          />
        </>
      ) : (
        <Text style={styles.error}>Não foi possível obter a localização.</Text>
      )}

      {isLoggedIn && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTool}
        >
          <Text style={styles.addButtonText}>Adicionar Nova Ferramenta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  error: {
    textAlign: 'center',
    color: colors.error,
    fontSize: 16,
  },
  toolCard: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  toolName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  toolCategory: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toolPrice: {
    fontSize: 16,
    color: colors.primary,
    marginVertical: 10,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  map: {
    height: 300,
    width: '100%',
    marginBottom: 20,
  },
});