# API Integration

## Обзор

Проект интегрирован с backend API из мобильного приложения. Все эндпоинты и типы данных синхронизированы.

## Конфигурация

### Environment Variables

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1
```

## API Client

### Использование

```typescript
import { ApiClient } from '@/lib/api-client';

// GET запрос
const data = await ApiClient.get<ResponseType>('/endpoint');

// POST запрос
const result = await ApiClient.post<ResponseType>('/endpoint', { data });
```

### Автоматическая авторизация

API Client автоматически добавляет Bearer токен из localStorage к каждому запросу.

## Аутентификация

### Хуки

```typescript
import { useLogin, useRegister, useLogout, useIsAuthenticated } from '@/hooks/use-auth';

// Вход
const loginMutation = useLogin();
loginMutation.mutate({ email, password });

// Регистрация
const registerMutation = useRegister();
registerMutation.mutate({ email, password, username });

// Выход
const logoutMutation = useLogout();
logoutMutation.mutate();

// Проверка аутентификации
const { isAuthenticated, isLoading } = useIsAuthenticated();
```

### Эндпоинты

- `POST /auth/login` - вход в систему
- `POST /auth/register` - регистрация нового пользователя
- `GET /auth/me` - получение текущего пользователя

## Курсы

### Хуки

```typescript
import { useCourses, useCourse, useEnrollCourse } from '@/hooks/use-courses';

// Список курсов с фильтрами
const { data: courses, isLoading } = useCourses({
  search: 'react',
  level: ['B1', 'B2'],
  page: 1,
  limit: 20
});

// Детали курса
const { data: course } = useCourse(courseId);

// Запись на курс
const enrollMutation = useEnrollCourse();
enrollMutation.mutate(courseId);
```

### Эндпоинты

- `GET /courses?page=&limit=&search=&level=&sort=&order=` - список курсов
- `GET /courses/{id}` - детали курса
- `POST /courses/{courseId}/enroll` - запись на курс
- `GET /enrollments/check?user_id=&course_id=` - проверка доступа

## Хранение токенов

Токены хранятся в `localStorage`:
- `access_token` - токен доступа
- `refresh_token` - токен обновления
- `user` - данные пользователя (JSON)

## Обработка ошибок

Все ошибки API автоматически отображаются через `sonner` toast уведомления.

```typescript
// Успех
toast.success('Operation completed!');

// Ошибка
toast.error('Something went wrong');
```

## React Query

Все API запросы используют React Query для:
- Кэширования данных
- Автоматического обновления
- Управления состоянием загрузки
- Оптимистичных обновлений

### Конфигурация

```typescript
// src/lib/query-provider.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 минута
      refetchOnWindowFocus: false,
    },
  },
});
```

## Типы данных

Все типы API находятся в `src/types/api.ts`:

- `User`, `UserProfile` - пользователи
- `Course`, `CourseDetails` - курсы
- `Lesson`, `LessonDetails` - уроки
- `Step`, `StepProgress` - шаги и прогресс
- `AuthResponse`, `LoginRequest`, `RegisterRequest` - аутентификация

## Следующие шаги

1. Запустите backend API на `http://localhost:8081`
2. Проверьте подключение через страницу `/auth`
3. После входа токены будут сохранены автоматически
4. Все защищенные эндпоинты будут работать с авторизацией

## Troubleshooting

### CORS ошибки

Убедитесь, что backend API настроен для приема запросов с `http://localhost:3004`.

### Токены не сохраняются

Проверьте, что localStorage доступен в браузере (не в режиме инкогнито).

### API не отвечает

Проверьте, что backend запущен на правильном порту и доступен.
