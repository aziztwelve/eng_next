"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { useIsAuthenticated, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, BookOpen, LayoutDashboard, Languages, Flame, Heart, Zap, LogOut, User } from "lucide-react";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const logoutMutation = useLogout();

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "en" : "ru");
  };

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { to: "/", icon: Home, label: t("common.home") },
    { to: "/courses", icon: BookOpen, label: t("common.courses") },
    { to: "/dashboard", icon: LayoutDashboard, label: t("common.dashboard") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all">
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">LingoLearn</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} href={item.to}>
                <Button variant="ghost" className="gap-2 rounded-xl hover:bg-accent/50">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-4 mr-2 sm:mr-4">
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <Flame className="h-5 w-5 fill-current" />
                <span>5</span>
              </div>
              <div className="flex items-center gap-1 text-red-500 font-bold">
                <Heart className="h-5 w-5 fill-current" />
                <span>3</span>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-xl border-2 hover:bg-accent/50 gap-2"
          >
            <Languages className="h-4 w-4" />
            <span className="uppercase font-bold">{language}</span>
          </Button>

          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_4px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none transition-all">
                    Login
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
