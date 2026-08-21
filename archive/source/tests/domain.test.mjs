import assert from "node:assert/strict";
import test from "node:test";
import { calculateCheckoutAmounts } from "../modules/checkout/domain/pricing.ts";
import { applyPaymentTransition } from "../modules/checkout/domain/payment-state.ts";

test("recalculates checkout totals from catalog price and ignores a forged client amount", () => {
  const maliciousInput = {
    mode: "deposit",
    quantity: 3,
    product: { price: 899_000, depositAmount: 99_000 },
    amount: 1,
  };

  assert.deepEqual(calculateCheckoutAmounts(maliciousInput), {
    unitAmount: 99_000,
    totalAmount: 297_000,
  });
  assert.deepEqual(
    calculateCheckoutAmounts({ ...maliciousInput, mode: "full-payment" }),
    { unitAmount: 899_000, totalAmount: 2_697_000 },
  );
});

test("covers success, failure, cancel, timeout and refund transitions", () => {
  assert.equal(applyPaymentTransition("pending_payment", "payment.succeeded"), "paid");
  assert.equal(applyPaymentTransition("pending_payment", "payment.failed"), "payment_failed");
  assert.equal(applyPaymentTransition("pending_payment", "payment.canceled"), "payment_canceled");
  assert.equal(applyPaymentTransition("pending_payment", "payment.expired"), "payment_expired");
  assert.equal(applyPaymentTransition("refund_pending", "refund.succeeded"), "refunded");
});

test("is idempotent when the same success transition is applied twice", () => {
  const first = applyPaymentTransition("pending_payment", "payment.succeeded");
  const duplicate = applyPaymentTransition(first, "payment.succeeded");
  assert.equal(first, "paid");
  assert.equal(duplicate, "paid");
});
