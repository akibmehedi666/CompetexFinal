'use client';

import { useEffect, useState } from 'react';

export default function ApiTestPage() {
  const [data, setData] = useState<{ status: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined');
        }

        const response = await fetch(`${apiUrl}/test.php`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-700">
        {error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Connection Failed</h2>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="bg-green-500/20 border border-green-500 text-green-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Connection Successful</h2>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Message:</strong> {data.message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Connecting to backend...</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Backend URL: <code className="bg-gray-800 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL || 'Not Set'}</code></p>
      </div>
    </div>
  );
}
