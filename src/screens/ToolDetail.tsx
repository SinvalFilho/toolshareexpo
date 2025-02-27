import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import { RootStackParamList } from '../types/types';
import { Tool } from '../types';
import { getToolDetails, reserveTool } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../components/styles';

type ToolDetailRouteProp = RouteProp<RootStackParamList, 'ToolDetail'>;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

const ToolDetail: React.FC = () => {
  const route = useRoute<ToolDetailRouteProp>();
  const navigation = useNavigation();
  const { toolId } = route.params;
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [startDateInput, setStartDateInput] = useState(formatDate(startDate));
  const [endDateInput, setEndDateInput] = useState(formatDate(endDate));
  const [reservationStatus, setReservationStatus] = useState<'pendente' | 'confirmada' | 'cancelada' | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await getToolDetails(toolId);
        if (response && response.tool) {
          setTool(response.tool);
        } else {
          setError('Ferramenta não encontrada.');
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da ferramenta:', err);
        setError('Erro ao carregar os detalhes da ferramenta');
      } finally {
        setLoading(false);
      }
    };
    fetchToolDetails();
  }, [toolId]);

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
      setStartDateInput(formatDate(date));
      if (date >= endDate) {
        const newEndDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        setEndDate(newEndDate);
        setEndDateInput(formatDate(newEndDate));
      }
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(false);
    if (date) {
      if (date <= startDate) {
        Alert.alert('Erro', 'A data final deve ser maior que a data de início.');
        const newEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        setEndDate(newEndDate);
        setEndDateInput(formatDate(newEndDate));
      } else {
        setEndDate(date);
        setEndDateInput(formatDate(date));
      }
    }
  };

  const handleStartDateInputChange = (text: string) => {
    setStartDateInput(text);
    const parsedDate = new Date(text);
    if (!isNaN(parsedDate.getTime())) {
      setStartDate(parsedDate);
      if (parsedDate >= endDate) {
        const newEndDate = new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000);
        setEndDate(newEndDate);
        setEndDateInput(formatDate(newEndDate));
      }
    }
  };

  const handleEndDateInputChange = (text: string) => {
    setEndDateInput(text);
    const parsedDate = new Date(text);
    if (!isNaN(parsedDate.getTime())) {
      if (parsedDate <= startDate) {
        Alert.alert('Erro', 'A data final deve ser maior que a data de início.');
        const newEndDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        setEndDate(newEndDate);
        setEndDateInput(formatDate(newEndDate));
      } else {
        setEndDate(parsedDate);
      }
    }
  };

  const handleReserve = async () => {
    try {
      if (!tool) {
        Alert.alert('Erro', 'Ferramenta não encontrada.');
        return;
      }
      if (startDate >= endDate) {
        Alert.alert('Erro', 'A data de início deve ser anterior à data de fim.');
        return;
      }
      if (tool.status !== 'disponível') {
        Alert.alert('Erro', 'Esta ferramenta não está disponível para reserva.');
        return;
      }
      setIsReserving(true);
      const token = await AsyncStorage.getItem('@access_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para fazer uma reserva.');
        navigation.navigate('Login');
        return;
      }
      const formattedStart = startDate.toISOString();
      const formattedEnd = endDate.toISOString();
      const reservationData = {
        tool_id: tool.id,
        start_date: formattedStart,
        end_date: formattedEnd,
        status: 'pendente',
      };
      const response = await reserveTool(reservationData, token);
      if (response && response.id) {
        setReservationStatus('pendente');
        Alert.alert('Sucesso', 'Reserva realizada com sucesso!');
        navigation.navigate('Main'); 
      } else {
        Alert.alert('Erro', 'Não foi possível realizar a reserva.');
      }
    } catch (err) {
      console.error('Erro na reserva:', err);
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    } finally {
      setIsReserving(false);
    }
  };


  const openChat = async () => {
    if (tool && tool.id) {
      const token = await AsyncStorage.getItem('@access_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para acessar o chat.');
        navigation.navigate('Login');
        return;
      }
      navigation.navigate('ChatScreen', { toolId: tool.id, token });
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o chat.');
    }
  };
  


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }
  if (!tool) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Ferramenta não encontrada.</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes da Ferramenta</Text>
      {tool.image ? (
        <Image source={{ uri: tool.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={styles.noImage}>Sem imagem disponível</Text>
      )}
      <Text style={styles.toolName}>Nome: {tool.name}</Text>
      <Text style={styles.toolDescription}>Descrição: {tool.description}</Text>
      <Text style={styles.toolPrice}>Preço: R$ {(tool.price || 0).toFixed(2)} / dia</Text>
      <Text style={styles.toolCategory}>Categoria: {tool.category}</Text>
      <Text style={styles.toolRating}>Avaliação: {tool.rating || 'Sem avaliação'}</Text>
      <Text style={styles.toolStatus}>Status: {tool.status}</Text>
      <View style={styles.detailsSection}>
        <Text style={styles.detailsTitle}>Mais Detalhes</Text>
        <Text>
          Localização: {tool.latitude ? tool.latitude : 'Não disponível'},{' '}
          {tool.longitude ? tool.longitude : 'Não disponível'}
        </Text>
      </View>
      {tool.latitude && tool.longitude && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: parseFloat(tool.latitude),
            longitude: parseFloat(tool.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: parseFloat(tool.latitude),
              longitude: parseFloat(tool.longitude),
            }}
            title={tool.name}
            description={`R$ ${tool.price.toFixed(2)} / dia`}
            pinColor="blue"
          />
        </MapView>
      )}
      <Text style={styles.label}>Data de Início:</Text>
      <TextInput
        style={styles.input}
        value={startDateInput}
        placeholder="YYYY-MM-DD"
        onChangeText={handleStartDateInputChange}
        onFocus={() => setShowStartDatePicker(true)}
      />
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}
      <Text style={styles.label}>Data de Fim:</Text>
      <TextInput
        style={styles.input}
        value={endDateInput}
        placeholder="YYYY-MM-DD"
        onChangeText={handleEndDateInputChange}
        onFocus={() => setShowEndDatePicker(true)}
      />
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}
      {isReserving ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Button title="Reservar Ferramenta" onPress={handleReserve} color={colors.primary} />
      )}
      {reservationStatus && <Text style={styles.reservationStatus}>Status da Reserva: {reservationStatus}</Text>}

      {/* Botão para abrir o chat */}
      <Button title="Iniciar Chat" onPress={openChat} color={colors.primary} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noImage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  toolName: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  toolPrice: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
    color: '#555',
  },
  toolCategory: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  toolRating: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  toolStatus: {
    fontSize: 16,
    marginBottom: 10,
    color: '#e74c3c',
  },
  detailsSection: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  reservationStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginTop: 10,
    textAlign: 'center',
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default ToolDetail;
