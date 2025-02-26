import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importe o Picker
import { createTool } from '../services/api';

const CreateTool: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Ferramentas Elétricas'); // Valor inicial
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('disponível'); // Valor inicial
  const [image, setImage] = useState('');

  const handleSubmit = async () => {
    if (!name || !description || !price || !category) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const toolData = {
      name,
      description,
      price: parseFloat(price),
      category,
      rating: parseFloat(rating || '0'),
      status,
      image,
      latitude: "-23.5505",
      longitude: "-46.6333",
    };

    try {
      const response = await createTool(toolData);
      Alert.alert('Sucesso', response.message);
      console.log('Ferramenta criada:', response.tool);

      // Limpar o formulário
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Ferramentas Elétricas');
      setRating('');
      setStatus('disponível');
      setImage('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar a ferramenta.');
      console.error('Erro ao criar ferramenta:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Ferramenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da ferramenta"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* Picker para Categoria */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Categoria:</Text>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Ferramentas Elétricas" value="Ferramentas Elétricas" />
          <Picker.Item label="Ferramentas Manuais" value="Ferramentas Manuais" />
          <Picker.Item label="Medição e instrumentação" value="Medição e instrumentação" />
          <Picker.Item label="Caixas Organizadoras" value="Caixas Organizadoras" />
          <Picker.Item label="Ferramentas para jardim" value="Ferramentas para jardim" />
          <Picker.Item label="Acessórios" value="Acessórios" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Avaliação (opcional)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />

      {/* Picker para Status */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Status:</Text>
        <Picker
          selectedValue={status}
          onValueChange={(itemValue) => setStatus(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Disponível" value="disponível" />
          <Picker.Item label="Alugada" value="alugada" />
          <Picker.Item label="Em manutenção" value="em manutenção" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="URL da imagem (opcional)"
        value={image}
        onChangeText={setImage}
      />

      <Button title="Criar Ferramenta" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default CreateTool;