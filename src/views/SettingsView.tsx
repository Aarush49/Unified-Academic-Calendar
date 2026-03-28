import { useState } from 'react';
import { getStorageItem, setStorageItem, getObjectStorage, setObjectStorage, STORAGE_KEYS } from '../utils/storage';
import { useCanvasContext } from '../hooks/CanvasContext';

export function SettingsView() {
  const { courses } = useCanvasContext();
  const [colors, setColors] = useState<Record<string, string>>(() => getObjectStorage(STORAGE_KEYS.COURSE_COLORS, {}));
  const [reminders, setReminders] = useState(() => getStorageItem(STORAGE_KEYS.REMINDERS_ENABLED) === 'true');
  const [savedMsg, setSavedMsg] = useState('');
  
  const lmsType = getStorageItem(STORAGE_KEYS.LMS_TYPE, 'canvas');

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

  const handleSwitchLMS = () => {
    // clear all auth keys to force setup view
    setStorageItem(STORAGE_KEYS.CANVAS_URL, '');
    setStorageItem(STORAGE_KEYS.CANVAS_TOKEN, '');
    setStorageItem(STORAGE_KEYS.BB_URL, '');
    setStorageItem(STORAGE_KEYS.BB_KEY, '');
    setStorageItem(STORAGE_KEYS.BB_SECRET, '');
    setStorageItem(STORAGE_KEYS.BB_TOKEN, '');
    setStorageItem(STORAGE_KEYS.LMS_TYPE, '');
    window.location.href = '/setup';
  };

  const handleColorChange = (courseId: number | string, color: string) => {
    const newColors = { ...colors, [courseId]: color };
    setColors(newColors);
    setObjectStorage(STORAGE_KEYS.COURSE_COLORS, newColors);
    showSaveMessage('Course colors saved. Reloading...');
    setTimeout(() => window.location.reload(), 500);
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
        <h2 style={{ fontSize: '18px', margin: '0 0 16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Connection</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>Active LMS</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Connected to <strong>{lmsType === 'canvas' ? 'Canvas' : 'Blackboard'}</strong>
            </p>
          </div>
          <button type="button" onClick={handleSwitchLMS} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
            Switch LMS
          </button>
        </div>
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
