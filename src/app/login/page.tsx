"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Andreia
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Cardápios e orçamentos profissionais para o seu negócio.
            </p>
          </div>
          <button
            onClick={() =>
              authClient.signIn.social({ provider: "google", callbackURL: "/" })
            }
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Entrar com Google
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Feito para confeiteiras, padeiras e pequenos negócios de comida.
        </p>
      </div>
    </main>
  );
}
