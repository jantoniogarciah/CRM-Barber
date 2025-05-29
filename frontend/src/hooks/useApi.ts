import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import axios from 'axios';

interface UseApi<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    successMessage?: string;
    errorMessage?: string;
  } = {}
): UseApi<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useNotification();

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(...args);
        setData(result);
        if (options.successMessage) {
          success(options.successMessage);
        }
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        let errorMessage = options.errorMessage || 'An error occurred';
        if (err instanceof Error) {
          errorMessage = err.message || errorMessage;
        }
        setError(errorMessage);
        showError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, options, success, showError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
