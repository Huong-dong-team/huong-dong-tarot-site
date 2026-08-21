export type ProductKind = "deck" | "collector" | "digital" | "gift";

export type ProductStatus =
  | "preview"
  | "interest-open"
  | "deposit-open"
  | "preorder"
  | "available";

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly price: number;
  readonly depositAmount: number;
  readonly kind: ProductKind;
  readonly status: ProductStatus;
  readonly badge: string;
  readonly includes: readonly string[];
  readonly accent: "jade" | "coral" | "brass" | "mist";
  readonly recommendedFor: readonly CustomerIntent[];
}

export type CustomerIntent = "beginner" | "reader" | "collector" | "gift";

export interface ProductRepository {
  list(): Promise<readonly Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
}
