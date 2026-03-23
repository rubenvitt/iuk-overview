import { z } from "zod/v4";

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  slug: z
    .string()
    .min(1, "Slug ist erforderlich")
    .regex(
      /^[a-z0-9-]+$/,
      "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt"
    ),
  description: z.string().default(""),
  url: z.url("Ungültige URL"),
  iconUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  requiredGroups: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  openInNewTab: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceFormSchema>;

export const reorderSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int(),
  })
);
