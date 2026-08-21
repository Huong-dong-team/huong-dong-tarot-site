import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type {
  CheckoutMode,
  OrderStatus,
  PaymentEventType,
  PaymentMethod,
  PaymentProvider,
} from "@/modules/checkout/domain/checkout";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    status: text("status").$type<OrderStatus>().notNull(),
    checkoutMode: text("checkout_mode").$type<CheckoutMode>().notNull(),
    paymentMethod: text("payment_method").$type<PaymentMethod>().notNull(),
    paymentProvider: text("payment_provider").$type<PaymentProvider>(),
    providerReference: text("provider_reference"),
    currency: text("currency").$type<"VND">().notNull(),
    subtotalAmount: integer("subtotal_amount").notNull(),
    totalAmount: integer("total_amount").notNull(),
    buyerName: text("buyer_name"),
    buyerEmail: text("buyer_email"),
    receiptAccessTokenHash: text("receipt_access_token_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    paidAt: text("paid_at"),
  },
  (table) => [
    uniqueIndex("orders_provider_reference_unique").on(
      table.paymentProvider,
      table.providerReference,
    ),
    index("orders_status_idx").on(table.status),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    unitAmount: integer("unit_amount").notNull(),
    totalAmount: integer("total_amount").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const paymentEvents = sqliteTable(
  "payment_events",
  {
    id: text("id").primaryKey(),
    provider: text("provider").$type<Exclude<PaymentProvider, "disabled">>().notNull(),
    providerEventId: text("provider_event_id").notNull(),
    providerReference: text("provider_reference").notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    eventType: text("event_type").$type<PaymentEventType>().notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").$type<"VND">().notNull(),
    payloadHash: text("payload_hash").notNull(),
    occurredAt: text("occurred_at").notNull(),
    receivedAt: text("received_at").notNull(),
    processedAt: text("processed_at"),
  },
  (table) => [
    uniqueIndex("payment_events_provider_event_unique").on(
      table.provider,
      table.providerEventId,
    ),
    index("payment_events_order_id_idx").on(table.orderId),
    index("payment_events_unprocessed_idx").on(table.processedAt),
  ],
);
