'use client';

import './skeleton.css';

export function CategorySkeleton() {
  return (
    <div className="skeleton-category-list">
      <div className="skeleton-category-item skeleton-pulse" style={{ width: '60px', height: '14px' }} />
      <div className="skeleton-category-item skeleton-pulse" style={{ width: '100px', height: '14px' }} />
      <div className="skeleton-category-item skeleton-pulse" style={{ width: '80px', height: '14px' }} />
      <div className="skeleton-category-item skeleton-pulse" style={{ width: '90px', height: '14px' }} />
      <div className="skeleton-category-item skeleton-pulse" style={{ width: '70px', height: '14px' }} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="catalogue__grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-card__image skeleton-pulse" />
          <div className="skeleton-card__info">
            <div className="skeleton-card__line skeleton-pulse" style={{ width: '80%', height: '14px' }} />
            <div className="skeleton-card__line skeleton-pulse" style={{ width: '40%', height: '12px' }} />
            <div className="skeleton-card__line skeleton-pulse" style={{ width: '30%', height: '16px' }} />
            <div className="skeleton-card__btn skeleton-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}