"use client";

/* eslint-disable @next/next/no-img-element */
import { ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Service } from "@/db/schema";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <a
      href={service.url}
      target={service.openInNewTab ? "_blank" : "_self"}
      rel={service.openInNewTab ? "noopener noreferrer" : undefined}
      className="group block"
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {service.iconUrl ? (
                <img
                  src={service.iconUrl}
                  alt=""
                  className="size-10 rounded-lg object-contain"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="size-5" />
                </div>
              )}
              <div>
                <CardTitle className="text-base leading-tight">
                  {service.name}
                </CardTitle>
                {service.category && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {service.category}
                  </Badge>
                )}
              </div>
            </div>
            <ExternalLink className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardHeader>
        {service.description && (
          <CardContent className="pt-0">
            <CardDescription className="line-clamp-2 text-sm">
              {service.description}
            </CardDescription>
          </CardContent>
        )}
        {service.tags && service.tags.length > 0 && (
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1">
              {service.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </a>
  );
}
