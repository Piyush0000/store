'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import '../checkout.css';

export default function FailureClient() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const failed = searchParams.get('failed');

  const errorMessages: Record<string, string> = {
    'hash_mismatch': 'Security verification failed. Please try again.',
    'amount_mismatch': 'There was a discrepancy in the order amount.',
    'payment_declined': 'The payment was declined by your bank.',
    'timeout': 'Payment session timed out.',
    'user_cancel': 'Payment was cancelled by you.',
    'failed': 'The payment could not be processed.',
    'error': 'An unexpected error occurred.',
    'order_not_found': 'Order not found. Please contact support.',
  };

  const displayMessage = errorMessages[reason || failed || ''] || 'Your payment could not be processed. Please try again.';

  return (
    <div className="checkout__failure-wrapper">
      <div className="checkout__failure-card">
        <div className="checkout__failure-icon-wrapper">
          <AlertCircle size={48} />
        </div>

        <h1 className="checkout__failure-title">Payment Failed</h1>
        <p className="checkout__failure-message">{displayMessage}</p>

        <div className="checkout__failure-actions">
          <Link href="/checkout" className="checkout__btn-primary">
            <RefreshCcw size={16} /> Try Again
          </Link>
          <Link href="/catalogue" className="checkout__btn-secondary">
            <ArrowLeft size={16} /> Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}