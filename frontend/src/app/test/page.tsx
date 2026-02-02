"use client";

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TestConnection() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      const response = await api.healthCheck();
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      setResult('Error: ' + JSON.stringify(error, null, 2));
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>
      <button 
        onClick={testBackend}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      <pre className="bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}