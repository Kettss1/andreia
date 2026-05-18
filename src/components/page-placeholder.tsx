export function PagePlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-base text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center sm:px-10 sm:py-16">
        <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="size-6" />
        </span>
        <p className="text-sm text-muted-foreground">
          Em construção — esta tela chega nas próximas fases.
        </p>
      </div>
    </div>
  );
}
