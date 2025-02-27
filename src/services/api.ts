import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tool } from '../types';

const API_BASE_URL = 'http://192.168.18.196:3333';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

export const getTools = async (): Promise<{ tools: Tool[] }> => {
  try {
    const response = await api.get('/tool');
    return { tools: response.data.tools };
  } catch (error) {
    console.error('Erro ao buscar ferramentas:', error);
    throw error;
  }
};

export const getNearbyTools = async (latitude: number, longitude: number) => {
  try {
    const response = await api.get(`/tool`, {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar ferramentas próximas:', error);
    throw new Error('Erro ao carregar ferramentas próximas.');
  }
};

export const getToolDetails = async (toolId: number) => {
  try {
    const response = await api.get(`/tool/${toolId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os detalhes da ferramenta:', error);
    throw new Error('Erro ao carregar os detalhes da ferramenta');
  }
};
;

export const createTool = async (toolData: {
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  status: string;
  image: string;
  latitude: string;
  longitude: string;
}): Promise<{ message: string; tool: Tool }> => {
  try {
    const response = await api.post('/tools', toolData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ferramenta:', error);
    throw new Error('Erro ao criar a ferramenta. Tente novamente.');
  }
};

export const reserveTool = async (reservationData: any, token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reservation`, reservationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro no reserveTool:', error);
    throw error;
  }
};

export default api;