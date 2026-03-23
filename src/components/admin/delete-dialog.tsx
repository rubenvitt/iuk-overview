"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteServiceAction } from "@/app/admin/actions";
import type { Service } from "@/db/schema";

interface DeleteDialogProps {
  service?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({
  service,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!service) return;
    setLoading(true);
    try {
      const result = await deleteServiceAction(service.id);
      if (result.success) {
        toast.success(`"${service.name}" wurde gelöscht`);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Fehler beim Löschen");
      }
    } catch {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Service löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Dieser Vorgang kann nicht rückgängig gemacht werden. Der Service
            &quot;{service?.name}&quot; wird dauerhaft gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Löschen..." : "Löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
