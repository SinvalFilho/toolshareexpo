import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { login } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../components/styles';

export default function Login({ navigation, onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const data = await login(email, password);
      console.log('Login Response:', data);

      if (data?.token) {
        // Salva os dados relevantes do usuário no AsyncStorage
        await AsyncStorage.multiSet([
          ['@access_token', data.token],
          ['@user_name', data.name || ''],
          ['@user_email', data.email || ''],
          ['@user_id', String(data.id) || ''],
          ['@user_type', data.type || '']
        ]);

        console.log('Dados do usuário salvos:', data);
        
        if (typeof onLogin === 'function') {
          onLogin(data);
        }
        
        navigation.navigate('Home');
      } else {
        setError('Erro desconhecido ao realizar login');
      }
    } catch (err: unknown) {
      console.error('Erro ao realizar login:', err);
    
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        setError(errorResponse.response?.data?.message || 'Credenciais inválidas ou erro na conexão');
      } else {
        setError('Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Button title="Entrar" onPress={handleLogin} color={colors.primary} />
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Criar conta" 
          onPress={() => navigation.navigate('Register')} 
          color={colors.secondary} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  input: {
    height: 50,
    borderColor: colors.divider,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
