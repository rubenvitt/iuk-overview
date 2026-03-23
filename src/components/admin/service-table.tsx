"use client";

import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reorderServicesAction } from "@/app/admin/actions";
import type { Service } from "@/db/schema";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServiceTable({ services, onEdit, onDelete }: ServiceTableProps) {
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updates = [
      { id: services[index].id, sortOrder: services[index - 1].sortOrder },
      { id: services[index - 1].id, sortOrder: services[index].sortOrder },
    ];
    const result = await reorderServicesAction(updates);
    if (result.success) {
      toast.success("Reihenfolge aktualisiert");
    } else {
      toast.error(result.error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === services.length - 1) return;
    const updates = [
      { id: services[index].id, sortOrder: services[index + 1].sortOrder },
      { id: services[index + 1].id, sortOrder: services[index].sortOrder },
    ];
    const result = await reorderServicesAction(updates);
    if (result.success) {
      toast.success("Reihenfolge aktualisiert");
    } else {
      toast.error(result.error);
    }
  };

  if (services.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Noch keine Services angelegt. Erstellen Sie den ersten Service.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Reihenfolge</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Kategorie</TableHead>
            <TableHead className="hidden lg:table-cell">URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sichtbarkeit</TableHead>
            <TableHead className="w-28">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service, index) => (
            <TableRow key={service.id}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground w-6">
                    {service.sortOrder}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === services.length - 1}
                    onClick={() => handleMoveDown(index)}
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{service.name}</div>
                <div className="text-xs text-muted-foreground">
                  {service.slug}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {service.category ? (
                  <Badge variant="secondary">{service.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">–</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="max-w-48 truncate text-xs text-muted-foreground block">
                  {service.url}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={service.isActive ? "default" : "secondary"}
                  className={
                    service.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {service.isActive ? "Aktiv" : "Inaktiv"}
                </Badge>
              </TableCell>
              <TableCell>
                {service.isPublic ? (
                  <Badge variant="outline">Öffentlich</Badge>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {service.requiredGroups.map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onEdit(service)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(service)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
