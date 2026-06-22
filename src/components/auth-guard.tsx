"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useIsAuthenticated } from "@/hooks/use-auth";

/**
 * Public routes — доступны без авторизации. Всё остальное требует логина.
 *
 * Правила matching:
 *   - точное совпадение `pathname === route`
 *   - префикс `pathname.startsWith(route + '/')`
 *   - `/admin/*` — управляется отдельно через server-side proxy.ts (cookie-based)
 */
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/courses",
  "/tracks",
  "/onboarding",
  // Юридические / публичные страницы (требуются Google Play, должны быть без логина)
  "/privacy",
  "/terms",
  "/about",
  "/contact",
];

function isPublicPath(pathname: string): boolean {
  // `/admin/*` имеет свой server-side guard через proxy.ts, AuthGuard его не трогает.
  if (pathname.startsWith("/admin")) return true;

  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

/**
 * Client-side AuthGuard. Заворачивается вокруг всего приложения и:
 *  - на public маршрутах — рендерит children как есть;
 *  - на protected маршрутах + есть токен — рендерит children;
 *  - на protected маршрутах + нет токена — редиректит на `/auth?redirect=<path>`
 *    и показывает full-page loader пока useEffect не отработал.
 *
 * Сам токен хранится в localStorage (см. `AuthService`), поэтому проверка
 * происходит после mount'а в `useIsAuthenticated` — это нормально для SPA-стиля.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  const publicPath = isPublicPath(pathname);

  useEffect(() => {
    if (publicPath) return;
    if (isLoading) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/auth?redirect=${redirect}`);
    }
  }, [publicPath, isLoading, isAuthenticated, pathname, router]);

  // Public routes — рендерим без блокировки.
  if (publicPath) return <>{children}</>;

  // Protected: пока проверяем auth или редиректим — показываем full-page loader.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
