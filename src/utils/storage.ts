export const STORAGE_KEYS = {
  CANVAS_TOKEN: 'cs_canvas_token',
  CANVAS_URL: 'cs_canvas_url',
  COURSE_COLORS: 'cs_course_colors',
  REMINDERS_ENABLED: 'cs_reminders_enabled',
  LMS_TYPE: 'cs_lms_type',
  BB_URL: 'cs_bb_url',
  BB_KEY: 'cs_bb_key',
  BB_SECRET: 'cs_bb_secret',
  BB_TOKEN: 'cs_bb_token',
  BB_TOKEN_EXPIRY: 'cs_bb_token_expiry'
};

export function getStorageItem(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  const item = localStorage.getItem(key);
  return item !== null ? item : defaultValue;
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export function getObjectStorage<T>(key: string, defaultValue: T): T {
  const item = getStorageItem(key, '');
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setObjectStorage<T>(key: string, value: T): void {
  setStorageItem(key, JSON.stringify(value));
}
