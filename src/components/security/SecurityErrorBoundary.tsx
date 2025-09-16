import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { createSecureErrorHandler } from '@/lib/security';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SecurityErrorBoundary extends Component<Props, State> {
  private errorHandler: (error: Error, errorInfo: any) => string;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.errorHandler = createSecureErrorHandler(props.componentName || 'Unknown Component');
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorHandler(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              {process.env.NODE_ENV === 'development' 
                ? this.state.error?.message 
                : 'An error occurred while loading this component. Please try again.'}
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRetry}
              className="mt-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}