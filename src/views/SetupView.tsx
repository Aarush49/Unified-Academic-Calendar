import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setStorageItem, STORAGE_KEYS, setObjectStorage, getStorageItem } from '../utils/storage';
import { canvasClient } from '../utils/canvas';
import { blackboardClient } from '../utils/blackboard';

export function SetupView() {
  const [lmsType, setLmsType] = useState<'canvas' | 'blackboard'>(
    (getStorageItem(STORAGE_KEYS.LMS_TYPE) as 'canvas' | 'blackboard') || 'canvas'
  );

  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  
  const [bbUrl, setBbUrl] = useState('');
  const [bbKey, setBbKey] = useState('');
  const [bbSecret, setBbSecret] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const type = getStorageItem(STORAGE_KEYS.LMS_TYPE, 'canvas');
    if ((type === 'canvas' && canvasClient.isConfigured) || (type === 'blackboard' && blackboardClient.isConfigured)) {
      navigate('/');
    }
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setStorageItem(STORAGE_KEYS.LMS_TYPE, lmsType);

    try {
      if (lmsType === 'canvas') {
        if (!url || !token) throw new Error('Please provide both URL and Token.');
        setStorageItem(STORAGE_KEYS.CANVAS_URL, url.replace(/\/$/, '').replace(/\/api\/v1$/, ''));
        setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, token);
        await canvasClient.getActiveCourses();
      } else {
        if (!bbUrl || !bbKey || !bbSecret) throw new Error('Please provide URL, App Key, and App Secret.');
        setStorageItem(STORAGE_KEYS.BB_URL, bbUrl.replace(/\/$/, ''));
        setStorageItem(STORAGE_KEYS.BB_KEY, bbKey);
        setStorageItem(STORAGE_KEYS.BB_SECRET, bbSecret);
        await blackboardClient.getValidToken();
      }
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate.');
      if (lmsType === 'canvas') {
        setStorageItem(STORAGE_KEYS.CANVAS_URL, '');
        setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, '');
      } else {
        setStorageItem(STORAGE_KEYS.BB_URL, '');
        setStorageItem(STORAGE_KEYS.BB_KEY, '');
        setStorageItem(STORAGE_KEYS.BB_SECRET, '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setStorageItem('cs_demo', 'true');
    setStorageItem(STORAGE_KEYS.LMS_TYPE, 'canvas');
    setStorageItem(STORAGE_KEYS.CANVAS_URL, 'demo.instructure.com');
    setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, 'demo-token');
    
    setObjectStorage(STORAGE_KEYS.COURSE_COLORS, {
      3345: '#185FA5', 2418: '#854F0B', 3354: '#0F6E56', 2326: '#993556'
    });
    
    window.location.href = '/';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="surface" style={{ maxWidth: '450px', width: '100%', padding: '32px' }}>
        <h1 style={{ marginTop: 0, fontSize: '24px', textAlign: 'center' }}>Welcome to Semstr</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
          Connect your LMS to aggregate your assignments, exams, and quizzes.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button 
            type="button"
            onClick={() => { setLmsType('canvas'); setError(''); }}
            style={{ flex: 1, padding: '8px', border: 'none', background: lmsType === 'canvas' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: lmsType === 'canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: lmsType === 'canvas' ? '#0f172a' : '#64748b', cursor: 'pointer', fontWeight: 500 }}
          >
            Canvas
          </button>
          <button 
            type="button"
            onClick={() => { setLmsType('blackboard'); setError(''); }}
            style={{ flex: 1, padding: '8px', border: 'none', background: lmsType === 'blackboard' ? '#fff' : 'transparent', borderRadius: '4px', boxShadow: lmsType === 'blackboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: lmsType === 'blackboard' ? '#0f172a' : '#64748b', cursor: 'pointer', fontWeight: 500 }}
          >
            Blackboard
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {lmsType === 'canvas' ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Canvas Instance URL</label>
                <input type="text" placeholder="e.g. utdallas.instructure.com" value={url} onChange={e => setUrl(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Personal Access Token</label>
                <input type="password" placeholder="Enter your Canvas token" value={token} onChange={e => setToken(e.target.value)} />
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Generate this in Canvas Settings &gt; Approved Integrations.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Blackboard Instance URL</label>
                <input type="text" placeholder="e.g. blackboard.university.edu" value={bbUrl} onChange={e => setBbUrl(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Application Key</label>
                <input type="text" placeholder="Enter REST API Key" value={bbKey} onChange={e => setBbKey(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Application Secret</label>
                <input type="password" placeholder="Enter REST API Secret" value={bbSecret} onChange={e => setBbSecret(e.target.value)} />
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Get these from your institution's admin, or System Admin &gt; REST API Integrations.
                </p>
              </div>
            </>
          )}

          {error && (
            <div style={{ color: 'var(--color-exam)', fontSize: '14px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="primary" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Connecting...' : `Connect ${lmsType === 'canvas' ? 'Canvas' : 'Blackboard'}`}
          </button>
          
          <button 
            type="button" 
            onClick={handleDemo} 
            disabled={loading} 
            style={{ 
              marginTop: '8px', 
              background: 'transparent', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)',
              transition: 'background-color 0.2s ease'
            }}
          >
            Try Demo
          </button>
        </form>
      </div>
    </div>
  );
}
