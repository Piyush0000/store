import { Suspense } from 'react';
import FailureClient from './FailureClient';
import { Loader2 } from 'lucide-react';

export default function FailurePage() {
  return (
    <Suspense fallback={
      <div className="checkout__failure-wrapper">
        <div className="checkout__failure-card">
          <Loader2 size={48} className="checkout__loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    }>
      <FailureClient />
    </Suspense>
  );
}