import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireBusiness } from "@/lib/dal";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "../product-form";

export default async function NovoProdutoPage() {
  const business = await requireBusiness();
  const categories = await getCategories(business.id);

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
        Novo produto
      </h1>

      <ProductForm categories={categories} />
    </div>
  );
}
