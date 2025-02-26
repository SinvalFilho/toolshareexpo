import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tool, ToolData } from '../types';

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

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/session', { email, password });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const backendMessage = error.response.data?.message;
      
      if (error.response.status === 401) {
        throw new Error('Credenciais inválidas. Por favor, verifique e tente novamente.');
      }
      
      if (backendMessage) {
        throw new Error(backendMessage);
      }
    }
    throw new Error('Erro desconhecido. Tente novamente.');
  }
};

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

export const reserveTool = async (
  toolId: number,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await api.post('/reservations', {
      tool_id: toolId,
      start_date: startDate,
      end_date: endDate,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao realizar reserva:', error);
    throw new Error('Erro ao realizar a reserva. Tente novamente.');
  }
};

export const createTool = async (toolData: ToolData) => {
  try {
    const response = await api.post('/tool', toolData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) { 
    console.error('Erro ao criar ferramenta:', error.response?.data);
    throw error;
  }
};

export const getUserReservations = async () => {
  try {
    const response = await api.get('/reservations');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter reservas:', error);
    throw new Error('Erro ao carregar suas reservas.');
  }
};

export const sendChatMessage = async (
  reservationId: number,
  message: string
) => {
  try {
    const response = await api.post(`/reservations/${reservationId}/chat`, { message });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw new Error('Erro ao enviar mensagem. Tente novamente.');
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/category');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    throw new Error('Erro ao carregar categorias');
  }
};

export const getUserData = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    throw error;
  }
};

export const getChats = async (toolId: number) => {
  try {
    const response = await api.get(`/tool/${toolId}/chats`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    throw new Error('Erro ao carregar chats');
  }
};

export const sendToolChatMessage = async (toolId: number, message: string) => {
  try {
    const response = await api.post('/chats', { toolId, message });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw new Error('Erro ao enviar mensagem. Tente novamente.');
  }
};

export default api;