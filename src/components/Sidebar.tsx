import { NavLink } from 'react-router-dom';
import { Calendar, BarChart2, Settings, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { CanvasCourse } from '../utils/canvas';
import { getObjectStorage, STORAGE_KEYS } from '../utils/storage';

export function Sidebar({ courses = [] }: { courses?: CanvasCourse[] }) {
  const [lastSynced, setLastSynced] = useState<string>('Just now');

  const courseColors = useMemo(() => {
    return getObjectStorage<Record<string, string>>(STORAGE_KEYS.COURSE_COLORS, {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // recompute if courses array changes or on mount (though local storage might need app refresh)

  const handleSync = () => {
    setLastSynced('Just now');
    window.location.reload(); 
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    transition: 'all 0.2s',
  });

  return (
    <aside style={{ 
      width: '240px', 
      backgroundColor: 'var(--surface-color)', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px'
    }}>
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Semstr</h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink to="/" style={linkStyle}>
          <Calendar size={20} />
          Timeline
        </NavLink>
        <NavLink to="/workload" style={linkStyle}>
          <BarChart2 size={20} />
          Workload
        </NavLink>
        
        <div style={{ padding: '24px 8px 8px 8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Active Courses
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {courses.map(course => {
            const color = courseColors[course.id] || '#ccc';
            return (
              <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.name}</span>
              </div>
            );
          })}
        </div>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
        <NavLink to="/settings" style={linkStyle}>
          <Settings size={20} />
          Settings
        </NavLink>

        <button 
          onClick={handleSync}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            justifyContent: 'center', backgroundColor: 'transparent',
            border: '1px solid var(--border-color)', color: 'var(--text-muted)',
            marginTop: '16px'
          }}
        >
          <RefreshCw size={16} />
          Sync Now
        </button>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
          Synced {lastSynced}
        </div>
      </div>
    </aside>
  );
}
