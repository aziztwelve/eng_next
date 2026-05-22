"use client";

import { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { SubscribeBanner } from "./notifications/subscribe-banner";
import { AuthGuard } from "./auth-guard";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <SubscribeBanner />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <AuthGuard>{children}</AuthGuard>
      </main>
      <Footer />
    </div>
  );
}
