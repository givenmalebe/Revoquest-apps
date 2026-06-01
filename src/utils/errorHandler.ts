// Global error handler to suppress AbortErrors and other non-critical errors

export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections (like AbortError)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Suppress AbortError - this is normal Firebase behavior
    if (error?.name === 'AbortError' || 
        error?.message?.includes('aborted') ||
        error?.code === 'cancelled') {
      console.log('🔍 Suppressed AbortError (normal Firebase cleanup)');
      event.preventDefault(); // Prevent the error from showing in console
      return;
    }
    
    // Log other errors normally
    console.error('Unhandled promise rejection:', error);
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Suppress AbortError
    if (error?.name === 'AbortError' || 
        error?.message?.includes('aborted') ||
        error?.code === 'cancelled') {
      console.log('🔍 Suppressed AbortError (normal Firebase cleanup)');
      event.preventDefault();
      return;
    }
    
    // Log other errors normally
    console.error('Global error:', error);
  });

  console.log('✅ Global error handling setup complete');
};
