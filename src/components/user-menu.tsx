"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const user = session.user;
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative size-9 rounded-full cursor-pointer outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-9">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {user.groups && user.groups.length > 0 && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Gruppen
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <div className="px-2 pb-2 flex flex-wrap gap-1">
              {user.groups.map((group) => (
                <Badge key={group} variant="secondary" className="text-xs">
                  {user.isAdmin && group === process.env.NEXT_PUBLIC_ADMIN_GROUP ? (
                    <Shield className="mr-1 size-3" />
                  ) : null}
                  {group}
                </Badge>
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/api/auth/oidc-signout" })}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
