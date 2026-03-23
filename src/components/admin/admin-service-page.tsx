"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceTable } from "@/components/admin/service-table";
import { ServiceForm } from "@/components/admin/service-form";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import type { Service } from "@/db/schema";

interface AdminServicePageProps {
  services: Service[];
}

export function AdminServicePage({ services }: AdminServicePageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editService, setEditService] = useState<Service | undefined>();
  const [deleteService, setDeleteService] = useState<Service | undefined>();

  const handleEdit = (service: Service) => {
    setEditService(service);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditService(undefined);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditService(undefined);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Service-Verwaltung
          </h1>
          <p className="mt-1 text-muted-foreground">
            Anwendungen im Dashboard verwalten
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Neuer Service
        </Button>
      </div>

      <ServiceTable
        services={services}
        onEdit={handleEdit}
        onDelete={setDeleteService}
      />

      <ServiceForm
        service={editService}
        open={formOpen}
        onOpenChange={handleFormClose}
      />

      <DeleteDialog
        service={deleteService}
        open={!!deleteService}
        onOpenChange={(open) => {
          if (!open) setDeleteService(undefined);
        }}
      />
    </div>
  );
}
