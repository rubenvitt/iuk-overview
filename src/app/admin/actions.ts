"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/rbac";
import { serviceFormSchema, reorderSchema } from "@/lib/validations";
import {
  createService,
  updateService,
  deleteService,
  reorderServices,
} from "@/lib/services";

type ActionResult = {
  success: boolean;
  error?: string;
};

async function requireAdmin(): Promise<string[] | ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Nicht authentifiziert" };
  }
  if (!isAdmin(session.user.groups ?? [])) {
    return { success: false, error: "Keine Berechtigung" };
  }
  return session.user.groups;
}

export async function createServiceAction(
  formData: FormData
): Promise<ActionResult> {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck as ActionResult;

  const raw = Object.fromEntries(formData);
  const parsed = serviceFormSchema.safeParse({
    ...raw,
    isPublic: raw.isPublic === "true",
    isActive: raw.isActive === "true",
    openInNewTab: raw.openInNewTab === "true",
    sortOrder: Number(raw.sortOrder) || 0,
    tags: raw.tags ? String(raw.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
    requiredGroups: raw.requiredGroups
      ? String(raw.requiredGroups).split(",").map((g) => g.trim()).filter(Boolean)
      : [],
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "Validierungsfehler",
    };
  }

  try {
    await createService(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { success: false, error: "Ein Service mit diesem Slug existiert bereits" };
    }
    return { success: false, error: message };
  }
}

export async function updateServiceAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck as ActionResult;

  const raw = Object.fromEntries(formData);
  const parsed = serviceFormSchema.safeParse({
    ...raw,
    isPublic: raw.isPublic === "true",
    isActive: raw.isActive === "true",
    openInNewTab: raw.openInNewTab === "true",
    sortOrder: Number(raw.sortOrder) || 0,
    tags: raw.tags ? String(raw.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
    requiredGroups: raw.requiredGroups
      ? String(raw.requiredGroups).split(",").map((g) => g.trim()).filter(Boolean)
      : [],
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: firstError?.message ?? "Validierungsfehler",
    };
  }

  try {
    await updateService(id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return { success: false, error: message };
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck as ActionResult;

  try {
    await deleteService(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return { success: false, error: message };
  }
}

export async function reorderServicesAction(
  updates: { id: string; sortOrder: number }[]
): Promise<ActionResult> {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck as ActionResult;

  const parsed = reorderSchema.safeParse(updates);
  if (!parsed.success) {
    return { success: false, error: "Ungültige Daten" };
  }

  try {
    await reorderServices(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unbekannter Fehler";
    return { success: false, error: message };
  }
}
