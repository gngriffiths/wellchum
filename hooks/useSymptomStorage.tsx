import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Types for symptom entries
export interface SymptomRecord {
  id: string;
  severity: number;
  timestamp: string;
  imageUri?: string;
}

export interface Symptom {
  id: string;
  name: string;
  records: SymptomRecord[];
}

interface SymptomStorageContextType {
  symptoms: Symptom[];
  addSymptom: (symptom: Omit<Symptom, 'id'>) => Promise<void>;
  addRecord: (symptomId: string, record: Omit<SymptomRecord, 'id'>) => Promise<void>;
  removeRecord: (symptomId: string, recordId: string) => Promise<void>;
  removeSymptom: (symptomId: string) => Promise<void>;
  updateSymptom: (id: string, updates: Partial<Symptom>) => Promise<void>;
  clearSymptoms: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const SymptomStorageContext = createContext<SymptomStorageContextType | undefined>(undefined);

// Storage helper functions
const getStorageKey = (userId: string) => `symptomEntries_${userId}`;

const saveToStorage = async (symptoms: Symptom[], userId: string) => {
  const symptomsJson = JSON.stringify(symptoms);
  const storageKey = getStorageKey(userId);
  
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey, symptomsJson);
  } else {
    await SecureStore.setItemAsync(storageKey, symptomsJson);
  }
};

const loadFromStorage = async (userId: string): Promise<Symptom[]> => {
  try {
    let symptomsJson = null;
    const storageKey = getStorageKey(userId);
    
    if (Platform.OS === 'web') {
      symptomsJson = localStorage.getItem(storageKey);
    } else {
      symptomsJson = await SecureStore.getItemAsync(storageKey);
    }
    
    if (symptomsJson) {
      return JSON.parse(symptomsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load symptom entries:', error);
    return [];
  }
};

export function SymptomStorageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load symptoms when user changes or on startup
  useEffect(() => {
    const loadSymptoms = async () => {
      if (!user?.id) {
        setSymptoms([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedSymptoms = await loadFromStorage(user.id);
        setSymptoms(loadedSymptoms);
      } catch (e) {
        console.error('Failed to load symptom entries:', e);
        setError('Failed to load symptom entries');
      } finally {
        setIsLoading(false);
      }
    };

    loadSymptoms();
  }, [user?.id]);

  const addSymptom = async (symptomData: Omit<Symptom, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newSymptom: Symptom = {
        ...symptomData,
        id: Date.now().toString(),
        records: symptomData.records.map(record => ({
          ...record,
          id: record.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      const updatedSymptoms = [newSymptom, ...symptoms];
      setSymptoms(updatedSymptoms);
      await saveToStorage(updatedSymptoms, user.id);
    } catch (e) {
      console.error('Failed to add symptom:', e);
      setError('Failed to add symptom');
      throw e;
    }
  };

  const addRecord = async (symptomId: string, recordData: Omit<SymptomRecord, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newRecord: SymptomRecord = {
        ...recordData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const updatedSymptoms = symptoms.map(symptom => {
        if (symptom.id === symptomId) {
          return {
            ...symptom,
            records: [...symptom.records, newRecord]
          };
        }
        return symptom;
      });
      
      setSymptoms(updatedSymptoms);
      await saveToStorage(updatedSymptoms, user.id);
    } catch (e) {
      console.error('Failed to add symptom record:', e);
      setError('Failed to add symptom record');
      throw e;
    }
  };

  const removeRecord = async (symptomId: string, recordId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedSymptoms = symptoms.map(symptom => {
        if (symptom.id === symptomId) {
          return {
            ...symptom,
            records: symptom.records.filter(record => record.id !== recordId)
          };
        }
        return symptom;
      });
      
      setSymptoms(updatedSymptoms);
      await saveToStorage(updatedSymptoms, user.id);
    } catch (e) {
      console.error('Failed to remove symptom record:', e);
      setError('Failed to remove symptom record');
      throw e;
    }
  };

  const removeSymptom = async (symptomId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedSymptoms = symptoms.filter(symptom => symptom.id !== symptomId);
      setSymptoms(updatedSymptoms);
      await saveToStorage(updatedSymptoms, user.id);
    } catch (e) {
      console.error('Failed to remove symptom:', e);
      setError('Failed to remove symptom');
      throw e;
    }
  };

  const updateSymptom = async (id: string, updates: Partial<Symptom>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedSymptoms = symptoms.map(symptom => 
        symptom.id === id ? { ...symptom, ...updates } : symptom
      );
      setSymptoms(updatedSymptoms);
      await saveToStorage(updatedSymptoms, user.id);
    } catch (e) {
      console.error('Failed to update symptom:', e);
      setError('Failed to update symptom');
      throw e;
    }
  };

  const clearSymptoms = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setSymptoms([]);
      await saveToStorage([], user.id);
    } catch (e) {
      console.error('Failed to clear symptoms:', e);
      setError('Failed to clear symptoms');
      throw e;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: SymptomStorageContextType = {
    symptoms,
    addSymptom,
    addRecord,
    removeRecord,
    removeSymptom,
    updateSymptom,
    clearSymptoms,
    isLoading,
    error,
    clearError,
  };

  return (
    <SymptomStorageContext.Provider value={contextValue}>
      {children}
    </SymptomStorageContext.Provider>
  );
}

export function useSymptomStorage() {
  const context = useContext(SymptomStorageContext);
  if (context === undefined) {
    throw new Error('useSymptomStorage must be used within a SymptomStorageProvider');
  }
  return context;
}