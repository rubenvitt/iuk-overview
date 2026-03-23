"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createServiceAction, updateServiceAction } from "@/app/admin/actions";
import type { Service } from "@/db/schema";

interface ServiceFormProps {
  service?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äö]/g, (c) => (c === "ä" ? "ae" : "oe"))
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ServiceForm({ service, open, onOpenChange }: ServiceFormProps) {
  const router = useRouter();
  const isEdit = !!service;
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [requiredGroups, setRequiredGroups] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (open) {
      if (service) {
        setName(service.name);
        setSlug(service.slug);
        setDescription(service.description);
        setUrl(service.url);
        setIconUrl(service.iconUrl ?? "");
        setCategory(service.category ?? "");
        setTags(service.tags?.join(", ") ?? "");
        setRequiredGroups(service.requiredGroups?.join(", ") ?? "");
        setIsPublic(service.isPublic);
        setIsActive(service.isActive);
        setOpenInNewTab(service.openInNewTab);
        setSortOrder(service.sortOrder);
        setSlugTouched(true);
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setUrl("");
        setIconUrl("");
        setCategory("");
        setTags("");
        setRequiredGroups("");
        setIsPublic(true);
        setIsActive(true);
        setOpenInNewTab(true);
        setSortOrder(0);
        setSlugTouched(false);
      }
      // reset
    }
  }, [open, service]);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched && !isEdit) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.set("name", name);
    fd.set("slug", slug);
    fd.set("description", description);
    fd.set("url", url);
    fd.set("iconUrl", iconUrl);
    fd.set("category", category);
    fd.set("tags", tags);
    fd.set("requiredGroups", requiredGroups);
    fd.set("isPublic", String(isPublic));
    fd.set("isActive", String(isActive));
    fd.set("openInNewTab", String(openInNewTab));
    fd.set("sortOrder", String(sortOrder));

    try {
      const result = isEdit
        ? await updateServiceAction(service!.id, fd)
        : await createServiceAction(fd);

      if (result.success) {
        toast.success(isEdit ? "Service aktualisiert" : "Service erstellt");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Fehler beim Speichern");
      }
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Service bearbeiten" : "Neuer Service"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Ändern Sie die Eigenschaften des Services."
              : "Erstellen Sie einen neuen Service im Dashboard."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="z. B. Nextcloud"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="z. B. nextcloud"
              required
              pattern="^[a-z0-9-]+$"
            />
            <p className="text-xs text-muted-foreground">
              Nur Kleinbuchstaben, Zahlen und Bindestriche
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung des Services..."
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="iconUrl">Icon URL</Label>
            <Input
              id="iconUrl"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://example.com/icon.png"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Kategorie</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z. B. Monitoring, Entwicklung"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Kommagetrennt, z. B. intern, wichtig"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="sortOrder">Reihenfolge</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-2.5">
            <div>
              <Label htmlFor="isPublic" className="font-medium">
                Öffentlich
              </Label>
              <p className="text-xs text-muted-foreground">
                Für alle eingeloggten Nutzer sichtbar
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {!isPublic && (
            <div className="space-y-1">
              <Label htmlFor="requiredGroups">Erforderliche Gruppen</Label>
              <Input
                id="requiredGroups"
                value={requiredGroups}
                onChange={(e) => setRequiredGroups(e.target.value)}
                placeholder="Kommagetrennt, z. B. ops-team, dev-team"
              />
              <p className="text-xs text-muted-foreground">
                Nutzer benötigen mindestens eine dieser Gruppen
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-2.5">
            <div>
              <Label htmlFor="isActive" className="font-medium">
                Aktiv
              </Label>
              <p className="text-xs text-muted-foreground">
                Inaktive Services werden nicht angezeigt
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-2.5">
            <div>
              <Label htmlFor="openInNewTab" className="font-medium">
                In neuem Tab öffnen
              </Label>
              <p className="text-xs text-muted-foreground">
                Link in einem neuen Browser-Tab öffnen
              </p>
            </div>
            <Switch
              id="openInNewTab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Speichern..."
                : isEdit
                  ? "Speichern"
                  : "Erstellen"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
