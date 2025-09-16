import { useToast } from '@/hooks/use-toast';

// Input validation utilities
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  indianPhone: (phone: string): boolean => {
    // Validates Indian phone numbers: +91 followed by 10 digits or just 10 digits
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s\-]/g, ''));
  },

  gstNumber: (gst: string): boolean => {
    // GST format: 15 characters - 2 state code + 10 PAN + 1 entity + 1 assignment + 1 check digit
    const gstRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;
    return gstRegex.test(gst.toUpperCase());
  },

  price: (price: number): boolean => {
    return price >= 0 && price <= 999999.99 && Number.isFinite(price);
  },

  quantity: (quantity: number): boolean => {
    return Number.isInteger(quantity) && quantity >= 0 && quantity <= 99999;
  },

  sku: (sku: string): boolean => {
    // SKU should be alphanumeric with optional hyphens/underscores, 3-50 chars
    const skuRegex = /^[A-Za-z0-9\-_]{3,50}$/;
    return skuRegex.test(sku);
  },

  name: (name: string): boolean => {
    // Names should be 1-100 chars, letters, spaces, and common punctuation
    const nameRegex = /^[A-Za-z\s\.\-']{1,100}$/;
    return nameRegex.test(name.trim());
  }
};

// Sanitization utilities
export const sanitizers = {
  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  number: (input: string | number): number => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    return Number.isFinite(num) ? num : 0;
  },

  phone: (phone: string): string => {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d\+]/g, '');
  },

  gst: (gst: string): string => {
    return gst.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
};

// Security event logging
export const securityLogger = {
  logValidationFailure: (field: string, value: string, reason: string) => {
    console.warn(`Security: Validation failed for ${field}`, {
      field,
      valueLength: value?.length || 0,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  logSuspiciousInput: (field: string, value: string) => {
    console.warn(`Security: Suspicious input detected in ${field}`, {
      field,
      valueLength: value?.length || 0,
      timestamp: new Date().toISOString()
    });
  },

  logDataAccess: (operation: string, dataType: string) => {
    console.info(`Security: Data access - ${operation}`, {
      operation,
      dataType,
      timestamp: new Date().toISOString()
    });
  }
};

// Error boundary utility
export const createSecureErrorHandler = (componentName: string) => {
  return (error: Error, errorInfo: any) => {
    console.error(`Security: Error in ${componentName}`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Don't expose sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred. Please try again.';
    }
    return error.message;
  };
};

// Rate limiting utility for client-side operations
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      securityLogger.logSuspiciousInput('rate_limit', `Too many attempts for ${identifier}`);
      return false;
    }
    
    recentAttempts.push(now);
    attempts.set(identifier, recentAttempts);
    return true;
  };
};

// Simple client-side encryption for localStorage (basic obfuscation)
const ENCRYPTION_KEY = 'lovable-secure-2024'; // In production, this would be more sophisticated

export const dataProtection = {
  encrypt: (data: any): string => {
    try {
      const jsonString = JSON.stringify(data);
      // Simple XOR encryption for basic obfuscation
      let encrypted = '';
      for (let i = 0; i < jsonString.length; i++) {
        encrypted += String.fromCharCode(
          jsonString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        );
      }
      return btoa(encrypted);
    } catch (error) {
      securityLogger.logSuspiciousInput('encryption', 'Failed to encrypt data');
      return JSON.stringify(data); // Fallback to plain JSON
    }
  },

  decrypt: (encryptedData: string): any => {
    try {
      const encrypted = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(
          encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
        );
      }
      return JSON.parse(decrypted);
    } catch (error) {
      securityLogger.logSuspiciousInput('decryption', 'Failed to decrypt data');
      try {
        return JSON.parse(encryptedData); // Fallback for unencrypted data
      } catch {
        return null;
      }
    }
  }
};

// Validation hook with security logging
export const useSecureValidation = () => {
  const { toast } = useToast();

  const validateAndSanitize = (
    field: string,
    value: any,
    validator: (val: any) => boolean,
    sanitizer?: (val: any) => any,
    customMessage?: string
  ) => {
    try {
      const sanitizedValue = sanitizer ? sanitizer(value) : value;
      
      if (!validator(sanitizedValue)) {
        const message = customMessage || `Please enter a valid ${field}`;
        securityLogger.logValidationFailure(field, String(value), 'Validation failed');
        toast({
          title: "Validation Error",
          description: message,
          variant: "destructive",
        });
        return { isValid: false, value: sanitizedValue };
      }

      return { isValid: true, value: sanitizedValue };
    } catch (error) {
      securityLogger.logSuspiciousInput(field, String(value));
      toast({
        title: "Security Error",
        description: "Invalid input detected. Please try again.",
        variant: "destructive",
      });
      return { isValid: false, value: null };
    }
  };

  return { validateAndSanitize };
};