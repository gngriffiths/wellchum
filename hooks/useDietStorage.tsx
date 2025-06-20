import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Types for diet entries
export interface DietItem {
  id: string;
  name: string;
  weight: number;
  timestamp: string;
  imageUri?: string; // Add optional image field
}

interface DietStorageContextType {
  items: DietItem[];
  addItem: (item: Omit<DietItem, 'id'>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<DietItem>) => Promise<void>;
  clearItems: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const DietStorageContext = createContext<DietStorageContextType | undefined>(undefined);

// Storage helper functions
const getStorageKey = (userId: string) => `dietEntries_${userId}`;

const saveToStorage = async (items: DietItem[], userId: string) => {
  const itemsJson = JSON.stringify(items);
  const storageKey = getStorageKey(userId);
  
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey, itemsJson);
  } else {
    await SecureStore.setItemAsync(storageKey, itemsJson);
  }
};

const loadFromStorage = async (userId: string): Promise<DietItem[]> => {
  try {
    let itemsJson = null;
    const storageKey = getStorageKey(userId);
    
    if (Platform.OS === 'web') {
      itemsJson = localStorage.getItem(storageKey);
    } else {
      itemsJson = await SecureStore.getItemAsync(storageKey);
    }
    
    if (itemsJson) {
      return JSON.parse(itemsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load diet entries:', error);
    return [];
  }
};

export function DietStorageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<DietItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items when user changes or on startup
  useEffect(() => {
    const loadItems = async () => {
      if (!user?.id) {
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedItems = await loadFromStorage(user.id);
        setItems(loadedItems);
      } catch (e) {
        console.error('Failed to load diet entries:', e);
        setError('Failed to load diet entries');
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [user?.id]);

  const addItem = async (itemData: Omit<DietItem, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newItem: DietItem = {
        ...itemData,
        id: Date.now().toString(),
      };
      
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      await saveToStorage(updatedItems, user.id);
    } catch (e) {
      console.error('Failed to add diet entry:', e);
      setError('Failed to add diet entry');
      throw e;
    }
  };

  const removeItem = async (id: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      await saveToStorage(updatedItems, user.id);
    } catch (e) {
      console.error('Failed to remove diet entry:', e);
      setError('Failed to remove diet entry');
      throw e;
    }
  };

  const updateItem = async (id: string, updates: Partial<DietItem>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedItems = items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      setItems(updatedItems);
      await saveToStorage(updatedItems, user.id);
    } catch (e) {
      console.error('Failed to update diet entry:', e);
      setError('Failed to update diet entry');
      throw e;
    }
  };

  const clearItems = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setItems([]);
      await saveToStorage([], user.id);
    } catch (e) {
      console.error('Failed to clear diet entries:', e);
      setError('Failed to clear diet entries');
      throw e;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: DietStorageContextType = {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    isLoading,
    error,
    clearError,
  };

  return (
    <DietStorageContext.Provider value={contextValue}>
      {children}
    </DietStorageContext.Provider>
  );
}

export function useDietStorage() {
  const context = useContext(DietStorageContext);
  if (context === undefined) {
    throw new Error('useDietStorage must be used within a DietStorageProvider');
  }
  return context;
}