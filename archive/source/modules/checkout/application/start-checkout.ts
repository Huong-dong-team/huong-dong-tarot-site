import { sha256Hex } from "@/lib/crypto";
import { createOpaqueToken } from "@/lib/id";
import type { ProductRepository } from "@/modules/catalog/domain/product";
import {
  CheckoutError,
  type CheckoutOrderRepository,
  type CheckoutQuote,
  type PaymentGateway,
  type StartCheckoutCommand,
  type StartCheckoutResult,
} from "@/modules/checkout/domain/checkout";
import { calculateCheckoutAmounts } from "@/modules/checkout/domain/pricing";

const MAX_CHECKOUT_QUANTITY = 4;

interface StartCheckoutDependencies {
  readonly products: ProductRepository;
  readonly orders: CheckoutOrderRepository;
  readonly paymentGateway: PaymentGateway;
  readonly createId?: () => string;
  readonly createToken?: () => string;
  readonly now?: () => Date;
}

export class StartCheckout {
  private readonly createId: () => string;
  private readonly createToken: () => string;
  private readonly now: () => Date;

  constructor(private readonly dependencies: StartCheckoutDependencies) {
    this.createId = dependencies.createId ?? (() => crypto.randomUUID());
    this.createToken = dependencies.createToken ?? createOpaqueToken;
    this.now = dependencies.now ?? (() => new Date());
  }

  async execute(command: StartCheckoutCommand): Promise<StartCheckoutResult> {
    if (
      !Number.isInteger(command.quantity) ||
      command.quantity < 1 ||
      command.quantity > MAX_CHECKOUT_QUANTITY
    ) {
      throw new CheckoutError(
        "invalid_quantity",
        `Số lượng phải là số nguyên từ 1 đến ${MAX_CHECKOUT_QUANTITY}.`,
      );
    }

    validateReturnUrl(command.returnUrl);

    const product = await this.dependencies.products.findById(command.productId);
    if (!product) {
      throw new CheckoutError("product_not_found", "Không tìm thấy phiên bản đã chọn.");
    }

    if (!(["deposit-open", "preorder", "available"] as const).includes(product.status as "deposit-open" | "preorder" | "available")) {
      throw new CheckoutError(
        "product_not_for_sale",
        "Phiên bản này chưa được phép nhận thanh toán.",
      );
    }

    if (!this.dependencies.paymentGateway.supports(command.paymentMethod)) {
      throw new CheckoutError(
        this.dependencies.paymentGateway.provider === "disabled"
          ? "payment_provider_not_configured"
          : "payment_method_not_supported",
        "Phương thức thanh toán chưa được cấu hình.",
      );
    }

    const { unitAmount, totalAmount } = calculateCheckoutAmounts({
      mode: command.mode,
      quantity: command.quantity,
      product,
    });
    const orderId = this.createId();
    const receiptAccessToken = this.createToken();
    const createdAt = this.now().toISOString();

    const quote: CheckoutQuote = {
      orderId,
      productId: product.id,
      productName: product.name,
      mode: command.mode,
      quantity: command.quantity,
      unitAmount,
      totalAmount,
      currency: "VND",
      paymentMethod: command.paymentMethod,
      returnUrl: command.returnUrl,
    };

    await this.dependencies.orders.createDraft({
      id: orderId,
      status: "draft",
      product,
      mode: command.mode,
      quantity: command.quantity,
      unitAmount,
      totalAmount,
      currency: "VND",
      paymentMethod: command.paymentMethod,
      receiptAccessTokenHash: await sha256Hex(receiptAccessToken),
      createdAt,
    });

    const session = await this.dependencies.paymentGateway.createSession(quote);
    await this.dependencies.orders.markPendingPayment(
      orderId,
      session.provider,
      session.providerReference,
    );

    return { ...session, orderId, receiptAccessToken };
  }
}

function validateReturnUrl(value: string): void {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      throw new Error("Return URL must use HTTPS.");
    }
  } catch {
    throw new CheckoutError(
      "invalid_return_url",
      "Địa chỉ quay lại sau thanh toán không hợp lệ.",
    );
  }
}
