import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { sendChatMessage, fetchChatMessages } from '../services/api';
import { RootStackParamList } from '../types/types';
import { colors } from '../components/styles';
import ChatMessage from '../components/ChatMessage';

type Chat = {
  id: number;
  message: string;
  user: {
    id: number;
    name: string;
  };
};

type ChatScreenRouteProps = StackScreenProps<RootStackParamList, 'ChatScreen'>;

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatScreenRouteProps['route']>();
  const { toolId, token } = route.params;

  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatData = await fetchChatMessages(toolId, token);
      setChats(chatData);
    } catch (error) {
      console.error('Error fetching chats', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendChatMessage(message, toolId, token);
      setMessage('');
      loadChats();
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <ChatMessage text={item.message} isUser={item.user.id === toolId} />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.chatList}
      />

      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Digite uma mensagem"
      />

      <Button title="Enviar" onPress={handleSendMessage} />

      {loading && <Text>Carregando...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  chatList: {
    flexGrow: 1,
  },
  input: {
    height: 40,
    borderColor: colors.text,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
});

export default ChatScreen;
