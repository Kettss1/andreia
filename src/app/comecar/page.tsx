import { redirect } from "next/navigation";
import { getSession, getCurrentBusiness } from "@/lib/dal";
import { OnboardingForm } from "./onboarding-form";

export default async function ComecarPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const existing = await getCurrentBusiness();
  if (existing) {
    redirect("/");
  }

  const firstName = session.user.name?.trim().split(" ")[0] ?? "";

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Andreia
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Olá{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vamos começar pelo essencial: como se chama o seu negócio? Você pode
            mudar isso depois.
          </p>

          <div className="mt-6">
            <OnboardingForm />
          </div>
        </div>
      </div>
    </main>
  );
}
