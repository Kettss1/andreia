import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { business } from "@/db/schema";

/**
 * Request-scoped data accessors. `cache` dedupes calls within a single
 * render pass, so layouts and pages can each call these freely.
 */

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const getCurrentBusiness = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const rows = await db
    .select()
    .from(business)
    .where(eq(business.ownerUserId, session.user.id))
    .limit(1);

  return rows[0] ?? null;
});

/**
 * Guard for pages and server actions that operate on catalog data.
 * Redirects rather than returning null — callers can assume a business.
 * This is the single chokepoint for multi-tenant scoping: every catalog
 * query filters by the id returned here.
 */
export const requireBusiness = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  const current = await getCurrentBusiness();
  if (!current) redirect("/comecar");

  return current;
});
