import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useAuth } from './useAuth';

// Types for medication entries
export interface MedicationRecord {
  id: string;
  dosage: string;
  timestamp: string;
  imageUri?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  type: 'prescription' | 'supplement' | 'vitamin' | 'other';
  records: MedicationRecord[];
}

interface MedicationStorageContextType {
  medications: Medication[];
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  addRecord: (medicationId: string, record: Omit<MedicationRecord, 'id'>) => Promise<void>;
  removeRecord: (medicationId: string, recordId: string) => Promise<void>;
  removeMedication: (medicationId: string) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  clearMedications: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const MedicationStorageContext = createContext<MedicationStorageContextType | undefined>(undefined);

// Storage helper functions
const getStorageKey = (userId: string) => `medicationEntries_${userId}`;

const saveToStorage = async (medications: Medication[], userId: string) => {
  const medicationsJson = JSON.stringify(medications);
  const storageKey = getStorageKey(userId);
  
  if (Platform.OS === 'web') {
    localStorage.setItem(storageKey, medicationsJson);
  } else {
    await SecureStore.setItemAsync(storageKey, medicationsJson);
  }
};

const loadFromStorage = async (userId: string): Promise<Medication[]> => {
  try {
    let medicationsJson = null;
    const storageKey = getStorageKey(userId);
    
    if (Platform.OS === 'web') {
      medicationsJson = localStorage.getItem(storageKey);
    } else {
      medicationsJson = await SecureStore.getItemAsync(storageKey);
    }
    
    if (medicationsJson) {
      return JSON.parse(medicationsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Failed to load medication entries:', error);
    return [];
  }
};

export function MedicationStorageProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load medications when user changes or on startup
  useEffect(() => {
    const loadMedications = async () => {
      if (!user?.id) {
        setMedications([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedMedications = await loadFromStorage(user.id);
        setMedications(loadedMedications);
      } catch (e) {
        console.error('Failed to load medication entries:', e);
        setError('Failed to load medication entries');
      } finally {
        setIsLoading(false);
      }
    };

    loadMedications();
  }, [user?.id]);

  const addMedication = async (medicationData: Omit<Medication, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newMedication: Medication = {
        ...medicationData,
        id: Date.now().toString(),
        records: medicationData.records.map(record => ({
          ...record,
          id: record.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };
      
      const updatedMedications = [newMedication, ...medications];
      setMedications(updatedMedications);
      await saveToStorage(updatedMedications, user.id);
    } catch (e) {
      console.error('Failed to add medication:', e);
      setError('Failed to add medication');
      throw e;
    }
  };

  const addRecord = async (medicationId: string, recordData: Omit<MedicationRecord, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newRecord: MedicationRecord = {
        ...recordData,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const updatedMedications = medications.map(medication => {
        if (medication.id === medicationId) {
          return {
            ...medication,
            records: [...medication.records, newRecord]
          };
        }
        return medication;
      });
      
      setMedications(updatedMedications);
      await saveToStorage(updatedMedications, user.id);
    } catch (e) {
      console.error('Failed to add medication record:', e);
      setError('Failed to add medication record');
      throw e;
    }
  };

  const removeRecord = async (medicationId: string, recordId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedMedications = medications.map(medication => {
        if (medication.id === medicationId) {
          return {
            ...medication,
            records: medication.records.filter(record => record.id !== recordId)
          };
        }
        return medication;
      });
      
      setMedications(updatedMedications);
      await saveToStorage(updatedMedications, user.id);
    } catch (e) {
      console.error('Failed to remove medication record:', e);
      setError('Failed to remove medication record');
      throw e;
    }
  };

  const removeMedication = async (medicationId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedMedications = medications.filter(medication => medication.id !== medicationId);
      setMedications(updatedMedications);
      await saveToStorage(updatedMedications, user.id);
    } catch (e) {
      console.error('Failed to remove medication:', e);
      setError('Failed to remove medication');
      throw e;
    }
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedMedications = medications.map(medication => 
        medication.id === id ? { ...medication, ...updates } : medication
      );
      setMedications(updatedMedications);
      await saveToStorage(updatedMedications, user.id);
    } catch (e) {
      console.error('Failed to update medication:', e);
      setError('Failed to update medication');
      throw e;
    }
  };

  const clearMedications = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      setMedications([]);
      await saveToStorage([], user.id);
    } catch (e) {
      console.error('Failed to clear medications:', e);
      setError('Failed to clear medications');
      throw e;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: MedicationStorageContextType = {
    medications,
    addMedication,
    addRecord,
    removeRecord,
    removeMedication,
    updateMedication,
    clearMedications,
    isLoading,
    error,
    clearError,
  };

  return (
    <MedicationStorageContext.Provider value={contextValue}>
      {children}
    </MedicationStorageContext.Provider>
  );
}

export function useMedicationStorage() {
  const context = useContext(MedicationStorageContext);
  if (context === undefined) {
    throw new Error('useMedicationStorage must be used within a MedicationStorageProvider');
  }
  return context;
}