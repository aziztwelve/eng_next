# Admin Panel - Frontend Documentation

Документация фронтенд части административной панели.

## Содержание

- [Overview](./overview.md) - Общий обзор
- [Components](./components.md) - Компоненты
- [Pages](./pages.md) - Страницы
- [API Integration](./api-integration.md) - Интеграция с API
- [Styling](./styling.md) - Стилизация

## Технологии

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Forms**: React Hook Form (planned)

## Структура проекта

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Admin layout с sidebar
│       ├── login/
│       │   └── page.tsx        # Страница входа
│       ├── page.tsx            # Dashboard
│       ├── users/
│       │   ├── page.tsx        # Список пользователей
│       │   └── [id]/page.tsx   # Редактирование пользователя
│       ├── courses/
│       │   ├── page.tsx        # Список курсов
│       │   ├── new/page.tsx    # Создание курса
│       │   └── [id]/page.tsx   # Редактирование курса
│       └── videos/
│           ├── page.tsx        # Список видео
│           └── upload/page.tsx # Загрузка видео
├── components/
│   └── admin/
│       ├── Sidebar.tsx         # Боковое меню
│       ├── Header.tsx          # Шапка
│       └── course/
│           ├── ModuleManager.tsx    # Управление модулями
│           ├── LessonManager.tsx    # Управление уроками
│           ├── StepManager.tsx      # Управление шагами
│           ├── RichTextEditor.tsx   # Markdown редактор
│           └── VideoSelector.tsx    # Выбор видео
└── lib/
    └── admin-api.ts            # API клиент
```

## Быстрый старт

### Development

```bash
npm install
npm run dev
```

Откройте http://localhost:3000/admin

### Production

```bash
npm run build
npm start
```

Или через PM2:
```bash
pm2 start npm --name "eng_next" -- start
```

## Аутентификация

Admin панель использует cookie-based аутентификацию:

1. Пользователь входит через `/admin/login`
2. Backend возвращает JWT токен
3. Токен сохраняется в cookie `auth_token`
4. Роль сохраняется в cookie `user_role`
5. Middleware проверяет токен и роль на каждом запросе

### Middleware Protection

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = request.cookies.get('auth_token');
    const role = request.cookies.get('user_role');
    
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
}
```

## API Integration

Все API запросы идут через `lib/admin-api.ts`:

```typescript
import { adminApi } from '@/lib/admin-api';

// Получить список курсов
const courses = await adminApi.courses.list();

// Создать курс
const course = await adminApi.courses.create({
  title: 'New Course',
  level: 'A1'
});
```

## Компоненты

### Layout Components

- **Sidebar** - навигация по разделам
- **Header** - шапка с информацией о пользователе

### Course Components

- **ModuleManager** - CRUD для модулей
- **LessonManager** - CRUD для уроков
- **StepManager** - CRUD для шагов (text/video/quiz)
- **RichTextEditor** - Markdown редактор с preview
- **VideoSelector** - Modal для выбора видео

## Стилизация

Используется Tailwind CSS с кастомной конфигурацией:

```typescript
// tailwind.config.ts
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
    },
  },
}
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Deployment

### Vercel (рекомендуется)
```bash
vercel deploy
```

### Docker
```bash
docker build -t eng_next .
docker run -p 3000:3000 eng_next
```

### PM2
```bash
npm run build
pm2 start npm --name "eng_next" -- start
pm2 save
```

## Troubleshooting

### Проблемы с аутентификацией
1. Проверьте что backend запущен
2. Проверьте NEXT_PUBLIC_API_URL
3. Проверьте cookies в DevTools

### Проблемы с загрузкой видео
1. Проверьте размер файла (max 100MB)
2. Проверьте формат (video/mp4)
3. Проверьте network tab в DevTools

### Проблемы с динамическими роутами
1. Используйте `React.use()` для async params в Next.js 15+
2. Проверьте что params правильно передаются

## Best Practices

1. **Используйте TypeScript** для type safety
2. **Валидируйте формы** перед отправкой
3. **Показывайте loading states** во время запросов
4. **Обрабатывайте ошибки** gracefully
5. **Используйте оптимистичные обновления** где возможно
6. **Кешируйте данные** с помощью React Query (planned)
