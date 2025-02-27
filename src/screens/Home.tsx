import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../components/styles';
import { getTools, getNearbyTools } from '../services/api';
import { Tool } from '../types';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(2);
};

export default function Home({ navigation }: any) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

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
        const toolsData = await getNearbyTools(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
        );
        const filteredTools = toolsData.tools.filter((tool: Tool) => {
          const distance = calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            parseFloat(tool.latitude),
            parseFloat(tool.longitude)
            
          );
          return parseFloat(distance) <= 10;
        });
        const toolsWithDistance = filteredTools.map((tool: Tool) => ({
          ...tool,
          distance: calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            parseFloat(tool.latitude),
            parseFloat(tool.longitude)
          ),
        }));
        setTools(toolsWithDistance);
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
          await fetchTools();
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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        await getLocation();
        await fetchUserName();
      };
      loadData();
    }, [])
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
    <TouchableOpacity 
      style={styles.toolCard}
      onPress={() => handleToolDetail(item.id)}
    >
      <View style={styles.toolHeader}>
        <Text style={styles.toolName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'disponível' ? '#4CAF50' : '#f44336' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.toolInfo}>
        <Icon name="category" size={16} color={colors.textSecondary} />
        <Text style={styles.toolCategory}>{item.category}</Text>
      </View>
      <View style={styles.toolInfo}>
        <Icon name="location-on" size={16} color={colors.textSecondary} />
        <Text style={styles.toolDistance}>{item.distance} km de distância</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.toolPrice}>R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.priceLabel}>/ dia</Text>
      </View>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.detailsButton}
      >
        <Text style={styles.buttonText}>Ver Detalhes</Text>
        <Icon name="arrow-forward" size={18} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {isLoggedIn ? (
            <>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Bem-vindo,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <Icon name="exit-to-app" size={24} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Entrar / Cadastrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : isLoggedIn ? (
        userLocation ? (
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
        )
      ) : (
        <Text style={styles.error}>Por favor, faça login para ver as ferramentas disponíveis.</Text>
      )}

      {isLoggedIn && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddTool}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  toolCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  toolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolCategory: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  toolDistance: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  toolPrice: {
    color: '#2196F3',
    fontSize: 24,
    fontWeight: '700',
  },
  priceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  map: {
    height: 200,
    margin: 16,
    borderRadius: 12,
  },
  error: {
    textAlign: 'center',
    color: colors.error,
    fontSize: 16,
    marginTop: 20,
  },
});