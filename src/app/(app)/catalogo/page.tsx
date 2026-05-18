import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { requireBusiness } from "@/lib/dal";
import { getCategories, getProducts } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPriceWithUnit } from "@/lib/pricing";

const UNCATEGORIZED = "__uncategorized__";

export default async function CatalogoPage() {
  const business = await requireBusiness();
  const [categories, products] = await Promise.all([
    getCategories(business.id),
    getProducts(business.id),
  ]);

  // Group products by category, preserving category display order and
  // putting anything uncategorized in its own trailing section.
  const grouped = new Map<string, CatalogProduct[]>();
  for (const cat of categories) grouped.set(cat.id, []);
  for (const p of products) {
    const key = p.categoryId ?? UNCATEGORIZED;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  const sections = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      products: grouped.get(cat.id) ?? [],
    })),
    ...(grouped.has(UNCATEGORIZED)
      ? [
          {
            id: UNCATEGORIZED,
            name: "Sem categoria",
            products: grouped.get(UNCATEGORIZED)!,
          },
        ]
      : []),
  ].filter((s) => s.products.length > 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Catálogo</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Seu catálogo
          </h1>
          <p className="mt-2 max-w-xl text-base text-muted-foreground">
            {products.length > 0
              ? `${products.length} ${products.length === 1 ? "produto" : "produtos"} em ${sections.length} ${sections.length === 1 ? "categoria" : "categorias"}.`
              : "Cadastre seus produtos uma vez e reutilize em cardápios e orçamentos."}
          </p>
        </div>
        <Link
          href="/catalogo/novo"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-10 flex flex-col gap-9">
          {sections.map((section) => (
            <section key={section.id}>
              <div className="flex items-baseline gap-2.5 px-1">
                <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {section.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {section.products.length}
                </span>
              </div>
              <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                {section.products.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/catalogo/${p.id}`}
                    className={
                      "flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/60 sm:px-5" +
                      (i > 0 ? " border-t border-border" : "")
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      {p.description ? (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                      {formatPriceWithUnit(p.price, p.pricingUnit)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center sm:px-10 sm:py-16">
      <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <BookOpen className="size-6" />
      </span>
      <div>
        <p className="font-medium text-foreground">
          Seu catálogo está vazio
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Comece cadastrando seu primeiro produto — um bolo, um cento de
          brigadeiro, um kit de festa.
        </p>
      </div>
      <Link
        href="/catalogo/novo"
        className="mt-1 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="size-4" />
        Novo produto
      </Link>
    </div>
  );
}
