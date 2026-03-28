import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useCanvasData as useCanvasDataHook } from './useCanvasData';
import type { UnifiedTask } from './useCanvasData';
import type { CanvasCourse } from '../utils/canvas';

interface CanvasContextType {
  tasks: UnifiedTask[];
  courses: CanvasCourse[];
  loading: boolean;
  error: string;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const data = useCanvasDataHook();
  return <CanvasContext.Provider value={data}>{children}</CanvasContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}
