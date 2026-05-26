'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '40px',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            marginBottom: '16px',
            color: '#1a1a1a'
          }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '14px 28px',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}