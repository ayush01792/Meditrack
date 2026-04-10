import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { router } from '@/router';
import { queryClient } from '@/lib/queryClient';
import '@/index.css';

// Apply saved theme before first render to avoid flash
const savedTheme = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('theme-storage') ?? '{}');
    return (stored?.state?.theme as string) ?? 'dark';
  } catch {
    return 'dark';
  }
})();

if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          className: '!bg-card !text-foreground !border !border-border shadow-lg',
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
);
