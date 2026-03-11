"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Menu, LogOut, User, LayoutDashboard, LogIn, Sprout } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useAuth();
  const logout = useLogout();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background/50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              Food<span className="text-primary">Rescue</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            {user?.role === "Provider" && (
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Our Impact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                      <User className="w-5 h-5 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary w-fit">
                          {user.role}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "Provider" && (
                      <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer rounded-xl">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => logout.mutate()} 
                      className="cursor-pointer text-destructive focus:text-destructive rounded-xl"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost" className="hidden sm:flex rounded-xl font-medium">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="rounded-xl shadow-lg shadow-primary/25 font-medium">Get Started</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white mt-auto">
        <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 opacity-80">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-lg">FoodRescue</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Saving meals. Offsetting carbon. Feeding communities.
          </p>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FoodRescue. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
