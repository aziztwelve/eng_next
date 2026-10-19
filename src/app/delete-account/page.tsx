import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Удаление аккаунта — LingoIQ",
  description:
    "Как удалить аккаунт LingoIQ и связанные с ним данные: в приложении или по email.",
};

// Должен совпадать с контактом в политике конфиденциальности (/privacy).
const CONTACT_EMAIL = "privacy@lingoiq.online";
const EFFECTIVE_DATE = "16 июня 2026 г.";

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-200">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Удаление аккаунта LingoIQ
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        Приложение «LingoIQ» (пакет <code>com.aziztwelve.engmob</code>). Дата
        вступления в силу: {EFFECTIVE_DATE}.
      </p>

      <Section title="1. Удалить аккаунт в приложении">
        <ol className="ml-6 list-decimal space-y-2">
          <li>Откройте приложение LingoIQ и войдите в аккаунт.</li>
          <li>Перейдите в раздел «Профиль» и откройте «Настройки».</li>
          <li>Выберите «Удалить аккаунт» и подтвердите действие.</li>
        </ol>
        <p>
          После подтверждения аккаунт и связанные с ним данные удаляются из
          нашей системы. Восстановить аккаунт после удаления нельзя.
        </p>
      </Section>

      <Section title="2. Удалить аккаунт без приложения">
        <p>
          Если у вас нет доступа к приложению, отправьте письмо на{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Удаление аккаунта LingoIQ")}`}
            className="text-blue-400 underline"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          с адреса электронной почты, которым вы регистрировались в приложении.
          В письме укажите, что просите удалить аккаунт. Мы можем попросить
          подтвердить, что вы владеете этим адресом.
        </p>
      </Section>

      <Section title="3. Какие данные удаляются">
        <ul className="ml-6 list-disc space-y-2">
          <li>адрес электронной почты, имя и фотография профиля;</li>
          <li>пароль (если вход выполнялся по email);</li>
          <li>возраст и настройки обучения, цели и уровень;</li>
          <li>прогресс в уроках, XP, серии, достижения и результаты тестов;</li>
          <li>история чатов с ИИ и тексты, которые вы отправляли для проверки;</li>
          <li>аудиозаписи произношения;</li>
          <li>друзья, лиги и участие в рейтингах;</li>
          <li>токены push-уведомлений на ваших устройствах.</li>
        </ul>
      </Section>

      <Section title="4. Сроки удаления">
        <p>
          Данные удаляются в течение 30 дней после удаления аккаунта.
          Обезличенная статистика, из которой нельзя узнать, кто вы, может
          сохраняться дольше.
        </p>
      </Section>

      <Section title="5. Вопросы">
        <p>
          По вопросам удаления данных пишите на{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-blue-400 underline"
          >
            {CONTACT_EMAIL}
          </a>
          . Подробнее о том, какие данные мы собираем и как их используем, — в{" "}
          <a href="/privacy" className="text-blue-400 underline">
            политике конфиденциальности
          </a>
          .
        </p>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 space-y-3 leading-relaxed">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
