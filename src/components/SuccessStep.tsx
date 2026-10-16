"use client";

import React from "react";
import OrderSuccessAnimation from "@/components/OrderSuccessAnimation";

interface SuccessStepProps {
  orderId: string | null;
  paymentMethod: string | null;
  amount?: number;
  prepaidAmount?: number;
  codDue?: number;
}

const SuccessStep = React.memo(function SuccessStep({
  orderId,
  paymentMethod,
  amount,
  prepaidAmount,
  codDue,
}: SuccessStepProps) {
  return (
    <section className="checkout__section checkout__section--success">
      <OrderSuccessAnimation
        orderId={orderId}
        paymentMethod={paymentMethod}
        amount={amount}
        prepaidAmount={prepaidAmount}
        codDue={codDue}
        orderHref={orderId ? `/orders/${encodeURIComponent(orderId)}` : undefined}
        compact
      />
    </section>
  );
})

export default SuccessStep;
