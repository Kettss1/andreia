"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { business } from "@/db/schema";
import { requireBusiness } from "@/lib/dal";
import { saveImage, deleteImage, StorageError } from "@/lib/storage";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

const identitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Dê um nome ao seu negócio." })
    .max(80),
  phone: optionalText(40),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      { error: "Email inválido." },
    ),
  instagram: optionalText(40),
  city: optionalText(80),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-f]{6}$/i, { error: "Cor inválida." }),
});

export type IdentityFormState = { error?: string } | undefined;

export async function updateIdentity(
  _prev: IdentityFormState,
  formData: FormData,
): Promise<IdentityFormState> {
  const current = await requireBusiness();

  const parsed = identitySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    instagram: formData.get("instagram"),
    city: formData.get("city"),
    primaryColor: formData.get("primaryColor"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // Logo handling. Three possible states:
  //  - logo file present  → save + (delete old)
  //  - logoRemove === "1" → just delete old
  //  - neither            → leave logoPath unchanged
  let nextLogoPath: string | undefined | null = undefined;
  const incoming = formData.get("logo");
  const remove = formData.get("logoRemove") === "1";

  if (incoming instanceof File && incoming.size > 0) {
    try {
      const buffer = Buffer.from(await incoming.arrayBuffer());
      const filename = await saveImage({
        buffer,
        contentType: incoming.type,
        size: incoming.size,
      });
      nextLogoPath = filename;
      if (current.logoPath) await deleteImage(current.logoPath);
    } catch (err) {
      if (err instanceof StorageError) return { error: err.message };
      throw err;
    }
  } else if (remove) {
    if (current.logoPath) await deleteImage(current.logoPath);
    nextLogoPath = null;
  }

  await db
    .update(business)
    .set({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      instagram: parsed.data.instagram,
      city: parsed.data.city,
      primaryColor: parsed.data.primaryColor,
      ...(nextLogoPath === undefined ? {} : { logoPath: nextLogoPath }),
    })
    .where(eq(business.id, current.id));

  revalidatePath("/identidade-visual");
  revalidatePath("/", "layout"); // sidebar shows business name
  return undefined;
}
