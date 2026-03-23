import { describe, it, expect } from "vitest";
import { serviceFormSchema } from "@/lib/validations";

describe("serviceFormSchema", () => {
  it("validates a minimal valid service", () => {
    const result = serviceFormSchema.safeParse({
      name: "Test Service",
      slug: "test-service",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("validates a full service", () => {
    const result = serviceFormSchema.safeParse({
      name: "Grafana",
      slug: "grafana",
      description: "Monitoring dashboards",
      url: "https://grafana.example.com",
      iconUrl: "https://grafana.example.com/icon.png",
      category: "Monitoring",
      tags: ["monitoring", "metrics"],
      requiredGroups: ["ops-team"],
      isPublic: false,
      isActive: true,
      sortOrder: 5,
      openInNewTab: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = serviceFormSchema.safeParse({
      name: "",
      slug: "test",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug format", () => {
    const result = serviceFormSchema.safeParse({
      name: "Test",
      slug: "Test Service!",
      url: "https://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid slug formats", () => {
    const validSlugs = ["test", "test-service", "my-app-123", "a"];
    for (const slug of validSlugs) {
      const result = serviceFormSchema.safeParse({
        name: "Test",
        slug,
        url: "https://example.com",
      });
      expect(result.success, `slug "${slug}" should be valid`).toBe(true);
    }
  });

  it("rejects invalid URL", () => {
    const result = serviceFormSchema.safeParse({
      name: "Test",
      slug: "test",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("applies defaults correctly", () => {
    const result = serviceFormSchema.safeParse({
      name: "Test",
      slug: "test",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(true);
      expect(result.data.isActive).toBe(true);
      expect(result.data.openInNewTab).toBe(true);
      expect(result.data.sortOrder).toBe(0);
      expect(result.data.tags).toEqual([]);
      expect(result.data.requiredGroups).toEqual([]);
    }
  });
});
