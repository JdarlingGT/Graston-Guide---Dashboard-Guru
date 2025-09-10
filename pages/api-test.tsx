import { useState } from 'react';

type ApiName = 'wordpress' | 'woocommerce' | 'fluentcrm' | 'supabase';

const apiRoutes: Record<ApiName, string> = {
  wordpress: '/api/wordpress-test',
  woocommerce: '/api/woocommerce-test',
  fluentcrm: '/api/fluentcrm-test',
  supabase: '/api/supabase-test',
};

export default function ApiTestPage() {
  const [results, setResults] = useState<Partial<Record<ApiName, any>>>({});
  const [loading, setLoading] = useState<Partial<Record<ApiName, boolean>>>({});
  const [error, setError] = useState<Partial<Record<ApiName, string>>>({});

  const handleTest = async (api: ApiName) => {
    setLoading((l) => ({ ...l, [api]: true }));
    setError((e) => ({ ...e, [api]: undefined }));
    try {
      const res = await fetch(apiRoutes[api]);
      const data = await res.json();
      setResults((r) => ({ ...r, [api]: data }));
    } catch (err: any) {
      setError((e) => ({ ...e, [api]: err.message || 'Error' }));
    } finally {
      setLoading((l) => ({ ...l, [api]: false }));
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>API Test Dashboard</h1>
      {(['wordpress', 'woocommerce', 'fluentcrm', 'supabase'] as ApiName[]).map((api) => (
        <div key={api} style={{ marginBottom: 32 }}>
          <button onClick={() => handleTest(api)} disabled={loading[api]}>
            {loading[api] ? 'Loading...' : `Test ${api.charAt(0).toUpperCase() + api.slice(1)} API`}
          </button>
          {error[api] && (
            <div style={{ color: 'red', marginTop: 8 }}>Error: {error[api]}</div>
          )}
          {results[api] && (
            <pre style={{ background: '#f4f4f4', padding: 12, marginTop: 8, maxWidth: 600, overflowX: 'auto' }}>
              {JSON.stringify(results[api], null, 2)}
            </pre>
          )}
        </div>
      ))}
      <p>
        Make sure your <code>.env.local</code> is configured with the correct credentials and endpoints for each service.
      </p>
    </div>
  );
}