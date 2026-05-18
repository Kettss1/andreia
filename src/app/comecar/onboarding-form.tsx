"use client";

import { useActionState } from "react";
import { createBusiness } from "./actions";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    createBusiness,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Nome do negócio
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoFocus
          autoComplete="off"
          placeholder="Ex.: Doces da Andreia"
          className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring sm:py-2 sm:text-sm"
        />
        {state?.error ? (
          <p className="mt-1.5 text-sm text-destructive">{state.error}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? "Criando..." : "Continuar"}
      </button>
    </form>
  );
}
