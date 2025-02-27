import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.24.8.207:3333';

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

export const updateUser = async (
    userId: number,
    userData: {
      name: string;
      email: string;
      phone: string;
      cpf: string;
      address: string;
    }
  ) => {
    try {
      const response = await api.put(`/user/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const backendMessage = error.response.data?.message;
        throw new Error(backendMessage || 'Erro ao atualizar o perfil.');
      }
      throw new Error('Erro desconhecido. Tente novamente.');
    }
  };

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

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  address: string;
  latitude: string;
  longitude: string;
}) => {
  try {
    const response = await api.post('/user', userData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const backendMessage = error.response.data?.message;
      throw new Error(backendMessage || 'Erro ao registrar usuário.');
    }
    throw new Error('Erro desconhecido. Tente novamente.');
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['@access_token', '@user_name', '@user_email', '@user_id', '@user_type']);
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem('@access_token');
  return !!token;
};

export const getUserData = async () => {
  const name = await AsyncStorage.getItem('@user_name');
  const email = await AsyncStorage.getItem('@user_email');
  const type = await AsyncStorage.getItem('@user_type');
  return { name, email, type };
};

export const getUserProfile = async (userId: number) => {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const backendMessage = error.response.data?.message;
        throw new Error(backendMessage || 'Erro ao buscar dados do usuário.');
      }
      throw new Error('Erro desconhecido. Tente novamente.');
    }
  };