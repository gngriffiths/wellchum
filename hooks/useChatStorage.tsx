import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Types for chat messages
export interface ChatMessage {
  id: string;
  type: 'text' | 'image';
  content: string;
  timestamp: string;
}

interface ChatStorageContextType {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  clearMessages: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const ChatStorageContext = createContext<ChatStorageContextType | undefined>(undefined);

// Storage helper functions
const getStorageKey = (userId: string) => `chatMessages_${userId}`;

const saveToStorage = async (messages: ChatMessage[], userId: string) => {
  const messagesJson = JSON.stringify(messages);
  const storageKey = getStorageKey(userId);
  
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey, messagesJson);
  } else {
    await SecureStore.setItemAsync(storageKey, messagesJson);
  }
};

const loadFromStorage = async (userId: string): Promise<ChatMessage[]> => {
  try {
    let messagesJson = null;
    const storageKey = getStorageKey(userId);
    
    if (Platform.OS === 'web') {
      messagesJson = localStorage.getItem(storageKey);
    } else {
      messagesJson = await SecureStore.getItemAsync(storageKey);
    }
    
    if (messagesJson) {
      return JSON.parse(messagesJson);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load chat messages:', error);
    return [];
  }
};

export function ChatStorageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages when user changes or on startup
  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id) {
        setMessages([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedMessages = await loadFromStorage(user.id);
        setMessages(loadedMessages);
      } catch (e) {
        console.error('Failed to load chat messages:', e);
        setError('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [user?.id]);

  const addMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newMessage: ChatMessage = {
        ...messageData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      await saveToStorage(updatedMessages, user.id);
    } catch (e) {
      console.error('Failed to add chat message:', e);
      setError('Failed to add message');
      throw e;
    }
  };

  const clearMessages = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setMessages([]);
      await saveToStorage([], user.id);
    } catch (e) {
      console.error('Failed to clear chat messages:', e);
      setError('Failed to clear messages');
      throw e;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: ChatStorageContextType = {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    error,
    clearError,
  };

  return (
    <ChatStorageContext.Provider value={contextValue}>
      {children}
    </ChatStorageContext.Provider>
  );
}

export function useChatStorage() {
  const context = useContext(ChatStorageContext);
  if (context === undefined) {
    throw new Error('useChatStorage must be used within a ChatStorageProvider');
  }
  return context;
}