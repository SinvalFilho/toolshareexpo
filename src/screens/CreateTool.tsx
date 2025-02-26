import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface ToolFormData {
  name: string;
  description?: string;
  price: string;
  category: string;
  status?: string;
  rating: number;
  image?: string;
}

const CreateTool: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ToolFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: '',
      category: 'Ferramentas Elétricas',
      status: 'disponível',
      rating: 0,
    },
  });

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('@user_id');
      if (storedUserId) setUserId(Number(storedUserId));
    };
    fetchUserId();
  }, []);

  const onSubmit = async (data: ToolFormData) => {
    // Verifica os campos obrigatórios (name, price, category e image)
    if (!data.name || !data.price || !data.category || !data.image) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const parsedPrice = parseFloat(data.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    const toolData = {
      name: data.name,
      description: data.description,
      price: parsedPrice,
      category: data.category,
      status: data.status,
      rating: data.rating,
      image: data.image,
      user_id: userId,
    };

    try {
      const response = await axios.post('http://192.168.18.196:3333/tool', toolData);
      if (response.data.message === 'Tool created') {
        Alert.alert('Ferramenta Criada', 'A ferramenta foi cadastrada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Houve um problema ao criar a ferramenta');
      }
    } catch (error) {
      console.error('Erro ao criar ferramenta:', error);
      Alert.alert('Erro', 'Não foi possível criar a ferramenta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Nova Ferramenta</Text>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Nome é obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nome da Ferramenta"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Descrição"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
          />
        )}
      />
      {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

      <Controller
        control={control}
        name="price"
        rules={{ required: 'Preço é obrigatório' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Preço por período"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {errors.price && <Text style={styles.errorText}>{errors.price.message}</Text>}

      <Controller
        control={control}
        name="category"
        rules={{ required: 'Categoria é obrigatória' }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                <Picker.Item label="Ferramentas Elétricas" value="Ferramentas Elétricas" />
                <Picker.Item label="Ferramentas Manuais" value="Ferramentas Manuais" />
                <Picker.Item label="Medição e instrumentação" value="Medição e instrumentação" />
                <Picker.Item label="Caixas Organizadoras" value="Caixas Organizadoras" />
                <Picker.Item label="Ferramentas para jardim" value="Ferramentas para jardim" />
                <Picker.Item label="Acessórios" value="Acessórios" />
              </Picker>
            </View>
          </View>
        )}
      />
      {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
                <Picker.Item label="Disponível" value="disponível" />
                <Picker.Item label="Locada" value="locada" />
                <Picker.Item label="Em Manutenção" value="em manutenção" />
              </Picker>
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="rating"
        rules={{ required: 'Avaliação é obrigatória' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Avaliação (0 a 5)"
            onBlur={onBlur}
            onChangeText={(val) => onChange(Number(val))}
            value={String(value)}
            keyboardType="numeric"
          />
        )}
      />
      {errors.rating && <Text style={styles.errorText}>{errors.rating.message}</Text>}

      <Controller
        control={control}
        name="image"
        rules={{ required: 'URL da imagem é obrigatória' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="URL da Imagem"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.image && <Text style={styles.errorText}>{errors.image.message}</Text>}

      <Button title="Cadastrar Ferramenta" onPress={handleSubmit(onSubmit)} />
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
    marginBottom: 8,
  },
});

export default CreateTool;
