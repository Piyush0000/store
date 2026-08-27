"use client";

import {
  Loader2,
  Truck,
  Lock,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { CartItem } from "@/components/CartProvider";
import React from "react";

interface OrderSummaryProps {
  step: string;
  isSummaryOpen: boolean;
  onToggleSummary: () => void;
  items: CartItem[];
  orderSummarySubtotal: number | null;
  orderSummaryDiscount: number | null;
  orderSummaryCouponCode: string | null | undefined;
  orderSummaryPaymentMethod: string | null | undefined;
  displaySubtotal: number;
  displayDiscountTotal: number;
  codFee: number;
  paymentMethod: string | null;
  effectiveShippingFee: number;
  shippingLabel: string;
  appliedCoupon: any;
  discountAmount: number;
  couponInput: string;
  couponError: string | null;
  isApplyingCoupon: boolean;
  onCouponInputChange: (v: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

const OrderSummary = React.memo(function OrderSummary({
  step,
  isSummaryOpen,
  onToggleSummary,
  items,
  orderSummarySubtotal,
  orderSummaryDiscount,
  orderSummaryCouponCode,
  orderSummaryPaymentMethod,
  displaySubtotal,
  displayDiscountTotal,
  codFee,
  paymentMethod,
  effectiveShippingFee,
  shippingLabel,
  appliedCoupon,
  discountAmount,
  couponInput,
  couponError,
  isApplyingCoupon,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
}: OrderSummaryProps) {
  const subtotalDisplay = orderSummarySubtotal ?? displaySubtotal;
  const discountDisplay = orderSummaryDiscount ?? displayDiscountTotal;
  const isCod = orderSummaryPaymentMethod === "COD" || paymentMethod === "COD";
  const couponCode = orderSummaryCouponCode ?? appliedCoupon?.code;

  const total = Math.max(
    0,
    subtotalDisplay +
      (isCod ? codFee : 0) +
      effectiveShippingFee -
      discountDisplay,
  );

  return (
    <div className={`checkout__summary ${isSummaryOpen ? "open" : ""}`}>
      <div className="checkout__summary-header" onClick={onToggleSummary}>
        <h2 className="checkout__summary-title">ORDER SUMMARY</h2>
        <div className="checkout__summary-toggle">
          <span className="checkout__summary-toggle-price">
            ₹{total.toLocaleString("en-IN")}
          </span>
          <ChevronDown size={20} className="checkout__summary-toggle-icon" />
        </div>
      </div>

      <div className="checkout__summary-content-wrapper">
        <div className="checkout__summary-content">
          <div className="checkout__summary-items">
            {items.map((item) => (
              <div
                key={`${item.id}-${JSON.stringify(item.variants || {})}`}
                className="checkout__summary-item"
              >
                <img
                  src={item.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="%23f1f5f9"><rect width="60" height="60"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="10">Item</text></svg>'}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={60}
                  height={60}
                />
                <div className="checkout__summary-item-info">
                  <span className="checkout__summary-item-name">
                    {item.name}
                  </span>
                  {item.type === "BUNDLE" && item.items && (
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        marginTop: "2px",
                        lineHeight: "1.3",
                      }}
                    >
                      {item.items.map((i: any) => (
                        <div
                          key={i.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ color: "#94a3b8" }}>•</span>
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {i.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="checkout__summary-item-qty">
                    Qty: {item.quantity}
                  </span>

                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <span className="checkout__summary-item-qty">
                      {Object.entries(item.variants)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </span>
                  )}
                </div>
                <span className="checkout__summary-item-price">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon / Discount Input */}
          {step !== "success" && (
            <div className="checkout__coupon-section">
              <div className="checkout__coupon-input-wrapper">
                <input
                  type="text"
                  placeholder="Discount Code"
                  value={couponInput}
                  onChange={(e) => {
                    onCouponInputChange(e.target.value.toUpperCase());
                  }}
                  disabled={isApplyingCoupon || appliedCoupon !== null}
                  className={`checkout__coupon-input ${couponError ? "error" : ""}`}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={onRemoveCoupon}
                    className="checkout__coupon-btn checkout__coupon-btn--remove"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="checkout__coupon-btn"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      "Apply"
                    )}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="checkout__coupon-error">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="checkout__coupon-success">
                  🎉 Code <strong>{appliedCoupon.code}</strong> applied! You
                  saved ₹{discountAmount.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}

          <div className="checkout__summary-rows">
            <div className="checkout__summary-row">
              <span>Subtotal</span>
              <span>₹{subtotalDisplay.toLocaleString("en-IN")}</span>
            </div>
            {discountDisplay > 0 && (
              <div className="checkout__summary-row checkout__summary-row--green">
                <span>Discount {couponCode && `(${couponCode})`}</span>
                <span>-₹{discountDisplay.toLocaleString("en-IN")}</span>
              </div>
            )}
            {isCod && (
              <div className="checkout__summary-row">
                <span>COD Fee</span>
                <span>₹{codFee}</span>
              </div>
            )}
            {effectiveShippingFee > 0 ? (
              <div className="checkout__summary-row">
                <span>{shippingLabel || "Shipment Fee"}</span>
                <span>₹{effectiveShippingFee}</span>
              </div>
            ) : (
              <div className="checkout__summary-row checkout__summary-row--green">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
            )}
          </div>

          {/* Free Shipping Banner */}
          {effectiveShippingFee === 0 && (
            <div className="checkout__free-shipping-banner animate-fade-in">
              <div className="checkout__free-shipping-icon-container">
                <Truck size={18} className="checkout__free-shipping-icon" />
              </div>
              <div className="checkout__free-shipping-text">
                <span className="checkout__free-shipping-title">Yay! You get FREE shipping 🥳</span>
                <span className="checkout__free-shipping-subtitle">Your order qualifies for complimentary delivery.</span>
              </div>
            </div>
          )}

          <div className="checkout__summary-divider" />
          <div className="checkout__summary-row checkout__summary-row--total">
            <span>Total</span>
            <span className="checkout__summary-total-price">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="checkout__summary-badges">
            <div className="checkout__summary-badge">
              <Lock size={14} />
              <span>Secure Payment</span>
            </div>
            <div className="checkout__summary-badge-divider" />
            <div className="checkout__summary-badge">
              <ShieldCheck size={14} />
              <span>100% Authentic</span>
            </div>
            <div className="checkout__summary-badge-divider" />
            <div className="checkout__summary-badge">
              <RefreshCw size={14} />
              <span>Easy Returns</span>
            </div>
          </div>

          <div className="checkout__powered-by-wrapper">
            <div className="checkout__powered-by">
              <span>Powered by</span>
              <img
                src="/evoc-logo.png"
                alt="EvocLabs"
                className="checkout__evoc-logo"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default OrderSummary;
