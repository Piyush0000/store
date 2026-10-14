"use client";

import React from "react";
import OrderSuccessAnimation from "@/components/OrderSuccessAnimation";

interface SuccessStepProps {
  orderId: string | null;
  paymentMethod: string | null;
}

const SuccessStep = React.memo(function SuccessStep({
  orderId,
  paymentMethod,
}: SuccessStepProps) {
  return (
    <section className="checkout__section checkout__section--success">
      <OrderSuccessAnimation
        orderId={orderId}
        paymentMethod={paymentMethod}
        orderHref={orderId ? `/orders/${encodeURIComponent(orderId)}` : undefined}
        compact
      />
    </section>
  );
})

export default SuccessStep;
