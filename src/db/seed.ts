import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { services } from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://dashboard:dashboard@localhost:5432/dashboard";

async function seed() {
  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log("Seeding database...");

  const demoServices = [
    {
      slug: "nextcloud",
      name: "Nextcloud",
      description: "Cloud-Speicher und Kollaborationsplattform",
      url: "https://cloud.example.com",
      category: "Cloud-Speicher",
      isPublic: true,
      isActive: true,
      sortOrder: 0,
      tags: ["cloud", "dateien"],
    },
    {
      slug: "gitea",
      name: "Gitea",
      description: "Git-Versionsverwaltung und Code-Hosting",
      url: "https://git.example.com",
      category: "Entwicklung",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
      tags: ["git", "code"],
    },
    {
      slug: "grafana",
      name: "Grafana",
      description: "Monitoring-Dashboards und Metriken",
      url: "https://grafana.example.com",
      category: "Monitoring",
      isPublic: false,
      isActive: true,
      sortOrder: 2,
      requiredGroups: ["ops-team"],
      tags: ["monitoring", "metriken"],
    },
    {
      slug: "portainer",
      name: "Portainer",
      description: "Container-Management und Orchestrierung",
      url: "https://portainer.example.com",
      category: "Infrastruktur",
      isPublic: false,
      isActive: true,
      sortOrder: 3,
      requiredGroups: ["ops-team", "docker-admins"],
      tags: ["docker", "container"],
    },
    {
      slug: "wiki-js",
      name: "Wiki.js",
      description: "Dokumentation und Wissensmanagement",
      url: "https://wiki.example.com",
      category: "Dokumentation",
      isPublic: true,
      isActive: true,
      sortOrder: 4,
      tags: ["wiki", "doku"],
    },
    {
      slug: "keycloak-admin",
      name: "Keycloak Admin",
      description: "Identitäts- und Zugriffsverwaltung",
      url: "https://auth.example.com/admin",
      category: "Administration",
      isPublic: false,
      isActive: true,
      sortOrder: 5,
      requiredGroups: ["dashboard-admins"],
      tags: ["auth", "admin"],
    },
    {
      slug: "matomo",
      name: "Matomo",
      description: "Webanalyse und Besucherstatistiken",
      url: "https://analytics.example.com",
      category: "Analytics",
      isPublic: false,
      isActive: true,
      sortOrder: 6,
      requiredGroups: ["marketing"],
      tags: ["analytics", "tracking"],
    },
    {
      slug: "uptime-kuma",
      name: "Uptime Kuma",
      description: "Service-Monitoring und Statusseite",
      url: "https://status.example.com",
      category: "Monitoring",
      isPublic: true,
      isActive: true,
      sortOrder: 7,
      tags: ["monitoring", "status"],
    },
  ];

  // Clear existing data
  await db.delete(services);

  // Insert demo data
  await db.insert(services).values(demoServices);

  console.log(`Inserted ${demoServices.length} demo services.`);

  await client.end();
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
