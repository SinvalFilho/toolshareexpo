import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getToolDetails } from '../services/api';  // Função que retorna os detalhes de uma ferramenta

const ToolDetailScreen = ({ route }: any) => {
  const { toolId } = route.params;  // Obtendo o ID da ferramenta
  const [tool, setTool] = useState<any>(null);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const toolDetails = await getToolDetails(toolId);
        setTool(toolDetails);
      } catch (error) {
        setTool(null);
      }
    };

    fetchToolDetails();
  }, [toolId]);

  if (!tool) {
    return (
      <View style={styles.container}>
        <Text>Carregando detalhes da ferramenta...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tool.name}</Text>
      <Text>Preço: R$ {tool.price?.toFixed(2)}</Text>
      <Text>Categoria: {tool.category}</Text>
      <Text>Descrição: {tool.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ToolDetailScreen;
