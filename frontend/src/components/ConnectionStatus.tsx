'use client';

import { useConnectionStatus } from '@/lib/api';
import { Wifi, WifiOff, Server, AlertTriangle } from 'lucide-react';

export function ConnectionStatus() {
  const { isOnline, isBackendAvailable } = useConnectionStatus();

  if (isOnline && isBackendAvailable) {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      {!isOnline && (
        <div className="mb-2 flex items-center space-x-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <WifiOff className="h-4 w-4" />
          <span>No internet connection</span>
        </div>
      )}
      
      {isOnline && !isBackendAvailable && (
        <div className="flex items-center space-x-2 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-700">
          <AlertTriangle className="h-4 w-4" />
          <span>Backend service unavailable</span>
        </div>
      )}
    </div>
  );
}

// Status indicator for header/navbar
export function StatusIndicator() {
  const { isOnline, isBackendAvailable } = useConnectionStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (!isBackendAvailable) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isBackendAvailable) return 'Backend Unavailable';
    return 'Online';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs text-gray-600 hidden sm:inline">
        {getStatusText()}
      </span>
    </div>
  );
}