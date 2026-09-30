"use client";

import React, { useState } from "react";
import { Tag, Copy, Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import "./SpecialOffersCard.css";

export interface CouponItem {
  id: string;
  code: string;
  title?: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "BUY_X_GET_Y" | string;
  value: number;
  discountMethod?: "code" | "automatic" | string;
  minOrderValue?: number | null;
  minPurchaseRequirement?: string;
  minPurchaseAmount?: number | null;
  minPurchaseQty?: number | null;
  expiresAt?: string | null;
}

interface SpecialOffersCardProps {
  coupons?: CouponItem[];
}

export default function SpecialOffersCard({ coupons = [] }: SpecialOffersCardProps) {
  const [showAll, setShowAll] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!coupons || coupons.length === 0) {
    return null;
  }

  const handleCopy = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getOfferTitle = (coupon: CouponItem) => {
    if (coupon.title && coupon.title.trim()) return coupon.title;
    switch (coupon.type) {
      case "FREE_SHIPPING":
        return "Free Shipping";
      case "PERCENTAGE":
        return `Flat ${coupon.value}% OFF`;
      case "FIXED":
        return `Flat ₹${coupon.value} OFF`;
      case "BUY_X_GET_Y":
        return "Buy & Get Offer";
      default:
        return coupon.code;
    }
  };

  const getOfferSubtitle = (coupon: CouponItem) => {
    if (coupon.type === "FREE_SHIPPING") {
      if (coupon.minPurchaseRequirement === "min_amount" && coupon.minPurchaseAmount) {
        return `On all orders above ₹${coupon.minPurchaseAmount.toLocaleString("en-IN")}`;
      }
      if (coupon.minPurchaseRequirement === "min_quantity" && coupon.minPurchaseQty) {
        return `On purchase of ${coupon.minPurchaseQty} or more items`;
      }
      if (coupon.minOrderValue) {
        return `On orders above ₹${coupon.minOrderValue.toLocaleString("en-IN")}`;
      }
      return "On all orders (No minimum purchase)";
    }

    if (coupon.minOrderValue && coupon.minOrderValue > 0) {
      return `On orders above ₹${coupon.minOrderValue.toLocaleString("en-IN")}`;
    }

    return "Available on all products";
  };

  const visibleCoupons = showAll ? coupons : coupons.slice(0, 1);
  const hasMore = coupons.length > 1;

  return (
    <div className="special-offers-card">
      <div className="special-offers-card__header">
        <span className="special-offers-card__title">
          SPECIAL OFFERS 🎉 <Sparkles size={14} className="special-offers-sparkle" />
        </span>
        {hasMore && (
          <button
            type="button"
            className="special-offers-card__toggle-btn"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
          >
            <span>{showAll ? "Show Less" : `Show More (${coupons.length})`}</span>
            {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      <div className="special-offers-card__list">
        {visibleCoupons.map((coupon) => {
          const isAuto = coupon.discountMethod === "automatic" || !coupon.code;
          const isCopied = copiedCode === coupon.code;

          return (
            <div key={coupon.id || coupon.code} className="special-offers-card__item">
              <div className="special-offers-card__item-left">
                <div className="special-offers-card__item-icon">
                  <Tag size={16} />
                </div>
                <div className="special-offers-card__item-details">
                  <span className="special-offers-card__item-title">
                    {getOfferTitle(coupon)}
                  </span>
                  <span className="special-offers-card__item-sub">
                    {getOfferSubtitle(coupon)}
                  </span>
                </div>
              </div>

              <div className="special-offers-card__item-right">
                {isAuto ? (
                  <div className="special-offers-card__badge special-offers-card__badge--auto">
                    <span>NO CODE REQUIRED</span>
                    <Copy size={13} className="special-offers-copy-icon" />
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`special-offers-card__badge special-offers-card__badge--code ${
                      isCopied ? "special-offers-card__badge--copied" : ""
                    }`}
                    onClick={() => handleCopy(coupon.code)}
                    title="Click to copy coupon code"
                  >
                    <span>{isCopied ? "COPIED ✓" : coupon.code}</span>
                    {isCopied ? (
                      <Check size={13} className="special-offers-copy-icon" />
                    ) : (
                      <Copy size={13} className="special-offers-copy-icon" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
