'use client';

import { useState, useEffect } from 'react';
import { api, useApiError, ApiError } from '@/lib/api';
import { ErrorHandler } from '@/components/ErrorHandler';
import { ConnectionStatus } from '@/components/ConnectionStatus';

interface Team {
  id: number;
  name: string;
  league?: string;
}

export function TeamsExample() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { handleError } = useApiError();

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleRetry = () => {
    fetchTeams();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading teams...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorHandler 
          error={error} 
          onRetry={handleRetry}
          className="mb-4"
        />
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Teams</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-semibold">{team.name}</h3>
            {team.league && (
              <p className="text-sm text-gray-600">{team.league}</p>
            )}
          </div>
        ))}
      </div>
      <ConnectionStatus />
    </div>
  );
}