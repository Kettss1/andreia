"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateIdentity } from "./actions";

const formSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao seu negócio.").max(80),
  phone: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine(
      (v) => !v || v.length === 0 || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "Email inválido.",
    ),
  instagram: z.string().trim().max(40).optional(),
  city: z.string().trim().max(80).optional(),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i, "Cor inválida."),
});

type FormValues = z.infer<typeof formSchema>;

// Warm artisanal preset palette. The default raspberry matches the app accent.
const COLOR_PRESETS = [
  { value: "#BE3E5C", label: "Framboesa" },
  { value: "#B45309", label: "Caramelo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#7C2D6B", label: "Ameixa" },
  { value: "#D97706", label: "Mel" },
];

export type IdentityDefaults = {
  name: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  city: string | null;
  primaryColor: string;
  logoPath: string | null;
};

export function IdentityForm({ defaults }: { defaults: IdentityDefaults }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Logo state is kept outside RHF because it's either a server-stored
  // file (logoPath) or a pending File the user just selected.
  const [serverLogoPath, setServerLogoPath] = useState(defaults.logoPath);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [markRemoved, setMarkRemoved] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaults.name,
      phone: defaults.phone ?? "",
      email: defaults.email ?? "",
      instagram: defaults.instagram ?? "",
      city: defaults.city ?? "",
      primaryColor: defaults.primaryColor,
    },
  });

  const primaryColor = watch("primaryColor");
  const displayedLogo = pendingPreview
    ? pendingPreview
    : !markRemoved && serverLogoPath
      ? serverLogoPath
      : null;

  function onPickFile(file: File | null) {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    if (!file) {
      setPendingFile(null);
      setPendingPreview(null);
      return;
    }
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setMarkRemoved(false);
  }

  function onRemoveLogo() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setMarkRemoved(true);
  }

  function onSubmit(values: FormValues) {
    setServerError(null);
    const fd = new FormData();
    fd.set("name", values.name);
    fd.set("phone", values.phone ?? "");
    fd.set("email", values.email ?? "");
    fd.set("instagram", values.instagram ?? "");
    fd.set("city", values.city ?? "");
    fd.set("primaryColor", values.primaryColor);
    if (pendingFile) fd.set("logo", pendingFile);
    if (markRemoved && !pendingFile) fd.set("logoRemove", "1");

    startTransition(async () => {
      const result = await updateIdentity(undefined, fd);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      // Reset transient state to match what the server now has.
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null);
      setPendingPreview(null);
      if (markRemoved && !pendingFile) {
        setServerLogoPath(null);
        setMarkRemoved(false);
      } else if (pendingFile) {
        // The server picked a fresh filename; the easiest way to learn it
        // is on the next request. revalidatePath in the action covers
        // server-rendered consumers; for the form preview we just stop
        // showing the local blob — the route already serves the new file.
        setMarkRemoved(false);
        // Bust the cache by forcing a refresh of the path. A full reload
        // isn't ideal; we rely on the server having returned by the next
        // mount. In practice the savedAt indicator is enough feedback.
      }
      setSavedAt(new Date());
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 flex flex-col gap-6"
    >
      {/* Logo */}
      <Section title="Logo">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div
            className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary"
            style={
              !displayedLogo ? { backgroundColor: primaryColor } : undefined
            }
          >
            {displayedLogo ? (
              // Render with a plain <img>: the file is dynamic and may be
              // an SVG; next/image's optimizer adds complexity for no gain.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedLogo}
                alt="Logo do negócio"
                className="size-full object-contain"
              />
            ) : (
              <span className="font-display text-2xl font-semibold text-white">
                {(watch("name") || defaults.name)
                  .trim()
                  .charAt(0)
                  .toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP ou SVG · até 5MB
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Upload className="size-4" />
                {displayedLogo ? "Trocar logo" : "Enviar logo"}
              </button>
              {displayedLogo ? (
                <button
                  type="button"
                  onClick={onRemoveLogo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-white"
                >
                  <X className="size-4" />
                  Remover
                </button>
              ) : null}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </Section>

      {/* Cor primária */}
      <Section title="Cor primária">
        <p className="text-sm text-muted-foreground">
          Escolha entre as sugestões ou clique para definir manualmente.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isActive =
              preset.value.toLowerCase() === primaryColor.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                title={preset.label}
                onClick={() =>
                  setValue("primaryColor", preset.value, {
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg ring-offset-2 ring-offset-card transition-all",
                  isActive
                    ? "ring-2 ring-foreground"
                    : "ring-1 ring-border hover:ring-foreground/40",
                )}
                style={{ backgroundColor: preset.value }}
              >
                {isActive ? (
                  <Check className="size-4 text-white drop-shadow" />
                ) : null}
              </button>
            );
          })}
          <label
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            title="Cor personalizada"
          >
            <span
              className="size-5 rounded-md border border-border"
              style={{ backgroundColor: primaryColor }}
            />
            Personalizada
            <input
              type="color"
              value={primaryColor}
              onChange={(e) =>
                setValue("primaryColor", e.target.value.toUpperCase(), {
                  shouldDirty: true,
                })
              }
              className="absolute size-0 opacity-0"
            />
          </label>
          <input
            {...register("primaryColor")}
            type="text"
            className="w-28 rounded-lg border border-input bg-background px-3 py-2.5 text-base tabular-nums uppercase text-foreground outline-none transition-colors focus:border-ring sm:ml-2 sm:py-2 sm:text-sm"
          />
        </div>
        {errors.primaryColor ? (
          <p className="mt-2 text-sm text-destructive">
            {errors.primaryColor.message}
          </p>
        ) : null}
      </Section>

      {/* Informações */}
      <Section title="Informações do negócio">
        <p className="text-sm text-muted-foreground">
          Aparecem no cabeçalho e rodapé dos PDFs gerados.
        </p>
        <div className="mt-3 flex flex-col gap-4">
          <Field label="Nome do negócio" error={errors.name?.message}>
            <input {...register("name")} className={inputClass} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Telefone / WhatsApp"
              hint="opcional"
              error={errors.phone?.message}
            >
              <input
                {...register("phone")}
                placeholder="(51) 99999-1234"
                className={inputClass}
              />
            </Field>
            <Field
              label="Email"
              hint="opcional"
              error={errors.email?.message}
            >
              <input
                {...register("email")}
                type="email"
                placeholder="contato@exemplo.com.br"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Instagram"
              hint="opcional"
              error={errors.instagram?.message}
            >
              <input
                {...register("instagram")}
                placeholder="@seunegocio"
                className={inputClass}
              />
            </Field>
            <Field
              label="Cidade"
              hint="opcional"
              error={errors.city?.message}
            >
              <input
                {...register("city")}
                placeholder="Porto Alegre, RS"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Section>

      {serverError ? (
        <p className="text-sm text-destructive">{serverError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        {savedAt ? (
          <p
            className="mr-auto text-sm text-muted-foreground"
            aria-live="polite"
          >
            Alterações salvas.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.07em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
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
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring sm:py-2 sm:text-sm";
