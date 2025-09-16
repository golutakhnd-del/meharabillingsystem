import React, { useState } from 'react';
import { useSecureValidation, createRateLimiter } from '@/lib/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  maxSubmissions?: number;
  submissionWindowMs?: number;
  className?: string;
}

// Rate limiter for form submissions (5 submissions per minute)
const formSubmissionLimiter = createRateLimiter(5, 60000);

export function SecureForm({ 
  children, 
  onSubmit, 
  maxSubmissions = 5, 
  submissionWindowMs = 60000,
  className = '' 
}: SecureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const { validateAndSanitize } = useSecureValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = 'form_' + window.location.pathname;
    if (!formSubmissionLimiter(clientId)) {
      setShowRateLimitWarning(true);
      setTimeout(() => setShowRateLimitWarning(false), 5000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      
      // Basic sanitization
      const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = value.trim().slice(0, 1000); // Limit input length
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Secure form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {showRateLimitWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Too many submission attempts. Please wait a moment before trying again.
          </AlertDescription>
        </Alert>
      )}
      
      <form 
        onSubmit={handleSubmit} 
        className={className}
        autoComplete="off"
        noValidate
      >
        <fieldset disabled={isSubmitting}>
          {children}
        </fieldset>
      </form>
    </div>
  );
}