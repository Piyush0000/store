import { Suspense } from 'react';
import SuccessClient from './SuccessClient';
import { Loader2 } from 'lucide-react';

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="checkout__success-container">
        <Loader2 size={48} className="checkout__loading-spinner" />
      </div>
    }>
      <SuccessClient />
    </Suspense>
  );
}