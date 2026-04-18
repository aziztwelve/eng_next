"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100">LingoLearn</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              {t("home.heroSubtitle")}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              {t("footer.platform")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("common.home")}
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("common.courses")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("common.dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              {t("footer.about")}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  {t("footer.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 LingoLearn. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {/* Social icons can go here if needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
