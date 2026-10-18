/**
 * testimonials — отзывы реальных учеников для interstitial-building карусели.
 *
 * Hard-coded, без backend. Каждый отзыв локализован под ru/en/uz/tg
 * (имена остаются такими как написаны — не транслитерируем).
 *
 * Используется в `<TestimonialCarousel>` (см. docs/tasks/web/onboarding-v3-oki-style.md §3.3).
 * Аватары — заглушки emoji; реальные фото добавим позже (Phase 6).
 *
 * Тоналити: краткий, конкретный, "ситуация → результат". Без штампов
 * вроде "лучшее приложение". Каждый testimonial привязан к goal-кластеру,
 * чтобы карусель можно было фильтровать (interstitial-building показывает
 * 2-3 отзыва под выбранную goal + 1-2 общих).
 *
 * ⚠️ TODO(i18n): UZ/TG переводы — машинно-сгенерированные черновики,
 * требуют ревью носителем перед production rollout. RU и EN — финальные.
 */

import type { UiLanguage } from '../supported-languages';

export type TestimonialGoal =
  | 'work'         // работа / карьера
  | 'business_english' // деловой английский
  | 'travel'       // путешествия
  | 'exam'         // экзамены / учёба
  | 'speaking'     // разговорная практика
  | 'listening_shadowing' // Listening & Shadowing
  | 'study';       // школа / университет

export interface Testimonial {
  id: string;
  /** Эмодзи-аватар-плейсхолдер; в Phase 6 заменим на photo URL. */
  avatarEmoji: string;
  /** Возраст для социального доказательства ("Алина, 28"). */
  age: number;
  /** 1-5; для отображения как звёзды. */
  stars: 4 | 5;
  /** К каким goal'ам релевантен этот отзыв. Используется для фильтрации. */
  goals: TestimonialGoal[];
  /** Имя — не переводится (используется как есть для всех локалей). */
  name: string;
  /** Бейдж — короткая подпись под именем (напр. "60-day streak"). */
  badge: { ru: string; en: string; uz: string; tg: string };
  /** Текст отзыва, локализованный. */
  quote: { ru: string; en: string; uz: string; tg: string };
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'alina-work',
    avatarEmoji: '👩‍💻',
    age: 28,
    stars: 5,
    goals: ['work'],
    name: 'Алина',
    badge: {
      ru: '60 дней подряд',
      en: '60-day streak',
      uz: '60 kun ketma-ket',
      tg: '60 рӯзи пайдарпай',
    },
    quote: {
      ru: 'Через два месяца уверенно веду созвоны с зарубежной командой. Раньше пряталась за «later» в чате — теперь говорю сама.',
      en: 'After two months I confidently lead calls with our overseas team. I used to hide behind "later" in chat — now I speak up.',
      uz: 'Ikki oydan keyin xorijdagi jamoam bilan ishonchli qoʻngʻiroqlar oʻtkazaman. Avval chatda "later" ortiga yashirinardim — endi oʻzim gapiraman.',
      tg: 'Пас аз ду моҳ бо тими хориҷии худ боварии комил доранд гуфтугӯ мекунам. Қаблан дар чат "later" пинҳон мешудам — ҳозир худам гап мезанам.',
    },
  },
  {
    id: 'damir-travel',
    avatarEmoji: '🧑‍🎒',
    age: 24,
    stars: 5,
    goals: ['travel'],
    name: 'Дамир',
    badge: {
      ru: 'Учусь 4 месяца',
      en: 'Learning for 4 months',
      uz: '4 oydan beri oʻrganaman',
      tg: '4 моҳ аст ки таҳсил мекунам',
    },
    quote: {
      ru: 'Слетал в Барселону без переводчика. Заказывал кофе, болтал с барменом и понял, что мой испанский живой.',
      en: 'Went to Barcelona without a translator app. Ordered coffee, chatted with the bartender — my Spanish is actually alive.',
      uz: 'Tarjimonsiz Barselonaga uchdim. Kofe buyurtma berdim, barmen bilan suhbatlashdim — ispan tilim haqiqatan tirik ekan.',
      tg: 'Бе тарҷумон ба Барселона рафтам. Қаҳва фармудам, бо бармен сӯҳбат кардам — испаниам зинда будааст.',
    },
  },
  {
    id: 'marina-exam',
    avatarEmoji: '👩‍🎓',
    age: 19,
    stars: 5,
    goals: ['exam', 'study'],
    name: 'Марина',
    badge: {
      ru: 'IELTS 7.5',
      en: 'IELTS 7.5',
      uz: 'IELTS 7.5',
      tg: 'IELTS 7.5',
    },
    quote: {
      ru: 'Готовилась к IELTS параллельно с университетом. 15 минут утром и плюс к моему запасу — каждый день. Сдала на 7.5.',
      en: 'Prepped for IELTS while in university. 15 minutes every morning added to my vocab — every day. Got a 7.5.',
      uz: 'Universitet bilan birga IELTSga tayyorlandim. Har kuni ertalab 15 daqiqa lugʻatimga qoʻshildi. 7.5 oldim.',
      tg: 'Дар баробари донишгоҳ ба IELTS омода шудам. Ҳар саҳар 15 дақиқа ба захираам илова мекард. 7.5 гирифтам.',
    },
  },
  {
    id: 'sergey-listening-shadowing',
    avatarEmoji: '🧑‍🦳',
    age: 54,
    stars: 4,
    goals: ['listening_shadowing'],
    name: 'Сергей',
    badge: {
      ru: 'Учусь после 50',
      en: 'Started after 50',
      uz: '50 yoshdan keyin boshladim',
      tg: 'Пас аз 50-солагӣ оғоз кардам',
    },
    quote: {
      ru: 'Не думал, что мозг ещё так хорошо учится. Через 3 месяца смотрю английские лекции без субтитров — и это лучшая тренировка для головы.',
      en: 'Did not expect my brain to learn this well. Three months in I watch English lectures without subtitles — best workout for the mind.',
      uz: 'Miyam shunchalik yaxshi oʻrganishini kutmagandim. 3 oydan keyin ingliz tilidagi maʼruzalarni subtitrsiz koʻraman — fikr uchun eng yaxshi mashq.',
      tg: 'Гумон намекардам, ки майнам то ин ҳад хуб омӯзад. Пас аз 3 моҳ лекцияҳои англисиро бе субтитр тамошо мекунам — беҳтарин машқ барои ақл.',
    },
  },
  {
    id: 'aisulu-speaking',
    avatarEmoji: '👩‍🔬',
    age: 31,
    stars: 5,
    goals: ['speaking', 'work'],
    name: 'Айсулу',
    badge: {
      ru: 'Заговорила по-немецки',
      en: 'Started speaking German',
      uz: 'Nemischa gapira boshladim',
      tg: 'Ба олмонӣ гап заданро оғоз кардам',
    },
    quote: {
      ru: 'Сначала боялась говорить по-немецки. Lumi помог начать с коротких диалогов — теперь спокойно общаюсь на работе и в повседневных ситуациях.',
      en: 'At first I was afraid to speak German. Lumi helped me start with short dialogues — now I communicate calmly at work and in everyday situations.',
      uz: 'Avval nemischa gapirishdan qoʻrqardim. Lumi qisqa dialoglardan boshlashga yordam berdi — endi ishda va kundalik vaziyatlarda bemalol gaplashaman.',
      tg: 'Дар аввал аз олмонӣ гап задан метарсидам. Lumi ба ман кӯмак кард, ки аз муколамаҳои кӯтоҳ оғоз кунам — ҳоло дар кор ва зиндагии ҳаррӯза озодона сӯҳбат мекунам.',
    },
  },
  {
    id: 'timur-content',
    avatarEmoji: '🎮',
    age: 17,
    stars: 5,
    goals: ['listening_shadowing'],
    name: 'Тимур',
    badge: {
      ru: 'Школьник',
      en: 'High-school student',
      uz: 'Maktab oʻquvchisi',
      tg: 'Хонандаи мактаб',
    },
    quote: {
      ru: 'Смотрю аниме без сабов и понимаю 70%. Друзья спрашивают, где учусь — теперь я тут «учитель».',
      en: 'Watch anime without subs and catch 70%. Friends keep asking where I learn — now I am the "teacher" in our group.',
      uz: 'Animeni subtitrsiz koʻraman va 70%ni tushunaman. Doʻstlarim qayerda oʻrganishimni soʻrashadi — endi guruhda "oʻqituvchi" menman.',
      tg: 'Анимеро бе субтитр тамошо мекунам ва 70%ро мефаҳмам. Дӯстонам мепурсанд, ки куҷо мехонам — ҳоло ман дар гурӯҳамон "муаллим"-ам.',
    },
  },
];

/**
 * Возвращает отзывы под выбранную goal: до `limit` отзывов, отсортированных
 * по релевантности (точное попадание goal первыми, потом общие).
 */
export function testimonialsForGoal(
  goal: TestimonialGoal | null,
  limit = 4,
): Testimonial[] {
  if (!goal) return TESTIMONIALS.slice(0, limit);
  const exact = TESTIMONIALS.filter((t) => t.goals.includes(goal));
  const rest = TESTIMONIALS.filter((t) => !t.goals.includes(goal));
  return [...exact, ...rest].slice(0, limit);
}

export function localizedQuote(t: Testimonial, ui: UiLanguage): string {
  return t.quote[ui] ?? t.quote.ru;
}

export function localizedBadge(t: Testimonial, ui: UiLanguage): string {
  return t.badge[ui] ?? t.badge.ru;
}
