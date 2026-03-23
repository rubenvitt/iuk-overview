"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  categories: string[];
}

export function SearchFilter({ categories }: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const currentCategory = searchParams.get("category") ?? "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams("search", search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, updateParams]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Anwendungen durchsuchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={() => setSearch("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={currentCategory === "" ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => updateParams("category", "")}
          >
            Alle
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={currentCategory === cat ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() =>
                updateParams("category", currentCategory === cat ? "" : cat)
              }
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
