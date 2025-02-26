import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../components/styles';

const ToolCard: React.FC<{ tool: any; onPress: () => void }> = ({ tool, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{tool.name}</Text>
      <Text style={styles.category}>{tool.category}</Text>
      <Text style={styles.price}>R$ {tool.price.toFixed(2)} / dia</Text>
      {tool.distance && <Text style={styles.distance}>Distância: {tool.distance} km</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 16,
    color: colors.primary,
    marginVertical: 10,
  },
  distance: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default ToolCard;