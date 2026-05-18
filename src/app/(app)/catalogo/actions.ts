"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { category, product } from "@/db/schema";
import { requireBusiness } from "@/lib/dal";

const pricingUnitEnum = z.enum(["unit", "kg", "cento", "duzia", "kit"]);

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Dê um nome ao produto." })
    .max(120, { error: "O nome está muito longo." }),
  description: z
    .string()
    .trim()
    .max(500, { error: "A descrição está muito longa." })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  categoryId: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  pricingUnit: pricingUnitEnum,
  // Accept "90,00" or "90.00"; coerce to number and require positive.
  price: z
    .string()
    .trim()
    .min(1, { error: "Informe o preço." })
    .transform((v, ctx) => {
      const n = Number(v.replace(/\./g, "").replace(",", "."));
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: "custom", message: "Preço inválido." });
        return z.NEVER;
      }
      if (n <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "O preço deve ser maior que zero.",
        });
        return z.NEVER;
      }
      return n;
    }),
});

export type ProductFormState = { error?: string } | undefined;

/** Confirms a category id belongs to this business (or is null). */
async function resolveCategoryId(
  businessId: string,
  categoryId: string | null,
): Promise<string | null> {
  if (!categoryId) return null;
  const rows = await db
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.businessId, businessId)))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const business = await requireBusiness();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    pricingUnit: formData.get("pricingUnit"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const categoryId = await resolveCategoryId(business.id, data.categoryId);

  await db.insert(product).values({
    businessId: business.id,
    categoryId,
    name: data.name,
    description: data.description,
    pricingUnit: data.pricingUnit,
    price: data.price.toFixed(2),
  });

  revalidatePath("/catalogo");
  redirect("/catalogo");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const business = await requireBusiness();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    pricingUnit: formData.get("pricingUnit"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = parsed.data;
  const categoryId = await resolveCategoryId(business.id, data.categoryId);

  await db
    .update(product)
    .set({
      categoryId,
      name: data.name,
      description: data.description,
      pricingUnit: data.pricingUnit,
      price: data.price.toFixed(2),
    })
    .where(
      and(eq(product.id, productId), eq(product.businessId, business.id)),
    );

  revalidatePath("/catalogo");
  redirect("/catalogo");
}

export async function deleteProduct(productId: string): Promise<void> {
  const business = await requireBusiness();

  await db
    .delete(product)
    .where(
      and(eq(product.id, productId), eq(product.businessId, business.id)),
    );

  revalidatePath("/catalogo");
  redirect("/catalogo");
}

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Dê um nome à categoria." })
    .max(60, { error: "O nome está muito longo." }),
});

export type CreateCategoryResult =
  | { ok: true; id: string; name: string }
  | { ok: false; error: string };

/** Creates a category inline (from the product form) and returns it. */
export async function createCategory(
  name: string,
): Promise<CreateCategoryResult> {
  const business = await requireBusiness();

  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Nome inválido.",
    };
  }

  const rows = await db
    .insert(category)
    .values({ businessId: business.id, name: parsed.data.name })
    .returning({ id: category.id, name: category.name });

  revalidatePath("/catalogo");
  return { ok: true, id: rows[0].id, name: rows[0].name };
}
