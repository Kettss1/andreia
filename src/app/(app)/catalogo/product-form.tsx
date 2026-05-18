"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Check, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRICING_UNITS,
  PRICING_UNIT_OPTIONS,
  type PricingUnit,
} from "@/lib/pricing";
import type { CatalogCategory, CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
} from "./actions";

const formSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao produto.").max(120),
  description: z.string().trim().max(500).optional(),
  categoryId: z.string().optional(),
  pricingUnit: z.enum(["unit", "kg", "cento", "duzia", "kit"]),
  price: z
    .string()
    .trim()
    .min(1, "Informe o preço.")
    .refine((v) => {
      const n = Number(v.replace(/\./g, "").replace(",", "."));
      return Number.isFinite(n) && n > 0;
    }, "Preço inválido."),
});

type FormValues = z.infer<typeof formSchema>;

const UNCATEGORIZED_VALUE = "__none__";

export function ProductForm({
  categories: initialCategories,
  product,
}: {
  categories: CatalogCategory[];
  product?: CatalogProduct;
}) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState(initialCategories);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      pricingUnit: product?.pricingUnit ?? "unit",
      price: product
        ? Number(product.price).toFixed(2).replace(".", ",")
        : "",
    },
  });

  const selectedUnit = watch("pricingUnit") as PricingUnit;

  function onSubmit(values: FormValues) {
    setServerError(null);
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("description", values.description ?? "");
    fd.set("categoryId", values.categoryId ?? "");
    fd.set("pricingUnit", values.pricingUnit);
    fd.set("price", values.price);

    startSubmit(async () => {
      const action = isEdit
        ? updateProduct.bind(null, product!.id)
        : createProduct;
      // On success the action redirects (throws internally); on failure
      // it returns an error object.
      const result = await action(undefined, fd);
      if (result?.error) setServerError(result.error);
    });
  }

  function onDelete() {
    startDelete(async () => {
      await deleteProduct(product!.id);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
      <Section title="Informações">
        <Field label="Nome do produto" error={errors.name?.message}>
          <input
            {...register("name")}
            autoFocus
            placeholder="Ex.: Brigadeiro gourmet"
            className={inputClass}
          />
        </Field>

        <Field
          label="Descrição"
          hint="opcional"
          error={errors.description?.message}
        >
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Aparece no cardápio e no orçamento."
            className={cn(inputClass, "resize-y")}
          />
        </Field>

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <CategoryField
              categories={categories}
              value={field.value ?? ""}
              onChange={field.onChange}
              onCreated={(cat) => {
                setCategories((prev) => [...prev, cat]);
                field.onChange(cat.id);
              }}
            />
          )}
        />
      </Section>

      <Section title="Preço">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Unidade de venda">
            <Controller
              control={control}
              name="pricingUnit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={triggerClass}>
                    <SelectValue placeholder="Selecione...">
                      {(value: PricingUnit) =>
                        value ? PRICING_UNITS[value].label : null
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {PRICING_UNIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label={`Preço por ${PRICING_UNITS[selectedUnit].short}`}
            error={errors.price?.message}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <input
                {...register("price")}
                inputMode="decimal"
                placeholder="0,00"
                className={cn(inputClass, "pl-9 tabular-nums")}
              />
            </div>
          </Field>
        </div>
      </Section>

      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        {isEdit ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isSubmitting}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-60"
          >
            {isDeleting ? "Excluindo..." : "Excluir produto"}
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/catalogo"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            onClick={() => router.prefetch("/catalogo")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CategoryField({
  categories,
  value,
  onChange,
  onCreated,
}: {
  categories: CatalogCategory[];
  value: string;
  onChange: (id: string) => void;
  onCreated: (cat: CatalogCategory) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(newName);
      if (result.ok) {
        onCreated({ id: result.id, name: result.name });
        setNewName("");
        setCreating(false);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Field label="Categoria" hint="opcional" error={error ?? undefined}>
      {creating ? (
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            placeholder="Ex.: Bolos"
            className={inputClass}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmCreate();
              }
            }}
          />
          <button
            type="button"
            onClick={confirmCreate}
            disabled={isPending}
            aria-label="Criar categoria"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName("");
              setError(null);
            }}
            aria-label="Cancelar"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select
            value={value === "" ? UNCATEGORIZED_VALUE : value}
            onValueChange={(v) =>
              onChange(!v || v === UNCATEGORIZED_VALUE ? "" : v)
            }
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Sem categoria">
                {(value: string) => {
                  if (!value || value === UNCATEGORIZED_VALUE)
                    return "Sem categoria";
                  return (
                    categories.find((c) => c.id === value)?.name ??
                    "Sem categoria"
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              <SelectItem value={UNCATEGORIZED_VALUE}>Sem categoria</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" />
            Nova
          </button>
        </div>
      )}
    </Field>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {hint ? (
          <span className="ml-1.5 font-normal text-muted-foreground">
            ({hint})
          </span>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring";

const triggerClass =
  "h-[38px] w-full rounded-lg border-input bg-background px-3 py-2 text-sm font-normal text-foreground";
