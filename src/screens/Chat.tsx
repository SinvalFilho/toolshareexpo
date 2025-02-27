import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { sendChatMessage, fetchChatMessages } from '../services/api'; // Importa as funções da API
import { colors } from '../components/styles';
import ChatMessage from './ChatMessage'; // Importa seu componente ChatMessage

// Definir a interface para os dados de um chat
interface Chat {
  id: number;
  message: string;
  user: {
    id: number;
  };
}

const ChatScreen: React.FC<{ toolId: number, token: string }> = ({ toolId, token }) => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([]); // Tipar o estado 'chats' como uma lista de 'Chat'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar mensagens quando o componente for montado
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
      setMessage(''); // Limpar o campo de mensagem após o envio
      loadChats(); // Recarregar as mensagens
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <ChatMessage text={item.message} isUser={item.user.id === Number(token)} />
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
