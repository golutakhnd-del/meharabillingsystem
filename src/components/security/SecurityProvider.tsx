import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { securityLogger } from '@/lib/security';

interface SecurityContextType {
  logSecurityEvent: (event: string, details?: any) => void;
  isSecurityModeEnabled: boolean;
  enableSecurityMode: () => void;
  disableSecurityMode: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

interface SecurityProviderProps {
  children: React.ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [isSecurityModeEnabled, setIsSecurityModeEnabled] = useState(true);
  const { toast } = useToast();

  const logSecurityEvent = (event: string, details?: any) => {
    securityLogger.logDataAccess(event, details?.type || 'unknown');
    
    // Show toast for critical security events in development
    if (process.env.NODE_ENV === 'development' && details?.critical) {
      toast({
        title: "Security Event",
        description: `${event}: ${details.message || 'Check console for details'}`,
        variant: "destructive",
      });
    }
  };

  const enableSecurityMode = () => {
    setIsSecurityModeEnabled(true);
    logSecurityEvent('security_mode_enabled');
  };

  const disableSecurityMode = () => {
    setIsSecurityModeEnabled(false);
    logSecurityEvent('security_mode_disabled', { critical: true });
  };

  // Monitor for potential security issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logSecurityEvent('javascript_error', {
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logSecurityEvent('unhandled_promise_rejection', {
        type: 'promise_rejection',
        reason: event.reason
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value: SecurityContextType = {
    logSecurityEvent,
    isSecurityModeEnabled,
    enableSecurityMode,
    disableSecurityMode,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}