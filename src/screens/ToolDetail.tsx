import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Button, 
  Alert, 
  ScrollView, 
  Image 
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../types/types';
import { Tool } from '../types';
import { getToolDetails, reserveTool } from '../services/api';

type ToolDetailRouteProp = RouteProp<RootStackParamList, 'ToolDetail'>;

const ToolDetail: React.FC = () => {
  const route = useRoute<ToolDetailRouteProp>();
  const navigation = useNavigation();
  const { toolId } = route.params;
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await getToolDetails(toolId);
        setTool(response);
      } catch (err) {
        setError('Erro ao carregar os detalhes da ferramenta');
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [toolId]);

  const handleReserve = async () => {
    try {
      if (!tool) return;
      // Formata as datas para o formato "YYYY-MM-DD"
      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];

      await reserveTool(tool.id, formattedStart, formattedEnd);
      Alert.alert('Sucesso', 'Reserva realizada com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200ee" />
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes da Ferramenta</Text>

      {tool && (
        <>
          {tool.image && (
            <Image 
              source={{ uri: tool.image }} 
              style={styles.image} 
              resizeMode="cover" 
            />
          )}
          <Text style={styles.toolName}>Nome: {tool.name}</Text>
          <Text style={styles.toolDescription}>Descrição: {tool.description}</Text>
          <Text style={styles.toolPrice}>Preço: R$ {tool.price.toFixed(2)} / dia</Text>
          <Text style={styles.toolCategory}>Categoria: {tool.category}</Text>
          <Text style={styles.toolRating}>Avaliação: {tool.rating || 'Sem avaliação'}</Text>
          <Text style={styles.toolStatus}>Status: {tool.status}</Text>

          {/* Seção de Mais Detalhes */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Mais Detalhes</Text>
            <Text>Localização: {tool.latitude}, {tool.longitude}</Text>
            {/* Aqui você pode adicionar mais informações, como condição da ferramenta, instruções de uso etc. */}
          </View>

          {/* Seção de Reserva */}
          <Text style={styles.label}>Data de Início:</Text>
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => date && setStartDate(date)}
          />

          <Text style={styles.label}>Data de Fim:</Text>
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => date && setEndDate(date)}
          />

          <Button title="Reservar Ferramenta" onPress={handleReserve} />

          {/* Botão para iniciar chat */}
          <View style={styles.chatButton}>
            <Button 
              title="Chat com o Locador" 
              onPress={() => navigation.navigate('Chat', { toolId: tool.id })}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8
  },
  toolName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  toolDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  toolPrice: {
    fontSize: 16,
    marginBottom: 10,
  },
  toolCategory: {
    fontSize: 16,
    marginBottom: 10,
  },
  toolRating: {
    fontSize: 16,
    marginBottom: 10,
  },
  toolStatus: {
    fontSize: 16,
    marginBottom: 10,
  },
  detailsSection: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    width: '100%',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  chatButton: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default ToolDetail;
