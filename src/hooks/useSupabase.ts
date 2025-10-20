/**
 * Custom React Hook for Supabase Data Fetching
 * 
 * Provides a simple interface for fetching and managing Supabase data with React
 */

import { useState, useEffect } from 'react';

interface UseSupabaseOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useSupabase<T>(
  queryFn: () => Promise<T>,
  options: UseSupabaseOptions<T> = {}
) {
  const { enabled = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [enabled]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Example usage:
// const { data: users, isLoading, error, refetch } = useSupabase(() => getUsers());

