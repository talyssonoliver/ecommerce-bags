import { useToast } from '@/contexts/ToastContext';

export function useApiErrorHandler() {
  const { addToast } = useToast();
  
  return async function handleApiError(error: unknown) {
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null && 'error' in error) {
      message = String((error).error);
    }
    
    addToast(message, 'error');
    return message;
  };
}