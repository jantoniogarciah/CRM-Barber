import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface UseNotification {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const useNotification = (): UseNotification => {
  const success = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const info = useCallback((message: string) => {
    toast(message, {
      icon: '🔔',
    });
  }, []);

  const warning = useCallback((message: string) => {
    toast(message, {
      icon: '⚠️',
    });
  }, []);

  return {
    success,
    error,
    info,
    warning,
  };
};
