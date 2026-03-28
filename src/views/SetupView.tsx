import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem, STORAGE_KEYS } from '../utils/storage';
import { canvasClient } from '../utils/canvas';

export function SetupView() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (canvasClient.isConfigured) {
      navigate('/');
    }
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) {
      setError('Please provide both URL and Token.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Save temporarily to test connection
    setStorageItem(STORAGE_KEYS.CANVAS_URL, url);
    setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, token);
    
    try {
      // Test the credentials by fetching self profile / courses
      await canvasClient.getActiveCourses();
      // If success, navigate home
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Canvas.');
      // clear invalid credentials
      setStorageItem(STORAGE_KEYS.CANVAS_URL, '');
      setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="surface" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h1 style={{ marginTop: 0, fontSize: '24px', textAlign: 'center' }}>Welcome to CourseSync</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
          Connect your Canvas account to aggregate your assignments, exams, and quizzes.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Canvas Instance URL
            </label>
            <input 
              type="text" 
              placeholder="e.g. utdallas.instructure.com" 
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Personal Access Token
            </label>
            <input 
              type="password" 
              placeholder="Enter your Canvas token" 
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Generate this in Canvas Settings &gt; Approved Integrations.
            </p>
          </div>

          {error && (
            <div style={{ color: 'var(--color-exam)', fontSize: '14px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Connecting...' : 'Connect Canvas'}
          </button>
        </form>
      </div>
    </div>
  );
}
