import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        // Don't retry on 4xx client errors
        if (axiosError.response?.status && axiosError.response.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const message = axiosError.response?.data?.message ?? 'Something went wrong';
        toast.error(message);
      },
    },
  },
});
