import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { register } from '../services/auth';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    if (field === 'cpf') {
      const formattedCpf = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
      setForm({ ...form, cpf: formattedCpf });
    } else if (field === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 11);
      let formattedPhone = numericValue;
      if (numericValue.length <= 2) {
        formattedPhone = `(${numericValue}`;
      } else if (numericValue.length <= 7) {
        formattedPhone = `(${numericValue.slice(0, 2)})${numericValue.slice(2)}`;
      } else {
        formattedPhone = `(${numericValue.slice(0, 2)})${numericValue.slice(2, 7)}-${numericValue.slice(7)}`;
      }
      setForm({ ...form, phone: formattedPhone });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permissão para acessar a localização foi negada.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setForm({
        ...form,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      });
      Alert.alert('Localização obtida com sucesso!');
    } catch (error) {
      Alert.alert('Erro ao obter localização', (error as Error).message);
    }
  };

  const handleRegister = async () => {
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('CPF inválido', 'O CPF deve conter 11 dígitos.');
      return;
    }

    if (form.phone.replace(/\D/g, '').length !== 11) {
      Alert.alert('Telefone inválido', 'O telefone deve conter 11 dígitos.');
      return;
    }

    if (!form.latitude || !form.longitude) {
      Alert.alert('Localização não obtida', 'Por favor, obtenha a localização antes de continuar.');
      return;
    }

    setIsLoading(true);

    try {
      await register(form); // Usa a função de registro do auth.ts
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
      setIsLoading(false);
      // Navegar para a tela de login ou home após o registro
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao registrar usuário.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro de Usuário</Text>

      <TextInput
        placeholder="Nome"
        value={form.name}
        onChangeText={(value) => handleChange('name', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={form.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={form.password}
        onChangeText={(value) => handleChange('password', value)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Telefone (00)90000-0000"
        value={form.phone}
        onChangeText={(value) => handleChange('phone', value)}
        keyboardType="phone-pad"
        style={styles.input}
        maxLength={15}
      />
      <TextInput
        placeholder="CPF 000.000.000-00"
        value={form.cpf}
        onChangeText={(value) => handleChange('cpf', value)}
        keyboardType="numeric"
        style={styles.input}
        maxLength={14}
      />
      <TextInput
        placeholder="Endereço"
        value={form.address}
        onChangeText={(value) => handleChange('address', value)}
        style={styles.input}
      />

      <View style={styles.locationContainer}>
        <TextInput
          placeholder="Latitude"
          value={form.latitude}
          editable={false}
          style={[styles.input, styles.locationInput]}
        />
        <TextInput
          placeholder="Longitude"
          value={form.longitude}
          editable={false}
          style={[styles.input, styles.locationInput]}
        />
      </View>

      <TouchableOpacity onPress={getLocation} style={styles.locationButton}>
        <Text style={styles.buttonText}>Obter Localização Atual</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={styles.registerButton} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  locationButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});