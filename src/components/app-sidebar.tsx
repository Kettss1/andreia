"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  UtensilsCrossed,
  FileText,
  Palette,
  Settings,
  ChevronsUpDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  { href: "/", label: "Início", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo", icon: BookOpen },
  { href: "/cardapios", label: "Cardápios", icon: UtensilsCrossed },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
];

const businessNav: NavItem[] = [
  { href: "/identidade-visual", label: "Identidade visual", icon: Palette },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

type Business = { name: string };
type User = { name: string; email: string; image: string | null };

export function AppSidebar({
  business,
  user,
}: {
  business: Business;
  user: User;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Andreia
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="-mr-2 flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,320px)] flex-col bg-sidebar text-sidebar-foreground shadow-2xl md:hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <span className="font-display text-xl font-semibold tracking-tight text-sidebar-foreground">
                Andreia
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="-mr-2 flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarBody business={business} user={user} />
          </div>
        </>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden w-[264px] shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 pt-6 pb-5">
          <span className="font-display text-2xl font-semibold tracking-tight text-sidebar-foreground">
            Andreia
          </span>
        </div>
        <SidebarBody business={business} user={user} />
      </aside>
    </>
  );
}

function SidebarBody({ business, user }: { business: Business; user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const businessInitial =
    business.name.trim().charAt(0).toUpperCase() || "?";
  const userInitial = user.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <div className="px-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {businessInitial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">
              {business.name}
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/55">
              Negócio
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/45" />
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {mainNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <p className="mt-7 mb-1 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40">
          Negócio
        </p>
        {businessNav.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
            {userInitial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/55">
              {user.email}
            </span>
          </span>
          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
            }}
            aria-label="Sair"
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-[1.15rem] shrink-0 transition-colors",
          active
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/70",
        )}
      />
      {item.label}
    </Link>
  );
}
