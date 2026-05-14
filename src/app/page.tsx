import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 bg-neutral-50 p-6">
      <p className="text-sm text-neutral-500">Logado como</p>
      <p className="text-lg font-medium text-neutral-900">
        {session.user.name}
      </p>
      <p className="text-sm text-neutral-500">{session.user.email}</p>
      <div className="mt-3">
        <SignOutButton />
      </div>
    </main>
  );
}
