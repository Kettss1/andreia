"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { business } from "@/db/schema";
import { getSession, getCurrentBusiness } from "@/lib/dal";

const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Dê um nome ao seu negócio." })
    .max(80, { error: "O nome está muito longo." }),
});

type ActionState = { error?: string } | undefined;

export async function createBusiness(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Onboarding only creates the first business — never a second one.
  const existing = await getCurrentBusiness();
  if (existing) {
    redirect("/");
  }

  const parsed = createBusinessSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  await db.insert(business).values({
    ownerUserId: session.user.id,
    name: parsed.data.name,
  });

  redirect("/");
}
