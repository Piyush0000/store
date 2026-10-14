"use client";

import { CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";

import React from "react";

interface SuccessStepProps {
  orderId: string | null;
  paymentMethod: string | null;
}

const SuccessStep = React.memo(function SuccessStep({
  orderId,
  paymentMethod,
}: SuccessStepProps) {
  return (
    <section className="checkout__section">
      <CheckCircle2 size={64} className="checkout__success-icon" />
      <h2 className="checkout__success-heading">Order Confirmed!</h2>
      <p className="checkout__success-order">Order #{orderId?.split("-")[0]}</p>
      <p className="checkout__success-message">
        Your shipment is being packed and will ship to you soon.
      </p>
      <div className="checkout__success-delivery">
        <Truck size={18} />
        <span>
          {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
        </span>
      </div>
      <Link
        href="/catalogue"
        className="checkout__continue-btn checkout__continue-btn--success"
      >
        CONTINUE SHOPPING
      </Link>
    </section>
  );
})

export default SuccessStep;
