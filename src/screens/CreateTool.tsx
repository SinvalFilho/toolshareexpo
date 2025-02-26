import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createTool } from '../services/api';
import { ToolCreateForm } from '../types';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';

const CreateTool: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [userId, setUserId] = useState<number>(1);

  const handleCreateTool = async (data: ToolCreateForm) => {
    if (!data.name || !data.description || !data.price || !data.category || !data.status || !data.image) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const parsedPrice = parseFloat(data.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }

    try {
      const toolData: ToolCreateForm = {
        name: data.name,
        description: data.description,
        price: parsedPrice,
        category: data.category,
        status: data.status,
        image: data.image,
        user_id: userId,
      };

      console.log('Criando ferramenta com os dados:', toolData);
      const response = await createTool(toolData);
      console.log('Response:', response);

      Alert.alert('Ferramenta Criada', 'A ferramenta foi cadastrada com sucesso!');

      setName('');
      setDescription('');
      setPrice('');
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
      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
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
            {errors.category && (
              <Text style={styles.errorText}>{errors.category.message}</Text>
            )}
          </View>
        )}
      />

      {/* Picker para seleção de status */}
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Disponível" value="disponível" />
                <Picker.Item label="Locada" value="locada" />
              </Picker>
            </View>
            {errors.status && (
              <Text style={styles.errorText}>{errors.status.message}</Text>
            )}
          </View>
        )}
      />

      {/* Campo para URL da imagem */}
      <TextInput
        style={styles.input}
        placeholder="URL da Imagem"
        value={image}
        onChangeText={setImage}
      />

      <Button title="Cadastrar Ferramenta" onPress={handleSubmit(handleCreateTool)} />
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
  inputContainer: {
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default CreateTool;
