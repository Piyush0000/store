"use client";

import {
  Loader2,
  ShieldCheck,
  PhoneCall,
  Lock,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import React from "react";

const IndiaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 30 20" className="checkout__flag">
    <rect width="30" height="20" fill="#FFF" />
    <rect width="30" height="6.67" fill="#FF9933" />
    <rect y="13.33" width="30" height="6.67" fill="#138808" />
    <circle cx="15" cy="10" r="2" fill="#000080" />
    <circle
      cx="15"
      cy="10"
      r="2"
      fill="none"
      stroke="#000080"
      strokeWidth="0.5"
    />
    <circle cx="15" cy="10" r="0.4" fill="#000080" />
  </svg>
);

interface OtpStepProps {
  step: "identify" | "verify";
  phone: string;
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  resendTimer: number;
  isLoading: boolean;
  error: string | null;
  onPhoneChange: (value: string) => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent) => void;
  onSendOtp: () => void;
  onVerifyOtp: () => void;
}

const OtpStep = React.memo(function OtpStep({
  step,
  phone,
  otp,
  otpRefs,
  resendTimer,
  isLoading,
  error,
  onPhoneChange,
  onOtpChange,
  onOtpKeyDown,
  onSendOtp,
  onVerifyOtp,
}: OtpStepProps) {
  if (step === "identify") {
    return (
      <section className="checkout__section checkout__section--sticky">
        <div className="checkout__illustration-container">
          <img
            src="/otp-illustration.png"
            alt="Verify Phone"
            className="checkout__illustration"
          />
        </div>
        <h3 className="checkout__verification-title">
          Verify Your Phone Number
        </h3>
        <p className="checkout__verification-desc">
          Secure checkout requires phone verification.
          <br />
          We&apos;ll send a one-time OTP to continue.
        </p>

        <div className="checkout__verification-badges">
          <div className="checkout__badge-item">
            <div className="checkout__badge-icon-wrapper">
              <ShieldCheck size={16} className="checkout__badge-icon" />
            </div>
            <div className="checkout__badge-text">
              <span>Secure</span>
              <span>Verification</span>
            </div>
          </div>
          <div className="checkout__badge-divider" />
          <div className="checkout__badge-item">
            <div className="checkout__badge-icon-wrapper">
              <PhoneCall size={16} className="checkout__badge-icon" />
            </div>
            <div className="checkout__badge-text">
              <span>No Spam</span>
              <span>Calls</span>
            </div>
          </div>
          <div className="checkout__badge-divider" />
          <div className="checkout__badge-item">
            <div className="checkout__badge-icon-wrapper">
              <Lock size={16} className="checkout__badge-icon" />
            </div>
            <div className="checkout__badge-text">
              <span>OTP Required for</span>
              <span>Delivery Updates</span>
            </div>
          </div>
        </div>

        <div className="checkout__phone-input-container">
          <div className="checkout__country-selector">
            <IndiaFlag />
            <span className="checkout__country-code">+91</span>
            <ChevronDown size={14} className="checkout__caret" />
          </div>
          <div className="checkout__phone-divider" />
          <input
            type="tel"
            value={
              phone.length > 5
                ? `${phone.slice(0, 5)} ${phone.slice(5)}`
                : phone
            }
            onChange={(e) =>
              onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            placeholder="98765 43210"
            maxLength={11}
            className="checkout__phone-field"
          />
        </div>
        {error && (
          <span
            className="checkout__error"
            style={{ marginTop: "-16px", marginBottom: "16px" }}
          >
            {error}
          </span>
        )}

        <button
          className="checkout__send-otp-btn"
          onClick={onSendOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "SEND OTP"
          )}{" "}
          <ArrowRight size={18} />
        </button>
        <div
          className="checkout__powered-by-wrapper"
          style={{ marginTop: "20px" }}
        >
          <div className="checkout__powered-by">
            <span className="checkout__powered-by-text">Powered by</span>
            <img
              src="/evoc-logo.png"
              alt="EvocLabs"
              className="checkout__evoc-logo"
            />
          </div>
        </div>
      </section>
    );
  }

  // step === "verify"
  return (
    <section className="checkout__section checkout__section--sticky">
      <div className="checkout__illustration-container">
        <img
          src="/otp-illustration.png"
          alt="Verify Phone"
          className="checkout__illustration"
        />
      </div>
      <h3 className="checkout__verification-title">Verify Your Phone Number</h3>
      <p className="checkout__verification-desc">
        We&apos;ve sent a 4-digit code to +91 {phone.slice(0, 5)}{" "}
        {phone.slice(5)}
      </p>

      <div className="checkout__otp-inputs" style={{ margin: "24px 0 12px" }}>
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) otpRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => onOtpChange(index, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            className={`checkout__otp-digit ${error ? "error" : ""}`}
          />
        ))}
      </div>
      {error && (
        <span
          className="checkout__error"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          {error}
        </span>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <button
          className="checkout__resend"
          onClick={onSendOtp}
          disabled={resendTimer > 0 || isLoading}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>

      <button
        className="checkout__send-otp-btn"
        onClick={onVerifyOtp}
        disabled={isLoading || otp.join("").length !== 4}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          "VERIFY & CONTINUE"
        )}{" "}
        <ArrowRight size={18} />
      </button>
      <div
        className="checkout__powered-by-wrapper"
        style={{ marginTop: "20px" }}
      >
        <div className="checkout__powered-by">
          <span className="checkout__powered-by-text">Powered by</span>
          <img
            src="/evoc-logo.png"
            alt="EvocLabs"
            className="checkout__evoc-logo"
          />
        </div>
      </div>
    </section>
  );
})

export default OtpStep;
