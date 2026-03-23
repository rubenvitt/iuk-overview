import { describe, it, expect, vi } from "vitest";

// Mock the env var before importing
vi.stubEnv("ADMIN_GROUP", "dashboard-admins");

import { isAdmin, canViewService, filterVisibleServices } from "@/lib/rbac";

describe("RBAC", () => {
  describe("isAdmin", () => {
    it("returns true when user has admin group", () => {
      expect(isAdmin(["dashboard-admins", "users"])).toBe(true);
    });

    it("returns false when user does not have admin group", () => {
      expect(isAdmin(["users", "developers"])).toBe(false);
    });

    it("returns false for empty groups", () => {
      expect(isAdmin([])).toBe(false);
    });
  });

  describe("canViewService", () => {
    it("returns false for inactive services", () => {
      expect(
        canViewService(["users"], {
          isPublic: true,
          isActive: false,
          requiredGroups: [],
        })
      ).toBe(false);
    });

    it("returns true for public active services", () => {
      expect(
        canViewService(["users"], {
          isPublic: true,
          isActive: true,
          requiredGroups: [],
        })
      ).toBe(true);
    });

    it("returns true when user has matching group", () => {
      expect(
        canViewService(["ops-team", "users"], {
          isPublic: false,
          isActive: true,
          requiredGroups: ["ops-team"],
        })
      ).toBe(true);
    });

    it("returns false when user has no matching group", () => {
      expect(
        canViewService(["users"], {
          isPublic: false,
          isActive: true,
          requiredGroups: ["ops-team"],
        })
      ).toBe(false);
    });

    it("returns true when user has at least one matching group", () => {
      expect(
        canViewService(["marketing"], {
          isPublic: false,
          isActive: true,
          requiredGroups: ["ops-team", "marketing"],
        })
      ).toBe(true);
    });

    it("returns false for non-public service with empty requiredGroups", () => {
      expect(
        canViewService(["users"], {
          isPublic: false,
          isActive: true,
          requiredGroups: [],
        })
      ).toBe(false);
    });
  });

  describe("filterVisibleServices", () => {
    const testServices = [
      {
        id: "1",
        name: "Public Active",
        isPublic: true,
        isActive: true,
        requiredGroups: [],
      },
      {
        id: "2",
        name: "Public Inactive",
        isPublic: true,
        isActive: false,
        requiredGroups: [],
      },
      {
        id: "3",
        name: "Private for ops",
        isPublic: false,
        isActive: true,
        requiredGroups: ["ops-team"],
      },
      {
        id: "4",
        name: "Private for marketing",
        isPublic: false,
        isActive: true,
        requiredGroups: ["marketing"],
      },
      {
        id: "5",
        name: "Private inactive",
        isPublic: false,
        isActive: false,
        requiredGroups: ["ops-team"],
      },
    ];

    it("shows only public active services for user with no groups", () => {
      const visible = filterVisibleServices([], testServices);
      expect(visible).toHaveLength(1);
      expect(visible[0].name).toBe("Public Active");
    });

    it("shows public + matching group services", () => {
      const visible = filterVisibleServices(["ops-team"], testServices);
      expect(visible).toHaveLength(2);
      expect(visible.map((s) => s.name)).toEqual([
        "Public Active",
        "Private for ops",
      ]);
    });

    it("shows public + all matching group services", () => {
      const visible = filterVisibleServices(
        ["ops-team", "marketing"],
        testServices
      );
      expect(visible).toHaveLength(3);
      expect(visible.map((s) => s.name)).toEqual([
        "Public Active",
        "Private for ops",
        "Private for marketing",
      ]);
    });

    it("never shows inactive services", () => {
      const visible = filterVisibleServices(
        ["ops-team", "marketing", "dashboard-admins"],
        testServices
      );
      expect(visible.every((s) => s.isActive)).toBe(true);
    });
  });
});
