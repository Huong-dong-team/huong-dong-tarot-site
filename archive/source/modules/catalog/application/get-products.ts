import type { Product, ProductRepository } from "@/modules/catalog/domain/product";

export class GetProducts {
  constructor(private readonly products: ProductRepository) {}

  execute(): Promise<readonly Product[]> {
    return this.products.list();
  }
}
