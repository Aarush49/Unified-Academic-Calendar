import { useMemo } from 'react';
import { isThisWeek, isSameWeek, addWeeks, format } from 'date-fns';
import type { UnifiedTask } from '../hooks/useCanvasData';
import { useCanvasContext } from '../hooks/CanvasContext';
import { getObjectStorage, STORAGE_KEYS } from '../utils/storage';

const TYPE_COLORS = {
  Exam: 'var(--color-exam)',
  Homework: 'var(--color-homework)',
  Assignment: 'var(--color-homework)',
  Quiz: 'var(--color-quiz)',
  Project: 'var(--color-project)',
  Reading: 'var(--color-reading)',
  Event: 'var(--text-muted)'
};

const DEFAULT_COURSE_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
];

export function TimelineView() {
  const { tasks, courses, loading } = useCanvasContext();

  const courseColors = useMemo(() => {
    const saved = getObjectStorage<Record<string, string>>(STORAGE_KEYS.COURSE_COLORS, {});
    courses.forEach((c, idx) => {
      if (!saved[c.id]) {
        saved[c.id] = DEFAULT_COURSE_COLORS[idx % DEFAULT_COURSE_COLORS.length];
      }
    });
    return saved;
  }, [courses]);

  const { thisWeek, nextWeek, later } = useMemo(() => {
    const tw: UnifiedTask[] = [];
    const nw: UnifiedTask[] = [];
    const l: UnifiedTask[] = [];

    tasks.forEach(task => {
      if (!task.dueDate) {
        l.push(task);
      } else if (isThisWeek(task.dueDate)) {
        tw.push(task);
      } else if (isSameWeek(task.dueDate, addWeeks(new Date(), 1))) {
        nw.push(task);
      } else {
        l.push(task);
      }
    });

    return { thisWeek: tw, nextWeek: nw, later: l };
  }, [tasks]);

  if (loading) return <div>Loading timeline...</div>;

  const renderTask = (task: UnifiedTask) => {
    const color = courseColors[task.courseId] || '#ccc';
    const badgeColor = TYPE_COLORS[task.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.Assignment;

    return (
      <div key={task.id} className="surface" style={{ 
        display: 'flex', alignItems: 'center', padding: '16px', marginBottom: '12px',
        borderLeft: `4px solid ${color}`
      }}>
        <div style={{ marginRight: '16px' }}>
          <input 
            type="checkbox" 
            checked={task.isCompleted} 
            readOnly 
            style={{ width: '20px', height: '20px', accentColor: color, cursor: 'not-allowed' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--text-muted)' : 'inherit' }}>
              <a href={task.htmlUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {task.title}
              </a>
            </h3>
            <span style={{ 
              backgroundColor: badgeColor, color: '#fff', fontSize: '11px', 
              padding: '2px 8px', borderRadius: '12px', fontWeight: 600 
            }}>
              {task.type}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {task.courseName}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 500 }}>
          {task.dueDate ? format(task.dueDate, 'MMM d, h:mm a') : 'No due date'}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>This Week</h2>
        {thisWeek.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tasks this week.</p> : thisWeek.map(renderTask)}
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Next Week</h2>
        {nextWeek.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No tasks next week.</p> : nextWeek.map(renderTask)}
      </section>

      <section>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Later / All</h2>
        {later.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No future tasks.</p> : later.map(renderTask)}
      </section>
    </div>
  );
}
