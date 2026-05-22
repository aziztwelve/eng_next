"use client";

import { Suspense, useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Mail, Lock, User, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

/**
 * AuthForm использует `useSearchParams()` через `useLogin/useRegister`
 * (для чтения `?redirect=`), поэтому весь компонент обязан жить под
 * `<Suspense>` — иначе Next.js 16 не сможет prerender'ить `/auth` в build'е
 * (CSR-bailout error).
 */
export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const { t } = useLanguage();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (flow === "signIn") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, username });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_6px_0_0_rgba(0,0,0,0.2)]">
            <Zap className="h-10 w-10 fill-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t("auth.brand")}</h1>
          <p className="text-muted-foreground text-center">
            {flow === "signIn" ? t("auth.signInTagline") : t("auth.signUpTagline")}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              {flow === "signIn" ? t("auth.cardSignInTitle") : t("auth.cardSignUpTitle")}
            </CardTitle>
            <CardDescription className="text-center">
              {flow === "signIn" ? t("auth.cardSignInDesc") : t("auth.cardSignUpDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {flow === "signUp" && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    {t("auth.usernameLabel")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder={t("auth.usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-2 bg-background/50 focus:border-primary"
                      required={flow === "signUp"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("auth.emailLabel")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 bg-background/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("auth.passwordLabel")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 bg-background/50 focus:border-primary"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_4px_0_0_#46a302] hover:bg-primary/90 active:translate-y-1 active:shadow-none transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : flow === "signIn" ? (
                  t("auth.signInBtn")
                ) : (
                  t("auth.signUpBtn")
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {flow === "signIn" ? (
                  <>
                    {t("auth.switchToSignUpQ")}{" "}
                    <span className="font-semibold text-primary">{t("auth.switchToSignUpLink")}</span>
                  </>
                ) : (
                  <>
                    {t("auth.switchToSignInQ")}{" "}
                    <span className="font-semibold text-primary">{t("auth.switchToSignInLink")}</span>
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
