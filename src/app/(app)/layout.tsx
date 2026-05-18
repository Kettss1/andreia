import { redirect } from "next/navigation";
import { getSession, getCurrentBusiness } from "@/lib/dal";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/comecar");
  }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar
        business={{ name: business.name }}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image ?? null,
        }}
      />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-5xl px-8 py-10 lg:px-12 lg:py-14">
          {children}
        </div>
      </main>
    </div>
  );
}
