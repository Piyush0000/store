'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, X } from 'lucide-react';
import { availableStock } from '@/lib/stock';
import {
  variantImages,
  variantSelection,
  type ProductWithVariants,
  type StorefrontVariant,
} from '@/lib/product-variants';
import { isVideoUrl } from '@/lib/media-type';
import './VariantPicker.css';

interface VariantPickerProps {
  product: ProductWithVariants;
  initialVariantId?: string;
  initialQuantity?: number;
  onClose: () => void;
  onAdd: (index: number, quantity: number) => void;
}

function imageFor(product: ProductWithVariants, variant?: StorefrontVariant): string {
  return [...(variant ? variantImages(variant) : []), ...(product.images || [])]
    .find((url) => !isVideoUrl(url)) || '';
}

export default function VariantPicker({ product, initialVariantId, initialQuantity = 1, onClose, onAdd }: VariantPickerProps) {
  const variants = product.variants || [];
  const [selectedId, setSelectedId] = useState(initialVariantId || '');
  const initialVariant = product.variants?.find((variant) => variant.id === initialVariantId);
  const initialStock = initialVariant ? availableStock(product, initialVariant) : 1;
  const [quantity, setQuantity] = useState(Math.max(1, Math.min(initialQuantity, initialStock)));
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const selectedIndex = variants.findIndex((variant) => variant.id === selectedId);
  const selected = selectedIndex >= 0 ? variants[selectedIndex] : undefined;
  const stock = selected ? availableStock(product, selected) : 0;
  const price = Number(selected?.price ?? product.price);
  const hasVariantImages = variants.some((variant) => variantImages(variant).some((url) => !isVideoUrl(url)));

  useEffect(() => {
    const oldOverflow = document.documentElement.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.documentElement.style.overflow = oldOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const addSelected = () => {
    if (!selected || !selected.id || stock <= 0 || quantity > stock) return;
    onAdd(selectedIndex, quantity);
    onClose();
  };

  const previewImage = imageFor(product, selected);

  return createPortal(
    <div className="variant-picker__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={dialogRef} className="variant-picker" role="dialog" aria-modal="true" aria-labelledby="variant-picker-title">
        <header className="variant-picker__header">
          <div>
            <span className="variant-picker__eyebrow">Choose your option</span>
            <h2 id="variant-picker-title">{product.name}</h2>
          </div>
          <button ref={closeRef} type="button" className="variant-picker__close" onClick={onClose} aria-label="Close option picker">
            <X size={20} />
          </button>
        </header>

        <div className="variant-picker__content">
          <div className="variant-picker__preview">
            {previewImage && <img src={previewImage} alt={selected ? `Selected option for ${product.name}` : product.name} />}
            <div>
              <strong>₹{(Number.isFinite(price) ? price : Number(product.price)).toLocaleString('en-IN')}</strong>
              <p>{selected ? Object.entries(variantSelection(product, selected, selectedIndex)).map(([key, value]) => `${key}: ${value}`).join(' · ') : 'Select an option below'}</p>
            </div>
          </div>

          <p className="variant-picker__instruction">Available options</p>
          <div className={`variant-picker__choices ${hasVariantImages ? '' : 'variant-picker__choices--compact'}`}>
            {variants.map((variant, index) => {
              const label = Object.entries(variantSelection(product, variant, index))
                .map(([key, value]) => `${key}: ${value}`).join(' · ');
              const variantStock = availableStock(product, variant);
              const image = imageFor(product, variant);
              return (
                <button
                  key={variant.id || index}
                  type="button"
                  className={`variant-picker__choice ${selectedIndex === index ? 'variant-picker__choice--selected' : ''}`}
                  onClick={() => { setSelectedId(variant.id); setQuantity(1); }}
                  disabled={!variant.id || variantStock <= 0}
                  aria-pressed={selectedIndex === index}
                >
                  {hasVariantImages && image && <img src={image} alt="" loading="lazy" />}
                  <span className="variant-picker__choice-label">{label}</span>
                  <span className="variant-picker__choice-meta">
                    ₹{Number(variant.price ?? product.price).toLocaleString('en-IN')} · {variantStock > 0 ? `${variantStock} available` : 'Sold out'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="variant-picker__footer">
          <div className="variant-picker__quantity">
            <span>Quantity</span>
            <div>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!selected || quantity <= 1} aria-label="Decrease quantity"><Minus size={16} /></button>
              <output>{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(stock, value + 1))} disabled={!selected || quantity >= stock} aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
          </div>
          <button type="button" className="variant-picker__confirm" onClick={addSelected} disabled={!selected || stock <= 0 || quantity > stock}>
            {selected ? `Add selected option · ₹${(price * quantity).toLocaleString('en-IN')}` : 'Select an option to add'}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
