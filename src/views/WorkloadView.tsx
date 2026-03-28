import { useMemo } from 'react';
import { useCanvasContext } from '../hooks/CanvasContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { startOfWeek, addDays, isSameDay, format, getWeek } from 'date-fns';

export function WorkloadView() {
  const { tasks, loading } = useCanvasContext();

  const thisWeekData = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 }); 
    
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    
    return days.map(day => {
      const assignedThatDay = tasks.filter(t => t.dueDate && isSameDay(day, t.dueDate));
      return {
        name: format(day, 'EEE'),
        fullDate: format(day, 'MMM d'),
        assignments: assignedThatDay.filter(t => t.type !== 'Exam').length,
        exams: assignedThatDay.filter(t => t.type === 'Exam').length,
      };
    });
  }, [tasks]);

  const heavyWeeks = useMemo(() => {
    const weeksMap: Record<number, { weekStart: Date, taskCount: number, examCount: number }> = {};
    
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const weekIdx = getWeek(task.dueDate);
      if (!weeksMap[weekIdx]) {
        weeksMap[weekIdx] = { weekStart: startOfWeek(task.dueDate, { weekStartsOn: 0 }), taskCount: 0, examCount: 0 };
      }
      
      weeksMap[weekIdx].taskCount += 1;
      if (task.type === 'Exam') {
        weeksMap[weekIdx].examCount += 1;
      }
    });

    const heavy = Object.values(weeksMap)
      .filter(w => w.taskCount >= 3 || w.examCount >= 1)
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
      
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return heavy.filter(w => w.weekStart >= currentWeekStart);
  }, [tasks]);

  if (loading) return <div>Loading workload data...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Workload Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Analyze your upcoming assignments and exams.</p>
      </header>

      <section style={{ marginBottom: '40px' }} className="surface">
        <div style={{ padding: '24px 24px 0' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>This Week's Load</h2>
        </div>
        <div style={{ padding: '24px', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={thisWeekData}
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="assignments" name="Assignments" stackId="a" fill="var(--color-homework)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="exams" name="Exams" stackId="a" fill="var(--color-exam)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px' }}>Heavy Weeks Ahead ⚠️</h2>
        {heavyWeeks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>You're looking good! No unusually heavy weeks mapped out.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {heavyWeeks.map((week, idx) => (
              <div key={idx} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '4px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>Week of {format(week.weekStart, 'MMMM d')}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Exams: {week.examCount} | Tasks: {week.taskCount}
                  </div>
                </div>
                {week.examCount > 0 ? (
                  <div style={{ color: 'var(--color-exam)', fontWeight: 600, fontSize: '14px' }}>
                    Exam approaching!
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-quiz)', fontWeight: 600, fontSize: '14px' }}>
                    Heavy workload
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
