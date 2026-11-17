export type PartialPaymentConfig = {
  enabled: boolean;
  mode: "percent" | "amount";
  value: number;
  discountMode?: "percent" | "amount";
  discountValue?: number;
};

export type PartialPaymentSplit = {
  prepaidAmount: number;
  codDue: number;
  total: number;
  goodsDue: number;
  discountAmount: number;
};

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

export function splitPartialPayment(
  config: PartialPaymentConfig | null | undefined,
  goodsDue: number,
  codFee: number,
): PartialPaymentSplit | null {
  if (!config?.enabled) return null;
  const due = money(goodsDue);
  if (!(due > 1)) return null;

  const configured = Number(config.value);
  if (!Number.isFinite(configured) || configured <= 0) return null;

  const rawOnline = config.mode === "amount"
    ? configured
    : due * (configured / 100);
  const prepaidAmount = money(rawOnline);

  if (!(prepaidAmount >= 1) || prepaidAmount >= due) return null;

  const fee = Math.max(0, Number(codFee) || 0);
  const rawRemaining = due - prepaidAmount + fee;

  const discValue = Number(config.discountValue) || 0;
  let rawDiscount = 0;
  if (discValue > 0) {
    if (config.discountMode === "amount") {
      rawDiscount = discValue;
    } else {
      rawDiscount = due * (discValue / 100);
    }
  }

  // Deduct specifically from the remaining cash-on-delivery balance, ensuring at least ₹1 COD remains
  const discountAmount = money(Math.min(rawDiscount, Math.max(0, rawRemaining - 1)));
  const codDue = money(Math.max(1, rawRemaining - discountAmount));
  if (!(codDue >= 1)) return null;

  return {
    prepaidAmount,
    codDue,
    total: money(prepaidAmount + codDue),
    goodsDue: due,
    discountAmount,
  };
}
