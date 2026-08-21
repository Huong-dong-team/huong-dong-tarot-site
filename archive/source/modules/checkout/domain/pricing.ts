export interface CheckoutPricingInput {
  readonly mode: "deposit" | "full-payment";
  readonly quantity: number;
  readonly product: {
    readonly price: number;
    readonly depositAmount: number;
  };
}

export interface CheckoutAmounts {
  readonly unitAmount: number;
  readonly totalAmount: number;
}

/**
 * The caller supplies a catalog product, never a price from the browser.
 * Object fields outside this contract are intentionally ignored.
 */
export function calculateCheckoutAmounts(input: CheckoutPricingInput): CheckoutAmounts {
  const unitAmount = input.mode === "deposit"
    ? input.product.depositAmount
    : input.product.price;

  return {
    unitAmount,
    totalAmount: unitAmount * input.quantity,
  };
}
