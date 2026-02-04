'use client';

import { useState } from 'react';

export default function TestDbPage() {
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults({ endpoint, status: res.status, ...data });
    } catch (err) {
      setResults({ endpoint, error: String(err) });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Database RLS Tests</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => testEndpoint('/api/test-sessions')} disabled={loading}>
          Test Sessions
        </button>
        <button onClick={() => testEndpoint('/api/test-profiles')} disabled={loading}>
          Test Profiles
        </button>
        <button onClick={() => testEndpoint('/api/test-progress')} disabled={loading}>
          Test Progress
        </button>
        <button onClick={() => testEndpoint('/api/test-attempts')} disabled={loading}>
          Test Attempts
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {results && (
        <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}
