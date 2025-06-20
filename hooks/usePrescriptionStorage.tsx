import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Types for prescription entries
export interface Prescription {
  id: string;
  text: string;
  isArchived: boolean;
  archivedDate?: string;
  createdDate: string;
}

interface PrescriptionStorageContextType {
  prescriptions: Prescription[];
  addPrescription: (text: string) => Promise<void>;
  archivePrescription: (id: string) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  clearPrescriptions: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const PrescriptionStorageContext = createContext<PrescriptionStorageContextType | undefined>(undefined);

// Storage helper functions
const getStorageKey = (userId: string) => `prescriptions_${userId}`;

const saveToStorage = async (prescriptions: Prescription[], userId: string) => {
  const prescriptionsJson = JSON.stringify(prescriptions);
  const storageKey = getStorageKey(userId);
  
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey, prescriptionsJson);
  } else {
    await SecureStore.setItemAsync(storageKey, prescriptionsJson);
  }
};

const loadFromStorage = async (userId: string): Promise<Prescription[]> => {
  try {
    let prescriptionsJson = null;
    const storageKey = getStorageKey(userId);
    
    if (Platform.OS === 'web') {
      prescriptionsJson = localStorage.getItem(storageKey);
    } else {
      prescriptionsJson = await SecureStore.getItemAsync(storageKey);
    }
    
    if (prescriptionsJson) {
      return JSON.parse(prescriptionsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load prescriptions:', error);
    return [];
  }
};

export function PrescriptionStorageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load prescriptions when user changes or on startup
  useEffect(() => {
    const loadPrescriptions = async () => {
      if (!user?.id) {
        setPrescriptions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedPrescriptions = await loadFromStorage(user.id);
        setPrescriptions(loadedPrescriptions);
      } catch (e) {
        console.error('Failed to load prescriptions:', e);
        setError('Failed to load prescriptions');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptions();
  }, [user?.id]);

  const addPrescription = async (text: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newPrescription: Prescription = {
        id: Date.now().toString(),
        text: text.trim(),
        isArchived: false,
        createdDate: new Date().toISOString(),
      };
      
      const updatedPrescriptions = [newPrescription, ...prescriptions];
      setPrescriptions(updatedPrescriptions);
      await saveToStorage(updatedPrescriptions, user.id);
    } catch (e) {
      console.error('Failed to add prescription:', e);
      setError('Failed to add prescription');
      throw e;
    }
  };

  const archivePrescription = async (id: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedPrescriptions = prescriptions.map(prescription => 
        prescription.id === id 
          ? { ...prescription, isArchived: true, archivedDate: new Date().toISOString() }
          : prescription
      );
      setPrescriptions(updatedPrescriptions);
      await saveToStorage(updatedPrescriptions, user.id);
    } catch (e) {
      console.error('Failed to archive prescription:', e);
      setError('Failed to archive prescription');
      throw e;
    }
  };

  const deletePrescription = async (id: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedPrescriptions = prescriptions.filter(prescription => prescription.id !== id);
      setPrescriptions(updatedPrescriptions);
      await saveToStorage(updatedPrescriptions, user.id);
    } catch (e) {
      console.error('Failed to delete prescription:', e);
      setError('Failed to delete prescription');
      throw e;
    }
  };

  const clearPrescriptions = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setPrescriptions([]);
      await saveToStorage([], user.id);
    } catch (e) {
      console.error('Failed to clear prescriptions:', e);
      setError('Failed to clear prescriptions');
      throw e;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: PrescriptionStorageContextType = {
    prescriptions,
    addPrescription,
    archivePrescription,
    deletePrescription,
    clearPrescriptions,
    isLoading,
    error,
    clearError,
  };

  return (
    <PrescriptionStorageContext.Provider value={contextValue}>
      {children}
    </PrescriptionStorageContext.Provider>
  );
}

export function usePrescriptionStorage() {
  const context = useContext(PrescriptionStorageContext);
  if (context === undefined) {
    throw new Error('usePrescriptionStorage must be used within a PrescriptionStorageProvider');
  }
  return context;
}