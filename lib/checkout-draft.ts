import { DELIVERY_SLOT_OPTIONS } from "@/lib/shipping-rules";

export type CheckoutDraft = {
  fullName: string;
  phone: string;
  email: string;
  deliveryPincode: string;
  address: string;
  deliveryDate: string;
  deliverySlot: string;
  deliveryTime: string;
  cakeMessage: string;
  senderName: string;
};

export const CHECKOUT_DRAFT_STORAGE_KEY = "ock-checkout-draft";

export const defaultCheckoutDraft: CheckoutDraft = {
  fullName: "",
  phone: "",
  email: "",
  deliveryPincode: "",
  address: "",
  deliveryDate: "",
  deliverySlot: DELIVERY_SLOT_OPTIONS[0],
  deliveryTime: "",
  cakeMessage: "",
  senderName: "",
};

export function readCheckoutDraft(): CheckoutDraft {
  if (typeof window === "undefined") {
    return defaultCheckoutDraft;
  }

  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (!raw) {
      return defaultCheckoutDraft;
    }

    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    return {
      ...defaultCheckoutDraft,
      ...parsed,
    };
  } catch {
    return defaultCheckoutDraft;
  }
}

export function writeCheckoutDraft(value: CheckoutDraft) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKOUT_DRAFT_STORAGE_KEY, JSON.stringify(value));
}
