import { useState, useEffect } from 'react';
import { canvasClient } from '../utils/canvas';
import type { CanvasCourse } from '../utils/canvas';

export interface UnifiedTask {
  id: string; // prefixed to ensure uniqueness across types
  originalId: string | number;
  title: string;
  courseId: number;
  courseName: string;
  dueDate: Date | null;
  type: 'Assignment' | 'Quiz' | 'Exam' | 'Project' | 'Reading' | 'Event' | 'Homework';
  isCompleted: boolean;
  htmlUrl: string;
}

export function useCanvasData() {
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      if (!canvasClient.isConfigured) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const activeCourses = await canvasClient.getActiveCourses();
        if (!isMounted) return;
        setCourses(activeCourses);

        const allTasks: UnifiedTask[] = [];

        // Parallel fetch for assignments/quizzes for each course
        await Promise.all(activeCourses.map(async (course) => {
          try {
            const [assignments, quizzes] = await Promise.all([
              canvasClient.getAssignments(course.id).catch(() => []),
              canvasClient.getQuizzes(course.id).catch(() => [])
            ]);

            assignments.forEach(a => {
              // Guess type based on name
              let type: UnifiedTask['type'] = 'Assignment';
              const nameLower = a.name.toLowerCase();
              if (nameLower.includes('exam') || nameLower.includes('midterm') || nameLower.includes('final')) type = 'Exam';
              else if (nameLower.includes('quiz')) type = 'Quiz';
              else if (nameLower.includes('project')) type = 'Project';
              else if (nameLower.includes('reading')) type = 'Reading';
              else if (nameLower.includes('hw') || nameLower.includes('homework')) type = 'Homework';

              allTasks.push({
                id: `assign_${a.id}`,
                originalId: a.id,
                title: a.name,
                courseId: course.id,
                courseName: course.name,
                dueDate: a.due_at ? new Date(a.due_at) : null,
                type: type === 'Homework' ? 'Assignment' : type,
                isCompleted: a.has_submitted_submissions || false, // Canvas basic flag, or we could fetch submission status individually (but that's N+1 queries, so we rely on this flag or similar)
                htmlUrl: a.html_url
              });
            });

            quizzes.forEach(q => {
              allTasks.push({
                id: `quiz_${q.id}`,
                originalId: q.id,
                title: q.title,
                courseId: course.id,
                courseName: course.name,
                dueDate: q.due_at ? new Date(q.due_at) : null,
                type: 'Quiz',
                isCompleted: false, // Defaulting, quizzes rarely expose 'has_submitted_submissions' broadly without full payload
                htmlUrl: q.html_url
              });
            });

          } catch (e) {
            console.error(`Failed to fetch for course ${course.id}`, e);
          }
        }));

        if (!isMounted) return;
        
        // Sort by due date (nulls at the end)
        allTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });

        setTasks(allTasks);

      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch Canvas data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { tasks, courses, loading, error };
}
