import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { category, product } from "@/db/schema";
import type { PricingUnit } from "@/lib/pricing";

export type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  pricingUnit: PricingUnit;
  price: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
};

/** All categories for a business, ordered for display. */
export async function getCategories(
  businessId: string,
): Promise<CatalogCategory[]> {
  return db
    .select({ id: category.id, name: category.name })
    .from(category)
    .where(eq(category.businessId, businessId))
    .orderBy(asc(category.sortOrder), asc(category.name));
}

/** All products for a business, ordered by name. */
export async function getProducts(
  businessId: string,
): Promise<CatalogProduct[]> {
  return db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      pricingUnit: product.pricingUnit,
      price: product.price,
    })
    .from(product)
    .where(eq(product.businessId, businessId))
    .orderBy(asc(product.name));
}

/** A single product, scoped to the business. Null if not found / not owned. */
export async function getProduct(
  businessId: string,
  productId: string,
): Promise<CatalogProduct | null> {
  const rows = await db
    .select({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      pricingUnit: product.pricingUnit,
      price: product.price,
      businessId: product.businessId,
    })
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  const row = rows[0];
  if (!row || row.businessId !== businessId) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    categoryId: row.categoryId,
    pricingUnit: row.pricingUnit,
    price: row.price,
  };
}
