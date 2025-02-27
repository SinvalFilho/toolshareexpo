import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { login } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../components/styles';
import Icon from 'react-native-vector-icons/Feather';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(email, password);

      if (data?.token) {
        await AsyncStorage.multiSet([
          ['@access_token', data.token],
          ['@user_name', data.name || ''],
          ['@user_email', data.email || ''],
          ['@user_id', String(data.id) || ''],
          ['@user_type', data.type || ''],
        ]);

        console.log('Login realizado com sucesso!');

        navigation.navigate('Home');
      } else {
        setError('Erro desconhecido ao realizar login');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Credenciais inválidas. Por favor, verifique e tente novamente.');
      } else if (err.message) {
        setError(err.message);
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
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}
        >
          <Icon 
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Register')} 
          style={styles.registerButton}
        >
          <Text style={styles.registerText}>Criar conta</Text>
        </TouchableOpacity>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.divider,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
  },
  eyeIcon: {
    padding: 10,
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
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  registerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});