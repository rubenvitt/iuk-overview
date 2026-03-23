import Link from "next/link";
import { LayoutGrid, Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LayoutGrid className="size-5 text-primary" />
          <span className="text-lg">I&K Services</span>
        </Link>
        <div className="flex items-center gap-2">
          {session.user.isAdmin && (
            <Button variant="ghost" size="sm" render={<Link href="/admin" />} className="flex items-center gap-1.5">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Verwaltung</span>
            </Button>
          )}
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
