import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { filterVisibleServices } from "@/lib/rbac";
import { Navbar } from "@/components/navbar";
import { ServiceGrid } from "@/components/service-grid";
import { SearchFilter } from "@/components/search-filter";
import { EmptyState } from "@/components/empty-state";

interface DashboardPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const userGroups = session.user.groups ?? [];

  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder), asc(services.name));

  let visibleServices = filterVisibleServices(userGroups, allServices);

  // Apply search filter
  if (params.search) {
    const query = params.search.toLowerCase();
    visibleServices = visibleServices.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    );
  }

  // Apply category filter
  if (params.category) {
    visibleServices = visibleServices.filter(
      (s) => s.category === params.category
    );
  }

  // Extract unique categories from all visible services (unfiltered)
  const categories = [
    ...new Set(
      filterVisibleServices(userGroups, allServices)
        .map((s) => s.category)
        .filter(Boolean) as string[]
    ),
  ].sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Ihre freigegebenen Anwendungen
          </p>
        </div>
        <div className="mb-6">
          <Suspense>
            <SearchFilter categories={categories} />
          </Suspense>
        </div>
        {visibleServices.length > 0 ? (
          <ServiceGrid services={visibleServices} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
