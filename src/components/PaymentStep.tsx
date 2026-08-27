"use client";

import { Loader2, Banknote, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PaymentStepProps {
  paymentMethod: string | null;
  payUData: any;
  codFee: number;
  displaySubtotal: number;
  displayDiscountTotal: number;
  isLoading: boolean;
  error: string | null;
  onSelectPayment: (method: string) => void;
  onCreateCodOrder: () => void;
  onInitiatePayU: () => void;
  onClearPaymentMethod: () => void;
  onClearError: () => void;
}

const PaymentStep = React.memo(function PaymentStep({
  paymentMethod,
  payUData,
  codFee,
  displaySubtotal,
  displayDiscountTotal,
  isLoading,
  error,
  onSelectPayment,
  onCreateCodOrder,
  onInitiatePayU,
  onClearPaymentMethod,
  onClearError,
}: PaymentStepProps) {
  return (
    <section className="checkout__section">
      <div className="checkout__step-header">
        <h2>PAYMENT METHOD</h2>
      </div>
      <p className="checkout__step-desc">Select your preferred way to pay</p>

      {paymentMethod === null && (
        <div className="checkout__payment-options">
          <div
            className="checkout__payment-card"
            onClick={onCreateCodOrder}
          >
            <div className="checkout__payment-header">
              <div className="checkout__payment-info-left">
                <div className="checkout__payment-icon">
                  <Banknote size={24} />
                </div>
                <div>
                  <p className="checkout__payment-title">Cash on Delivery</p>
                  <p className="checkout__payment-note">+ Rs. {codFee} fee</p>
                </div>
              </div>
              <button className="checkout__payment-select-btn" type="button">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>Select <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>

          <div
            className="checkout__payment-card"
            onClick={() => onSelectPayment("PAYU")}
          >
            <div className="checkout__payment-header">
              <div className="checkout__payment-info-left">
                <div className="checkout__payment-icon">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="checkout__payment-title">Online Payment</p>
                  <p className="checkout__payment-note">
                    Cards, UPI, Net Banking
                  </p>
                </div>
              </div>
              <button className="checkout__payment-select-btn" type="button">
                Select <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {error && <span className="checkout__error">{error}</span>}
        </div>
      )}

      {paymentMethod === "PAYU" && !payUData && (
        <div className="checkout__payment-inline-wrapper">
          <div className="checkout__payment-confirm">
            <div className="checkout__online-info">
              <p>Pay securely via PayU.</p>
              <p className="checkout__secure-badge">🔒 256-bit SSL Encrypted</p>
            </div>
            {error && <span className="checkout__error">{error}</span>}
            <div className="checkout__payment-actions">
              <button
                className="checkout__btn-secondary"
                onClick={onClearPaymentMethod}
              >
                Choose Different Payment
              </button>
              <button
                className="checkout__place-order-btn checkout__place-order-btn--online"
                onClick={onInitiatePayU}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  `PAY NOW - ₹${(displaySubtotal - displayDiscountTotal).toLocaleString()}`
                )}
              </button>
            </div>
          </div>
          <div
            className="checkout__powered-by-wrapper"
            style={{ marginTop: "24px" }}
          >
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
      )}
    </section>
  );
});

export default PaymentStep;