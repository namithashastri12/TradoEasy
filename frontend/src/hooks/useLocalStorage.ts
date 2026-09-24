import { useState, useEffect } from 'react';
import { SRObservation, FilterState } from '../types/market';

const SR_STORAGE_KEY = 'tradoeasy_sr_notes_v1';
const FILTER_STORAGE_KEY = 'tradoeasy_filter_state_v1';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

/**
 * Custom hook dedicated to managing Support and Resistance observations.
 * Persists observations keyed by normalized symbol.
 */
export function useSRObservations() {
  const [observations, setObservations] = useLocalStorage<Record<string, SRObservation>>(
    SR_STORAGE_KEY,
    {}
  );

  const updateSR = (symbol: string, field: 'support' | 'resistance', value: string) => {
    setObservations((prev) => {
      const current = prev[symbol] || { support: '', resistance: '' };
      return {
        ...prev,
        [symbol]: {
          ...current,
          [field]: value.trim(),
        },
      };
    });
  };

  const clearAllNotes = () => {
    setObservations({});
    try {
      window.localStorage.removeItem(SR_STORAGE_KEY);
    } catch (e) {
      console.warn('Error clearing S/R notes from localStorage:', e);
    }
  };

  return {
    observations,
    updateSR,
    clearAllNotes,
  };
}

/**
 * Hook for persisting and restoring filter state across reloads.
 */
export function useFilterPersistence(defaultState: FilterState) {
  return useLocalStorage<FilterState>(FILTER_STORAGE_KEY, defaultState);
}
