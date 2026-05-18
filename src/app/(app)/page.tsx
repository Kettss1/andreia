import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function InicioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const firstName = session?.user.name?.trim().split(" ")[0] ?? "";

  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">Início</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Olá{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-2 max-w-xl text-base text-muted-foreground">
        Seu painel vai morar aqui — próximos eventos, orçamentos aguardando
        resposta e o resumo do mês.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center sm:px-10 sm:py-16">
        <p className="text-sm text-muted-foreground">
          Em construção. As primeiras telas de verdade chegam na próxima fase.
        </p>
      </div>
    </div>
  );
}
