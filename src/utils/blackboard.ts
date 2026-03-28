import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage';

export interface BlackboardCourse {
  id: string; // Internal Blackboard _..._ format
  courseId: string; // e.g. CS101
  name: string;
}

export interface BlackboardEnrollment {
  courseId: string;
  course?: BlackboardCourse;
}

export interface BlackboardGradebookColumn {
  id: string;
  name: string;
  description?: string;
  grading?: {
    due?: string;
  };
}

export interface BlackboardAttempt {
  status: string;
}

class BlackboardClient {
  private get baseUrl() {
    const url = getStorageItem(STORAGE_KEYS.BB_URL);
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }

  private get key() { return getStorageItem(STORAGE_KEYS.BB_KEY); }
  private get secret() { return getStorageItem(STORAGE_KEYS.BB_SECRET); }

  get isConfigured() {
    return !!(this.baseUrl && this.key && this.secret);
  }

  async getValidToken(): Promise<string> {
    const token = getStorageItem(STORAGE_KEYS.BB_TOKEN);
    const expiryStr = getStorageItem(STORAGE_KEYS.BB_TOKEN_EXPIRY);
    
    if (token && expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() < expiry - 60000) {
        return token;
      }
    }

    const authHeader = `Basic ${btoa(`${this.key}:${this.secret}`)}`;
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');

    const res = await fetch(`${this.baseUrl}/learn/api/public/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Failed to authenticate with Blackboard: ${res.statusText}`);
    }

    const data = await res.json();
    const newToken = data.access_token;
    const expiresIn = data.expires_in;

    setStorageItem(STORAGE_KEYS.BB_TOKEN, newToken);
    setStorageItem(STORAGE_KEYS.BB_TOKEN_EXPIRY, (Date.now() + expiresIn * 1000).toString());

    return newToken;
  }

  private async fetchAPI<T>(endpoint: string): Promise<T> {
    const token = await this.getValidToken();
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error(`Blackboard API error: ${res.statusText}`);
    }

    return res.json();
  }

  async getEnrolledCourses(): Promise<BlackboardCourse[]> {
    const data = await this.fetchAPI<{ results: BlackboardEnrollment[] }>('/learn/api/public/v1/users/me/courses?expand=course');
    return (data.results || []).map(e => e.course).filter(Boolean) as BlackboardCourse[];
  }

  async getGradebookColumns(courseId: string): Promise<BlackboardGradebookColumn[]> {
    // Also fetch contents if wanted: GET /learn/api/public/v1/courses/:id/contents
    // But gradebook columns already map exactly to due dates and attempts
    const data = await this.fetchAPI<{ results: BlackboardGradebookColumn[] }>(`/learn/api/public/v1/courses/${courseId}/gradebook/columns`);
    return data.results || [];
  }

  async getAttemptStatus(courseId: string, columnId: string): Promise<boolean> {
    try {
      const data = await this.fetchAPI<{ results: BlackboardAttempt[] }>(`/learn/api/public/v1/courses/${courseId}/gradebook/columns/${columnId}/attempts/me`);
      return data.results && data.results.some(a => a.status === 'Completed' || a.status === 'NeedsGrading');
    } catch {
      return false;
    }
  }
}

export const blackboardClient = new BlackboardClient();
