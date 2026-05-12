"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ru' | 'en';

type Dictionary = {
  [key in Language]: {
    [key: string]: string | any;
  };
};

const dictionary: Dictionary = {
  ru: {
    common: {
      hearts: 'Жизни',
      xp: 'Опыт',
      streak: 'Ударный режим',
      level: 'Уровень',
      start: 'Начать',
      check: 'Проверить',
      continue: 'Продолжить',
      back: 'Назад',
      home: 'Главная',
      courses: 'Курсы',
      dashboard: 'Дашборд',
      learn: 'Учиться',
      tracks: 'Треки',
      daily: 'Урок дня',
      explore_tracks: 'Изучай по интересам',
      standalone: 'Свободный урок',
      search: 'Поиск...',
      all: 'Все',
      enrolled: 'Мои курсы',
      filters: 'Фильтры',
      stats: 'Статистика',
      leaderboard: 'Лидеры',
      goals: 'Цели',
      dailyGoal: 'Дневная цель',
      achievements: 'Достижения',
      enroll: 'Записаться',
      start_learning: 'Начать обучение',
      curriculum: 'Программа',
      reviews: 'Отзывы',
      success: 'Отлично!',
      error: 'Ошибка!',
      correct: 'Правильно!',
      incorrect: 'Неправильно. Правильный ответ:',
    },
    home: {
      heroTitle: 'Учись весело и эффективно',
      heroSubtitle: 'Осваивай новые навыки с игровыми механиками и реальными проектами.',
      featuredCourses: 'Популярные курсы',
      statsTitle: 'Твои успехи за сегодня',
    },
    dashboard: {
      welcome: 'Привет, Студент!',
      dailyProgress: 'Прогресс за день',
      weeklyActivity: 'Активность за неделю',
    },
    learn: {
      outOfLives: 'У вас закончились жизни! Подождите восстановления или используйте алмазы.',
      complete: 'Поздравляем! Вы завершили урок.',
    },
    footer: {
      platform: 'Платформа',
      legal: 'Юридическая информация',
      about: 'О нас',
      contact: 'Контакты',
      terms: 'Условия использования',
      privacy: 'Конфиденциальность',
    },
    study: {
      overview: 'Обзор',
      qa: 'Вопросы и ответы',
      resources: 'Ресурсы',
      complete_continue: 'Завершить и продолжить',
      course_content: 'Содержание курса',
      next_lesson: 'Следующий урок',
      previous_lesson: 'Предыдущий урок',
    }
  },
  en: {
    common: {
      hearts: 'Hearts',
      xp: 'XP',
      streak: 'Streak',
      level: 'Level',
      start: 'Start',
      check: 'Check',
      continue: 'Continue',
      back: 'Back',
      home: 'Home',
      courses: 'Courses',
      dashboard: 'Dashboard',
      learn: 'Learn',
      tracks: 'Tracks',
      daily: 'Daily Lesson',
      explore_tracks: 'Explore by topic',
      standalone: 'Standalone lesson',
      search: 'Search...',
      all: 'All',
      enrolled: 'My Courses',
      filters: 'Filters',
      stats: 'Stats',
      leaderboard: 'Leaderboard',
      goals: 'Goals',
      dailyGoal: 'Daily Goal',
      achievements: 'Achievements',
      enroll: 'Enroll',
      start_learning: 'Start Learning',
      curriculum: 'Curriculum',
      reviews: 'Reviews',
      success: 'Great!',
      error: 'Error!',
      correct: 'Correct!',
      incorrect: 'Incorrect. Correct answer:',
    },
    home: {
      heroTitle: 'Learn Fun & Effectively',
      heroSubtitle: 'Master new skills with gamified mechanics and real-world projects.',
      featuredCourses: 'Featured Courses',
      statsTitle: "Today's Progress",
    },
    dashboard: {
      welcome: 'Hello, Student!',
      dailyProgress: 'Daily Progress',
      weeklyActivity: 'Weekly Activity',
    },
    learn: {
      outOfLives: 'You are out of lives! Wait for recovery or use gems.',
      complete: 'Congratulations! You completed the lesson.',
    },
    footer: {
      platform: 'Platform',
      legal: 'Legal',
      about: 'About',
      contact: 'Contact',
      terms: 'Terms',
      privacy: 'Privacy',
    },
    study: {
      overview: 'Overview',
      qa: 'Q&A',
      resources: 'Resources',
      complete_continue: 'Complete & Continue',
      course_content: 'Course Content',
      next_lesson: 'Next Lesson',
      previous_lesson: 'Previous Lesson',
    }
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (path: string): string => {
    const keys = path.split('.');
    let result: any = dictionary[language];
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        return path;
      }
    }
    return result;
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
