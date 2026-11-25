'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Storefront Error Boundary]:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      backgroundColor: '#fafafa',
      color: '#111827'
    }}>
      <div style={{
        maxWidth: '480px',
        padding: '36px 32px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '24px'
        }}>
          ⚠️
        </div>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '10px',
          color: '#111827',
          letterSpacing: '-0.02em'
        }}>
          Store Temporarily Unavailable
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: 1.5,
          marginBottom: '28px'
        }}>
          We are experiencing a momentary connection issue. Please retry in a few moments.
        </p>
        <button
          onClick={() => reset()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 28px',
            backgroundColor: '#111827',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#111827')}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
