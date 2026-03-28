import { useEffect } from 'react';
import { differenceInMinutes } from 'date-fns';
import { getStorageItem, STORAGE_KEYS, setObjectStorage, getObjectStorage } from './storage';
import type { UnifiedTask } from '../hooks/useCanvasData';

export function useNotifications(tasks: UnifiedTask[]) {
  useEffect(() => {
    if (getStorageItem(STORAGE_KEYS.REMINDERS_ENABLED) !== 'true') return;

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const notified = getObjectStorage<Record<string, boolean>>('cs_notified_tasks', {});
      let changed = false;

      tasks.forEach(task => {
        if (!task.dueDate || task.isCompleted) return;

        const minsUntilDue = differenceInMinutes(task.dueDate, now);

        const key24 = `${task.id}_24h`;
        if (minsUntilDue > 1430 && minsUntilDue <= 1450 && !notified[key24]) {
          new Notification('Assignment Due Tomorrow', {
            body: `${task.title} is due in 24 hours.`,
            icon: '/vite.svg'
          });
          notified[key24] = true;
          changed = true;
        }

        const key1 = `${task.id}_1h`;
        if (minsUntilDue > 50 && minsUntilDue <= 70 && !notified[key1]) {
          new Notification('Assignment Due Soon!', {
            body: `${task.title} is due in 1 hour.`,
            icon: '/vite.svg'
          });
          notified[key1] = true;
          changed = true;
        }
      });

      if (changed) {
        setObjectStorage('cs_notified_tasks', notified);
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkReminders();
    const intervalId = setInterval(checkReminders, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [tasks]);
}
