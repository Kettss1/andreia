import { requireBusiness } from "@/lib/dal";
import { IdentityForm } from "./identity-form";

export default async function IdentidadeVisualPage() {
  const business = await requireBusiness();

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-muted-foreground">
        Identidade visual
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Identidade visual
      </h1>
      <p className="mt-2 max-w-xl text-base text-muted-foreground">
        Configure o logo, as cores e os dados do seu negócio. Esses elementos
        aparecem em todos os cardápios e orçamentos.
      </p>

      <IdentityForm
        defaults={{
          name: business.name,
          phone: business.phone,
          email: business.email,
          instagram: business.instagram,
          city: business.city,
          primaryColor: business.primaryColor,
          logoPath: business.logoPath,
        }}
      />
    </div>
  );
}
