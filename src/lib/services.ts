import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { services, type Service, type NewService } from "@/db/schema";
import { filterVisibleServices } from "@/lib/rbac";

export async function getAllServices(): Promise<Service[]> {
  return db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.name));
}

export async function getVisibleServicesForUser(
  userGroups: string[]
): Promise<Service[]> {
  const allActive = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder), asc(services.name));

  return filterVisibleServices(userGroups, allActive);
}

export async function getServiceById(
  id: string
): Promise<Service | undefined> {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return result[0];
}

export async function getServiceBySlug(
  slug: string
): Promise<Service | undefined> {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.slug, slug))
    .limit(1);
  return result[0];
}

export async function createService(data: NewService): Promise<Service> {
  const result = await db.insert(services).values(data).returning();
  return result[0];
}

export async function updateService(
  id: string,
  data: Partial<NewService>
): Promise<Service> {
  const result = await db
    .update(services)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();
  return result[0];
}

export async function deleteService(id: string): Promise<void> {
  await db.delete(services).where(eq(services.id, id));
}

export async function reorderServices(
  updates: { id: string; sortOrder: number }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const update of updates) {
      await tx
        .update(services)
        .set({ sortOrder: update.sortOrder, updatedAt: new Date() })
        .where(eq(services.id, update.id));
    }
  });
}

export async function getCategories(): Promise<string[]> {
  const result = await db
    .selectDistinct({ category: services.category })
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.category));

  return result
    .map((r) => r.category)
    .filter((c): c is string => c !== null);
}
