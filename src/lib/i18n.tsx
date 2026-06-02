"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { ruCommon } from './i18n-ns/ru/common';
import { enCommon } from './i18n-ns/en/common';
import { uzCommon } from './i18n-ns/uz/common';
import { tgCommon } from './i18n-ns/tg/common';
import { ruHome } from './i18n-ns/ru/home';
import { enHome } from './i18n-ns/en/home';
import { uzHome } from './i18n-ns/uz/home';
import { tgHome } from './i18n-ns/tg/home';
import { ruDashboard } from './i18n-ns/ru/dashboard';
import { enDashboard } from './i18n-ns/en/dashboard';
import { uzDashboard } from './i18n-ns/uz/dashboard';
import { tgDashboard } from './i18n-ns/tg/dashboard';
import { ruCourses } from './i18n-ns/ru/courses';
import { enCourses } from './i18n-ns/en/courses';
import { uzCourses } from './i18n-ns/uz/courses';
import { tgCourses } from './i18n-ns/tg/courses';
import { ruStudy } from './i18n-ns/ru/study';
import { enStudy } from './i18n-ns/en/study';
import { uzStudy } from './i18n-ns/uz/study';
import { tgStudy } from './i18n-ns/tg/study';
import { ruTracks } from './i18n-ns/ru/tracks';
import { enTracks } from './i18n-ns/en/tracks';
import { uzTracks } from './i18n-ns/uz/tracks';
import { tgTracks } from './i18n-ns/tg/tracks';
import { ruLessons } from './i18n-ns/ru/lessons';
import { enLessons } from './i18n-ns/en/lessons';
import { uzLessons } from './i18n-ns/uz/lessons';
import { tgLessons } from './i18n-ns/tg/lessons';
import { ruQuiz } from './i18n-ns/ru/quiz';
import { enQuiz } from './i18n-ns/en/quiz';
import { uzQuiz } from './i18n-ns/uz/quiz';
import { tgQuiz } from './i18n-ns/tg/quiz';
import { ruAi } from './i18n-ns/ru/ai';
import { enAi } from './i18n-ns/en/ai';
import { uzAi } from './i18n-ns/uz/ai';
import { tgAi } from './i18n-ns/tg/ai';
import { ruPractice } from './i18n-ns/ru/practice';
import { enPractice } from './i18n-ns/en/practice';
import { uzPractice } from './i18n-ns/uz/practice';
import { tgPractice } from './i18n-ns/tg/practice';
import { ruProfile } from './i18n-ns/ru/profile';
import { enProfile } from './i18n-ns/en/profile';
import { uzProfile } from './i18n-ns/uz/profile';
import { tgProfile } from './i18n-ns/tg/profile';
import { ruFriends } from './i18n-ns/ru/friends';
import { enFriends } from './i18n-ns/en/friends';
import { uzFriends } from './i18n-ns/uz/friends';
import { tgFriends } from './i18n-ns/tg/friends';
import { ruLeagues } from './i18n-ns/ru/leagues';
import { enLeagues } from './i18n-ns/en/leagues';
import { uzLeagues } from './i18n-ns/uz/leagues';
import { tgLeagues } from './i18n-ns/tg/leagues';
import { ruGamification } from './i18n-ns/ru/gamification';
import { enGamification } from './i18n-ns/en/gamification';
import { uzGamification } from './i18n-ns/uz/gamification';
import { tgGamification } from './i18n-ns/tg/gamification';
import { ruFooter } from './i18n-ns/ru/footer';
import { enFooter } from './i18n-ns/en/footer';
import { uzFooter } from './i18n-ns/uz/footer';
import { tgFooter } from './i18n-ns/tg/footer';
import { ruNotifications } from './i18n-ns/ru/notifications';
import { enNotifications } from './i18n-ns/en/notifications';
import { uzNotifications } from './i18n-ns/uz/notifications';
import { tgNotifications } from './i18n-ns/tg/notifications';
import { ruLearn } from './i18n-ns/ru/learn';
import { enLearn } from './i18n-ns/en/learn';
import { uzLearn } from './i18n-ns/uz/learn';
import { tgLearn } from './i18n-ns/tg/learn';
import { ruAuth } from './i18n-ns/ru/auth';
import { enAuth } from './i18n-ns/en/auth';
import { uzAuth } from './i18n-ns/uz/auth';
import { tgAuth } from './i18n-ns/tg/auth';
import { ruAdmin } from './i18n-ns/ru/admin';
import { enAdmin } from './i18n-ns/en/admin';
import { uzAdmin } from './i18n-ns/uz/admin';
import { tgAdmin } from './i18n-ns/tg/admin';
import { ruOnboarding } from './i18n-ns/ru/onboarding';
import { enOnboarding } from './i18n-ns/en/onboarding';
import { uzOnboarding } from './i18n-ns/uz/onboarding';
import { tgOnboarding } from './i18n-ns/tg/onboarding';

export type Language = 'ru' | 'en' | 'uz' | 'tg';

export const LANGUAGES: Array<{ code: Language; label: string; nativeLabel: string }> = [
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'uz', label: 'Uzbek', nativeLabel: 'Oʻzbekcha' },
  { code: 'tg', label: 'Tajik', nativeLabel: 'Тоҷикӣ' },
];

const dictionary = {
  ru: {
    common: ruCommon,
    home: ruHome,
    dashboard: ruDashboard,
    courses: ruCourses,
    study: ruStudy,
    tracks: ruTracks,
    lessons: ruLessons,
    quiz: ruQuiz,
    ai: ruAi,
    practice: ruPractice,
    profile: ruProfile,
    friends: ruFriends,
    leagues: ruLeagues,
    gamification: ruGamification,
    footer: ruFooter,
    notifications: ruNotifications,
    learn: ruLearn,
    auth: ruAuth,
    admin: ruAdmin,
    onboarding: ruOnboarding,
  },
  en: {
    common: enCommon,
    home: enHome,
    dashboard: enDashboard,
    courses: enCourses,
    study: enStudy,
    tracks: enTracks,
    lessons: enLessons,
    quiz: enQuiz,
    ai: enAi,
    practice: enPractice,
    profile: enProfile,
    friends: enFriends,
    leagues: enLeagues,
    gamification: enGamification,
    footer: enFooter,
    notifications: enNotifications,
    learn: enLearn,
    auth: enAuth,
    admin: enAdmin,
    onboarding: enOnboarding,
  },
  uz: {
    common: uzCommon,
    home: uzHome,
    dashboard: uzDashboard,
    courses: uzCourses,
    study: uzStudy,
    tracks: uzTracks,
    lessons: uzLessons,
    quiz: uzQuiz,
    ai: uzAi,
    practice: uzPractice,
    profile: uzProfile,
    friends: uzFriends,
    leagues: uzLeagues,
    gamification: uzGamification,
    footer: uzFooter,
    notifications: uzNotifications,
    learn: uzLearn,
    auth: uzAuth,
    admin: uzAdmin,
    onboarding: uzOnboarding,
  },
  tg: {
    common: tgCommon,
    home: tgHome,
    dashboard: tgDashboard,
    courses: tgCourses,
    study: tgStudy,
    tracks: tgTracks,
    lessons: tgLessons,
    quiz: tgQuiz,
    ai: tgAi,
    practice: tgPractice,
    profile: tgProfile,
    friends: tgFriends,
    leagues: tgLeagues,
    gamification: tgGamification,
    footer: tgFooter,
    notifications: tgNotifications,
    learn: tgLearn,
    auth: tgAuth,
    admin: tgAdmin,
    onboarding: tgOnboarding,
  },
} as const;

const STORAGE_KEY = 'app.lang';
const DEFAULT_LANG: Language = 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANG);

  // Восстанавливаем язык из localStorage после mount (SSR-safe).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'ru' || stored === 'en' || stored === 'uz' || stored === 'tg') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored);
      }
    } catch {
      /* localStorage может быть запрещён в private-режиме */
    }
  }, []);

  // Синхронизируем <html lang="..."> для accessibility.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* ignore */
      }
    }
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let result: unknown = dictionary[language];
    for (const key of keys) {
      if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key];
      } else {
        // Фоллбэк: пробуем RU словарь (на случай если EN-ключ отсутствует).
        if (language !== 'ru') {
          let ruResult: unknown = dictionary.ru;
          for (const k of keys) {
            if (ruResult && typeof ruResult === 'object' && k in (ruResult as Record<string, unknown>)) {
              ruResult = (ruResult as Record<string, unknown>)[k];
            } else {
              ruResult = undefined;
              break;
            }
          }
          if (typeof ruResult === 'string') return ruResult;
        }
        return fallback ?? path;
      }
    }
    return typeof result === 'string' ? result : (fallback ?? path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
