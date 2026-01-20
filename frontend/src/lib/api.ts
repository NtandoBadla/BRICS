import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Error types for better error handling
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// HTTP status code to user-friendly message mapping
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You need to log in to access this resource.',
  403: 'You don\'t have permission to access this resource.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists or conflicts with existing data.',
  422: 'The data provided is invalid or incomplete.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service temporarily unavailable. Please try again.',
  504: 'Request timeout. Please check your connection and try again.'
};

// Request timeout configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Create AbortController for request timeout
function createTimeoutController(timeout: number = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

// Enhanced fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const { controller, timeoutId } = createTimeoutController(timeout);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    // Handle different response types
    if (!response.ok) {
      let errorMessage = ERROR_MESSAGES[response.status] || 'An unexpected error occurred.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status-based message
      }
      
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        code: response.status.toString()
      };
      
      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle abort/timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw {
        message: 'Request timeout. Please check your connection and try again.',
        status: 504,
        code: 'TIMEOUT_ERROR'
      } as ApiError;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: 'Unable to connect to the server. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR'
      } as ApiError;
    }
    
    // Re-throw API errors
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw {
      message: 'An unexpected error occurred. Please try again.',
      status: 500,
      code: 'UNKNOWN_ERROR'
    } as ApiError;
  }
}

// API service with retry logic
class ApiService {
  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: ApiError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiRequest<T>(endpoint, options);
      } catch (error) {
        lastError = error as ApiError;
        
        // Don't retry for client errors (4xx) except 408, 429
        if (lastError.status >= 400 && lastError.status < 500 && 
            lastError.status !== 408 && lastError.status !== 429) {
          throw lastError;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff: wait 1s, then 2s, then 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  async login(email: string, password: string) {
    return this.requestWithRetry('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
    role?: string 
  }) {
    return this.requestWithRetry('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers(token: string) {
    return this.requestWithRetry('/users', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }

  async getTeams() {
    return this.requestWithRetry('/football/teams');
  }

  async getFixtures() {
    return this.requestWithRetry('/football/fixtures');
  }

  async getCompetitions() {
    return this.requestWithRetry('/competitions');
  }

  async getMatches() {
    return this.requestWithRetry('/competitions/matches');
  }

  // Health check endpoint
  async healthCheck() {
    return apiRequest('/', { method: 'GET' }, 5000); // 5s timeout for health check
  }
}

export const api = new ApiService();

// Utility function to handle API errors in components
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred. Please try again.';
}

// React hook for API error handling with toast notifications
export function useApiError() {
  const handleError = (error: unknown): ApiError => {
    const apiError: ApiError = {
      message: getErrorMessage(error),
      status: (error && typeof error === 'object' && 'status' in error) 
        ? (error as ApiError).status 
        : 500,
      code: (error && typeof error === 'object' && 'code' in error) 
        ? (error as ApiError).code 
        : 'UNKNOWN_ERROR'
    };
    
    console.error('API Error:', error);
    return apiError;
  };
  
  return { handleError };
}

// Connection status hook
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  // Check network status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check backend availability
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.healthCheck();
        setIsBackendAvailable(true);
      } catch {
        setIsBackendAvailable(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  return { isOnline, isBackendAvailable };
}
