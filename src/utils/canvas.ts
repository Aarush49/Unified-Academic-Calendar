import { getStorageItem, STORAGE_KEYS } from './storage';

export interface CanvasCourse {
  id: number | string;
  name: string;
  course_code: string;
  // Canvas returns an enrollment object that dictates if it's active usually or we can rely on workflow_state
  workflow_state?: string; 
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  course_id: number;
  html_url: string;
  has_submitted_submissions?: boolean;
}

export interface CanvasQuiz {
  id: number;
  title: string;
  due_at: string | null;
  course_id: number;
  html_url: string;
}

export interface CanvasEvent {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  workflow_state: string;
  html_url: string;
}

class CanvasClient {
  private get baseUrl(): string {
    const url = getStorageItem(STORAGE_KEYS.CANVAS_URL, '').trim();
    if (!url) return '';
    // Ensure we have https:// prefix
    let cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    // Remove trailing slashes
    cleanUrl = cleanUrl.replace(/\/+$/, '');
    return `${cleanUrl}/api/v1`;
  }

  private get token(): string {
    return getStorageItem(STORAGE_KEYS.CANVAS_TOKEN, '').trim();
  }

  get isConfigured(): boolean {
    return !!this.baseUrl && !!this.token;
  }

  private async fetchAPI<T>(endpoint: string): Promise<T> {
    if (!this.isConfigured) {
      throw new Error('Canvas not configured');
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Canvas API error: ${res.status} ${res.statusText}`);
    }

    // Canvas often wraps JSON responses in a security prefix "while(1);"
    const text = await res.text();
    const cleanText = text.replace(/^while\(1\);/, '');
    
    return JSON.parse(cleanText) as T;
  }

  async getActiveCourses(): Promise<CanvasCourse[]> {
    // ?enrollment_state=active limits to active courses
    const courses = await this.fetchAPI<CanvasCourse[]>('/courses?per_page=100&enrollment_state=active');
    // Filter out restricted aliases and empty names
    return courses.filter(c => c.name && c.workflow_state !== 'unpublished');
  }

  async getAssignments(courseId: number | string): Promise<CanvasAssignment[]> {
    return this.fetchAPI<CanvasAssignment[]>(`/courses/${courseId}/assignments?per_page=100`);
  }

  async getQuizzes(courseId: number | string): Promise<CanvasQuiz[]> {
    return this.fetchAPI<CanvasQuiz[]>(`/courses/${courseId}/quizzes?per_page=100`);
  }

  async getUpcomingEvents(): Promise<CanvasEvent[]> {
    return this.fetchAPI<CanvasEvent[]>('/users/self/upcoming_events?per_page=100');
  }

  async getSubmissionStatus(courseId: number | string, assignmentId: number | string): Promise<{workflow_state: string; submitted_at: string|null}> {
    return this.fetchAPI(`/courses/${courseId}/assignments/${assignmentId}/submissions/self`);
  }
}

export const canvasClient = new CanvasClient();
