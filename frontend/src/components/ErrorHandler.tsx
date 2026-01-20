'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Wifi, RefreshCw, Shield, FileX, Server } from 'lucide-react';

export interface ErrorInfo {
  message: string;
  status: number;
  code?: string;
  retry?: () => void;
}

interface ErrorHandlerProps {
  error: ErrorInfo;
  onRetry?: () => void;
  className?: string;
}

const ERROR_CONFIGS = {
  0: {
    icon: Wifi,
    title: 'Connection Problem',
    description: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  400: {
    icon: AlertCircle,
    title: 'Invalid Request',
    description: 'The information provided is incorrect or incomplete.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  401: {
    icon: Shield,
    title: 'Authentication Required',
    description: 'Please log in to access this resource.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  403: {
    icon: Shield,
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  404: {
    icon: FileX,
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  500: {
    icon: Server,
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  502: {
    icon: Server,
    title: 'Service Unavailable',
    description: 'The service is temporarily unavailable. Please try again.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  503: {
    icon: Server,
    title: 'Service Unavailable',
    description: 'The service is temporarily down for maintenance.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

export function ErrorHandler({ error, onRetry, className = '' }: ErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const config = ERROR_CONFIGS[error.status as keyof typeof ERROR_CONFIGS] || ERROR_CONFIGS[500];
  const Icon = config.icon;

  const handleRetry = async () => {
    if (!onRetry && !error.retry) return;
    
    setIsRetrying(true);
    try {
      await (onRetry || error.retry)?.();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${config.color}`}>
            {config.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {error.message || config.description}
          </p>
          {error.code && (
            <p className="mt-1 text-xs text-gray-500">
              Error Code: {error.code}
            </p>
          )}
          {(onRetry || error.retry) && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isRetrying
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : `${config.bgColor} ${config.color} hover:bg-opacity-80 border ${config.borderColor}`
              }`}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast notification component for errors
export function ErrorToast({ error, onClose }: { error: ErrorInfo; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = ERROR_CONFIGS[error.status as keyof typeof ERROR_CONFIGS] || ERROR_CONFIGS[500];
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${config.color}`}>
            {config.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600">
            {error.message || config.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </div>
    </div>
  );
}