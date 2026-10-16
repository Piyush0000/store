export type PartialPaymentConfig = {
  enabled: boolean;
  mode: "percent" | "amount";
  value: number;
};

export type PartialPaymentSplit = {
  prepaidAmount: number;
  codDue: number;
  total: number;
  goodsDue: number;
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
  const codDue = money(due - prepaidAmount + fee);
  if (!(codDue >= 1)) return null;

  return {
    prepaidAmount,
    codDue,
    total: money(due + fee),
    goodsDue: due,
  };
}
