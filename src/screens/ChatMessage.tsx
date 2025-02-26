import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../components/styles';

const ChatMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  messageText: {
    color: colors.text,
  },
});

export default ChatMessage;