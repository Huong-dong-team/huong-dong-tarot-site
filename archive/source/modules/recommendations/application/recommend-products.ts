import type { CustomerIntent, Product } from "@/modules/catalog/domain/product";

export function recommendProducts(
  products: readonly Product[],
  intent: CustomerIntent,
): readonly Product[] {
  return products
    .filter((product) => product.recommendedFor.includes(intent))
    .sort((left, right) => {
      if (left.badge === "Khuyên chọn") return -1;
      if (right.badge === "Khuyên chọn") return 1;
      return left.price - right.price;
    });
}
