import { useState, useEffect } from 'react';
import { dataProtection, securityLogger } from '@/lib/security';

export function useSecureLocalStorage<T>(key: string, initialValue: T, encrypt: boolean = false) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        securityLogger.logDataAccess('read', key);
        if (encrypt) {
          const decryptedData = dataProtection.decrypt(item);
          return decryptedData !== null ? decryptedData : initialValue;
        }
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      securityLogger.logSuspiciousInput('localStorage_read', `Failed to read ${key}`);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      securityLogger.logDataAccess('write', key);
      
      if (encrypt) {
        const encryptedData = dataProtection.encrypt(valueToStore);
        window.localStorage.setItem(key, encryptedData);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      securityLogger.logSuspiciousInput('localStorage_write', `Failed to write ${key}`);
    }
  };

  // Data validation on retrieval
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        let parsedData;
        if (encrypt) {
          parsedData = dataProtection.decrypt(item);
        } else {
          parsedData = JSON.parse(item);
        }
        
        // Basic type validation
        if (typeof parsedData !== typeof initialValue) {
          console.warn(`Type mismatch for localStorage key "${key}". Resetting to initial value.`);
          setValue(initialValue);
        }
      }
    } catch (error) {
      console.error(`Data validation failed for localStorage key "${key}":`, error);
      setValue(initialValue);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}