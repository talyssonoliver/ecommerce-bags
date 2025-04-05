'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): React.JSX.Element {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
    // Also log to console in development
    console.error('Unhandled error:', error);
  }, [error]);

  return React.createElement(
    'div',
    { className: "flex flex-col items-center justify-center min-h-[70vh] px-4" },
    React.createElement(
      'div',
      { className: "max-w-md text-center" },
      [
        React.createElement(
          'h2',
          { className: "text-2xl font-bold text-red-600 mb-4", key: 'heading' },
          "Something went wrong!"
        ),
        React.createElement(
          'p',
          { className: "text-gray-600 mb-6", key: 'message' },
          process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while processing your request.'
        ),
        React.createElement(
          'button',
          { 
            onClick: reset,
            className: "px-5 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors",
            key: 'button'
          },
          "Try Again"
        )
      ]
    )
  );
}
