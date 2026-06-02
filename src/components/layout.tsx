"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { SubscribeBanner } from "./notifications/subscribe-banner";
import { AuthGuard } from "./auth-guard";

/**
 * Глобальный layout. Для `/onboarding/*` снимаем Navbar/Footer/SubscribeBanner —
 * там полноэкранный flow со своей шапкой (`OnboardingHeader`).
 */
export function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding");

  if (isOnboarding) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
        <AuthGuard>{children}</AuthGuard>
      </div>
    );
  }

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
