import { products } from "@/content/products";
import type { Product, ProductRepository } from "@/modules/catalog/domain/product";

export class StaticProductRepository implements ProductRepository {
  async list(): Promise<readonly Product[]> {
    return products;
  }

  async findById(id: string): Promise<Product | null> {
    return products.find((product) => product.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return products.find((product) => product.slug === slug) ?? null;
  }
}
