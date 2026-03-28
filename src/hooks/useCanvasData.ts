import { useState, useEffect } from 'react';
import { canvasClient } from '../utils/canvas';
import type { CanvasCourse } from '../utils/canvas';
import { getStorageItem } from '../utils/storage';

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
      if (getStorageItem('cs_demo') === 'true') {
        const demoCourses = [
          { id: 3345, name: 'CS 3345 — Data Structures', course_code: 'CS', workflow_state: 'active' },
          { id: 2418, name: 'MATH 2418 — Linear Algebra', course_code: 'MATH', workflow_state: 'active' },
          { id: 3354, name: 'CS 3354 — SW Engineering', course_code: 'CS', workflow_state: 'active' },
          { id: 2326, name: 'PHYS 2326 — Electromagnetism', course_code: 'PHYS', workflow_state: 'active' },
        ];
        
        const demoAssign = [
          { id:1, name:'Midterm Exam', courseId:3345, due:'Mon, Apr 7', type:'Exam', done:false },
          { id:2, name:'HW 5 — Trees & Heaps', courseId:3345, due:'Wed, Apr 2', type:'Assignment', done:true },
          { id:3, name:'Chapter 4 Quiz', courseId:2418, due:'Tue, Apr 1', type:'Quiz', done:false },
          { id:4, name:'Linear Transformations HW', courseId:2418, due:'Fri, Apr 4', type:'Assignment', done:false },
          { id:5, name:'Project Milestone 2', courseId:3354, due:'Thu, Apr 3', type:'Project', done:false },
          { id:6, name:'UML Diagrams Reading', courseId:3354, due:'Mon, Mar 31', type:'Reading', done:true },
          { id:7, name:'Lab Report 3 — Circuits', courseId:2326, due:'Wed, Apr 2', type:'Assignment', done:false },
          { id:8, name:'Exam 2 — Electrostatics', courseId:2326, due:'Fri, Apr 11', type:'Exam', done:false },
          { id:9, name:'HW 6 — Graphs', courseId:3345, due:'Mon, Apr 14', type:'Assignment', done:false },
          { id:10, name:'Matrix Exam', courseId:2418, due:'Wed, Apr 16', type:'Exam', done:false },
          { id:11, name:'Sprint 2 Demo', courseId:3354, due:'Thu, Apr 10', type:'Project', done:false },
          { id:12, name:'Wave Optics Quiz', courseId:2326, due:'Tue, Apr 8', type:'Quiz', done:false },
        ];

        const currentYear = new Date().getFullYear();
        const parsedTasks = demoAssign.map(a => {
            const course = demoCourses.find(c => c.id === a.courseId);
            const dueStr = a.due.split(', ')[1]; // extracts "Apr 7"
            return {
              id: `demo_${a.id}`,
              originalId: a.id,
              title: a.name,
              courseId: a.courseId,
              courseName: course?.name || '',
              dueDate: new Date(`${dueStr}, ${currentYear} 23:59:00`),
              type: a.type,
              isCompleted: a.done,
              htmlUrl: '#'
            } as UnifiedTask;
        });

        parsedTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        });

        if (isMounted) {
          setCourses(demoCourses);
          setTasks(parsedTasks);
          setLoading(false);
        }
        return;
      }

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
