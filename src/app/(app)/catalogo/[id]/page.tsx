import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireBusiness } from "@/lib/dal";
import { getCategories, getProduct } from "@/lib/catalog";
import { ProductForm } from "../product-form";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await requireBusiness();

  const [product, categories] = await Promise.all([
    getProduct(business.id, id),
    getCategories(business.id),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para o catálogo
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
        Editar produto
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
