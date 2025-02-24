import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createTool, getCategories } from '../services/api';
import { ToolCreateForm } from '../types';
import { Picker } from '@react-native-picker/picker';

const CreateTool: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [userId, setUserId] = useState<number>(1);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.category);
      } catch (error) {
        console.error('Erro ao carregar categorias', error);
        Alert.alert('Erro', 'Não foi possível carregar as categorias');
      }
    };

    fetchCategories();
  }, []);

  const handleCreateTool = async () => {
    if (!name || !description || !price || !category || !image) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }

    try {
      const toolData: ToolCreateForm = {
        name,
        description,
        price: parsedPrice,
        category,
        status: 'disponível',
        image,
        user_id: userId
      };

      console.log('Criando ferramenta com os dados:', toolData);
      const response = await createTool(toolData);
      console.log('Response:', response);

      Alert.alert('Ferramenta Criada', 'A ferramenta foi cadastrada com sucesso!');

      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImage('');

      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar ferramenta:', error);
      Alert.alert('Erro', 'Não foi possível criar a ferramenta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Nova Ferramenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da Ferramenta"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Preço por período"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* Picker para seleção de categoria */}
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Selecione a Categoria" value="" />
        {categories.map((cat, index) => (
          <Picker.Item key={index} label={cat} value={cat} />
        ))}
      </Picker>

      {/* Campo para URL da imagem */}
      <TextInput
        style={styles.input}
        placeholder="URL da Imagem"
        value={image}
        onChangeText={setImage}
      />

      <Button title="Cadastrar Ferramenta" onPress={handleCreateTool} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  },
});

export default CreateTool;
