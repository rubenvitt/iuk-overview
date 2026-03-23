import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { AdminServicePage } from "@/components/admin/admin-service-page";

export default async function AdminPage() {
  const allServices = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.name));

  return <AdminServicePage services={allServices} />;
}
