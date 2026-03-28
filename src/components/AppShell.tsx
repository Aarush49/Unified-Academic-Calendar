import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { canvasClient } from '../utils/canvas';
import { Sidebar } from './Sidebar';
import { CanvasProvider, useCanvasContext } from '../hooks/CanvasContext';
import { useNotifications } from '../utils/notifications';

// Views
import { TimelineView } from '../views/TimelineView';
import { WorkloadView } from '../views/WorkloadView';
import { SettingsView } from '../views/SettingsView';

function AppLayout() {
  const { tasks, courses, loading, error } = useCanvasContext();
  
  // Initialize notifications logic since this is the global layout wrapping authenticated routing
  useNotifications(tasks);

  const total = tasks.length;
  const completed = tasks.filter(t => t.isCompleted).length;
  const remaining = total - completed;
  const exams = tasks.filter(t => t.type === 'Exam' && !t.isCompleted).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <Sidebar courses={courses} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', height: '100vh' }}>
        
        {/* Global Stats Row */}
        <div style={{ padding: '32px 32px 0 32px' }}>
          <header style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="surface" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{loading ? '-' : total}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Assignments</div>
            </div>
            <div className="surface" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-project)' }}>{loading ? '-' : completed}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completed</div>
            </div>
            <div className="surface" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-homework)' }}>{loading ? '-' : remaining}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Remaining</div>
            </div>
            <div className="surface" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-exam)' }}>{loading ? '-' : exams}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Upcoming Exams</div>
            </div>
          </header>
          {error && <div style={{ color: 'red', marginTop: '16px' }}>Error loading Canvas data: {error}</div>}
        </div>

        <div style={{ flex: 1, padding: '32px' }}>
          <Routes>
            <Route path="/" element={<TimelineView />} />
            <Route path="/workload" element={<WorkloadView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const [isReady] = useState(() => canvasClient.isConfigured);

  useEffect(() => {
    if (!canvasClient.isConfigured) {
      navigate('/setup');
    }
  }, [navigate]);

  if (!isReady) return null;

  return (
    <CanvasProvider>
      <AppLayout />
    </CanvasProvider>
  );
}
