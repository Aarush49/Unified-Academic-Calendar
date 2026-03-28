import { useState } from 'react';
import { getStorageItem, setStorageItem, getObjectStorage, setObjectStorage, STORAGE_KEYS } from '../utils/storage';
import { useCanvasContext } from '../hooks/CanvasContext';

export function SettingsView() {
  const { courses } = useCanvasContext();
  const [url, setUrl] = useState(() => getStorageItem(STORAGE_KEYS.CANVAS_URL));
  const [token, setToken] = useState(() => getStorageItem(STORAGE_KEYS.CANVAS_TOKEN));
  const [colors, setColors] = useState<Record<string, string>>(() => getObjectStorage(STORAGE_KEYS.COURSE_COLORS, {}));
  const [reminders, setReminders] = useState(() => getStorageItem(STORAGE_KEYS.REMINDERS_ENABLED) === 'true');
  const [savedMsg, setSavedMsg] = useState('');

  const handleToggleReminders = async () => {
    const nextState = !reminders;
    if (nextState) {
      if ('Notification' in window) {
        const p = await Notification.requestPermission();
        if (p === 'granted') {
          setReminders(true);
          setStorageItem(STORAGE_KEYS.REMINDERS_ENABLED, 'true');
        } else {
          alert('Notification permission denied by browser.');
        }
      }
    } else {
      setReminders(false);
      setStorageItem(STORAGE_KEYS.REMINDERS_ENABLED, 'false');
    }
  };

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    setStorageItem(STORAGE_KEYS.CANVAS_URL, url);
    setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, token);
    showSaveMessage('API credentials updated. Reloading...');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleColorChange = (courseId: number, color: string) => {
    const newColors = { ...colors, [courseId]: color };
    setColors(newColors);
    setObjectStorage(STORAGE_KEYS.COURSE_COLORS, newColors);
    showSaveMessage('Course colors saved. Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const showSaveMessage = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure API access, UI preferences, and reminders.</p>
      </header>

      {savedMsg && (
        <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '4px' }}>
          {savedMsg}
        </div>
      )}

      <section className="surface" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px' }}>Canvas API Integration</h2>
        <form onSubmit={handleSaveToken} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Instance URL</label>
            <input 
              type="text" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Personal Access Token</label>
            <input 
              type="password" 
              value={token} 
              onChange={e => setToken(e.target.value)} 
            />
          </div>
          <div>
            <button type="submit" className="primary">Update Credentials</button>
          </div>
        </form>
      </section>

      <section className="surface" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px' }}>Course Colors</h2>
        {courses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No courses loaded to configure colors for.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map(course => (
              <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px' }}>{course.name}</span>
                <input 
                  type="color" 
                  value={colors[course.id] || '#ccc'} 
                  onChange={e => handleColorChange(course.id, e.target.value)}
                  style={{ width: '40px', height: '30px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px' }}>Reminders & Notifications</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={reminders}
            onChange={handleToggleReminders}
            style={{ width: '18px', height: '18px' }}
          />
          <span style={{ fontSize: '14px' }}>Enable Browser Push Notifications for Upcoming Due Dates (24hr & 1hr prior)</span>
        </label>
      </section>
    </div>
  );
}
