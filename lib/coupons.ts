export type CouponDefinition = {
  code: string;
  percentageOff: number;
  active: boolean;
  minSubtotal?: number;
};

export type CouponResolution = {
  valid: boolean;
  code?: string;
  percentageOff?: number;
  discountAmount: number;
  message?: string;
};

const LIVE_COUPONS: CouponDefinition[] = [
  {
    code: "LIVE99",
    percentageOff: 99,
    active: true,
    minSubtotal: 1,
  },
];

function normalizeCouponCode(code: string | undefined | null) {
  return (code ?? "").trim().toUpperCase();
}

export function resolveCouponDiscount(input: {
  couponCode?: string | null;
  subtotal: number;
}): CouponResolution {
  const normalizedCode = normalizeCouponCode(input.couponCode);
  const subtotal = Math.max(0, Math.round(input.subtotal));

  if (!normalizedCode) {
    return { valid: false, discountAmount: 0 };
  }

  const coupon = LIVE_COUPONS.find(
    (item) => item.code === normalizedCode && item.active,
  );
  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: "Invalid or inactive coupon code.",
    };
  }

  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon requires minimum subtotal of Rs. ${coupon.minSubtotal}.`,
    };
  }

  const rawDiscount = Math.floor((subtotal * coupon.percentageOff) / 100);
  const discountAmount = Math.min(subtotal, Math.max(0, rawDiscount));

  return {
    valid: true,
    code: coupon.code,
    percentageOff: coupon.percentageOff,
    discountAmount,
    message: `${coupon.percentageOff}% discount applied.`,
  };
}

