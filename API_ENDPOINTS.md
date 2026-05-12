# API Endpoints Documentation

## Полный список эндпоинтов

### 🔐 Аутентификация

#### POST /auth/login
Вход в систему

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Hook:**
```typescript
const loginMutation = useLogin();
loginMutation.mutate({ email, password });
```

---

#### POST /auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

**Response:** Аналогично `/auth/login`

**Hook:**
```typescript
const registerMutation = useRegister();
registerMutation.mutate({ email, password, username });
```

---

#### GET /auth/me
Получение текущего пользователя

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "name": "User Name"
}
```

**Hook:**
```typescript
const { data: user } = useCurrentUser();
```

---

### 📚 Курсы

#### GET /courses
Получение списка курсов с фильтрами

**Query Parameters:**
- `page` (number) - номер страницы (default: 1)
- `limit` (number) - количество на странице (default: 20)
- `search` (string) - поиск по названию
- `level` (string[]) - фильтр по уровню (A1-A2, B1, B2, C1-C2)
- `sort` (string) - поле для сортировки
- `order` (asc|desc) - порядок сортировки

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "title": "Course Title",
      "description": "Description",
      "level": "B1",
      "price": 0,
      "rating": 4.5,
      "students": 1000
    }
  ],
  "total": 50
}
```

**Hook:**
```typescript
const { data: courses } = useCourses({
  search: 'react',
  level: ['B1', 'B2'],
  page: 1,
  limit: 20
});
```

---

#### GET /courses/{id}
Получение деталей курса

**Response:**
```json
{
  "id": "uuid",
  "title": "Course Title",
  "description": "Description",
  "level": "B1",
  "price": 0,
  "whatYouWillLearn": ["Item 1", "Item 2"],
  "modules": [
    {
      "title": "Module 1",
      "lessons": [
        {
          "title": "Lesson 1",
          "status": "completed"
        }
      ]
    }
  ]
}
```

**Hook:**
```typescript
const { data: course } = useCourse(courseId);
```

---

#### POST /courses/{courseId}/enroll
Запись на курс

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled",
  "enrollment": {
    "id": "uuid",
    "courseId": "uuid",
    "userId": "uuid",
    "enrolledAt": "2026-04-18T12:00:00Z"
  }
}
```

**Hook:**
```typescript
const enrollMutation = useEnrollCourse();
enrollMutation.mutate(courseId);
```

---

#### GET /enrollments/check
Проверка доступа к курсу

**Query Parameters:**
- `user_id` (string) - ID пользователя
- `course_id` (string) - ID курса

**Response:**
```json
{
  "has_access": true
}
```

**Hook:**
```typescript
const { data } = useCheckEnrollment(userId, courseId);
```

---

### 📖 Уроки

#### GET /lessons/{lessonId}
Получение урока со всеми шагами

**Response:**
```json
{
  "lesson": {
    "id": "uuid",
    "module_id": "uuid",
    "title": "Lesson Title",
    "description": "Description",
    "order_index": 1
  },
  "steps": [
    {
      "id": "uuid",
      "lesson_id": "uuid",
      "type": "video",
      "title": "Step Title",
      "content": "{\"video_id\":\"abc\"}",
      "order_index": 1
    }
  ]
}
```

**Hook:**
```typescript
const { data: lesson } = useLesson(lessonId);
```

---

### 🎬 Шаги

#### GET /steps/{stepId}
Получение шага с видео URL (если тип = video)

**Query Parameters:**
- `user_id` (string, optional) - ID пользователя для персонализации

**Response:**
```json
{
  "step": {
    "id": "uuid",
    "lesson_id": "uuid",
    "type": "video",
    "title": "Step Title",
    "content": "{\"video_id\":\"abc\"}",
    "order_index": 1
  },
  "video_url": "https://cdn.example.com/video.mp4"
}
```

**Hook:**
```typescript
const { data: stepData } = useStep(stepId, userId);
```

---

### 📊 Прогресс

#### GET /progress/steps/{stepId}
Получение прогресса по шагу

**Response:**
```json
{
  "progress": {
    "id": "uuid",
    "user_id": "uuid",
    "step_id": "uuid",
    "completed": true,
    "completed_at": "2026-04-18T12:00:00Z",
    "time_spent_seconds": 120,
    "attempts": 1,
    "score": 100
  },
  "exists": true
}
```

**Hook:**
```typescript
const { data: progress } = useStepProgress(stepId);
```

---

#### GET /progress/lessons/{lessonId}
Получение прогресса по уроку

**Response:**
```json
{
  "progress": {
    "id": "uuid",
    "user_id": "uuid",
    "lesson_id": "uuid",
    "course_id": "uuid",
    "total_steps": 10,
    "completed_steps": 5,
    "progress_percentage": 50,
    "started_at": "2026-04-18T10:00:00Z",
    "last_activity_at": "2026-04-18T12:00:00Z"
  },
  "step_progresses": [...]
}
```

**Hook:**
```typescript
const { data: progress } = useLessonProgress(lessonId);
```

---

#### GET /progress/courses/{courseId}
Получение прогресса по курсу

**Response:**
```json
{
  "lesson_progresses": [...],
  "total_lessons": 20,
  "completed_lessons": 5,
  "overall_progress_percentage": 25
}
```

**Hook:**
```typescript
const { data: progress } = useCourseProgress(courseId);
```

---

#### POST /progress/steps/{stepId}/complete
Отметить шаг как завершенный

**Request:**
```json
{
  "time_spent_seconds": 120,
  "attempts": 1,
  "score": 100
}
```

**Response:**
```json
{
  "step_progress": {...},
  "lesson_progress": {...}
}
```

**Hook:**
```typescript
const completeMutation = useCompleteStep();
completeMutation.mutate({
  stepId,
  data: {
    time_spent_seconds: 120,
    attempts: 1,
    score: 100
  }
});
```

---

### 🛤️ Learning Tracks (Phase 0)

Тематические подборки standalone-уроков: Daily English, Short Stories, Podcast Bites и т.п.

#### GET /tracks
Список опубликованных треков.

**Query:** `language`, `level`, `track_type`, `search`, `limit`, `offset`.

**Response:**
```json
{
  "tracks": [
    {
      "id": "uuid",
      "code": "daily-english",
      "title": "Daily English",
      "description": "Short 5-minute lessons",
      "icon_url": "https://...",
      "language": "en",
      "level": "A2",
      "track_type": "daily",
      "is_published": true,
      "sort_order": 1,
      "created_at": { "seconds": 1778567185, "nanos": 0 }
    }
  ],
  "total": 3
}
```

#### GET /tracks/{idOrCode}
Получение трека по UUID или `code`. Опционально с уроками.

**Query:** `include_lessons=true` — добавляет массив `lessons` в ответ.

**Response (с уроками):**
```json
{
  "id": "uuid",
  "code": "daily-english",
  "title": "Daily English",
  "lessons": [
    {
      "id": "lesson-uuid",
      "module_id": "",
      "title": "Daily English: Greetings at the Office",
      "order_index": 0
    }
  ]
}
```
`module_id: ""` означает standalone-урок.

#### Admin endpoints (требуют `admin` role)

| Method | Path | Описание |
| --- | --- | --- |
| GET | `/admin/tracks` | Список треков (включая черновики) |
| POST | `/admin/tracks` | Создание трека |
| PUT | `/admin/tracks/:id` | Обновление (partial) |
| DELETE | `/admin/tracks/:id` | Удаление |
| PUT | `/admin/tracks/:id/publish` | Toggle publish (`{"is_published":true}`) |
| POST | `/admin/tracks/:id/lessons` | Привязать урок (`{"lesson_id":"uuid","order_index":0}`) |
| DELETE | `/admin/tracks/:id/lessons/:lessonId` | Отвязать |
| PUT | `/admin/tracks/:id/lessons/reorder` | Атомарный reorder (`{"lesson_ids":["uuid1","uuid2"]}`) |

Поля `code` (уникальный slug) и `title` обязательны при создании.
`code` нельзя поменять через UI — только напрямую в БД.
`created_by` подставляется backend'ом из JWT.

**Frontend API client:** `adminAPI.listTracks() / getTrack() / createTrack() / updateTrack() /
deleteTrack() / publishTrack() / addLessonToTrack() / removeLessonFromTrack() /
reorderTrackLessons()` — см. `src/lib/admin-api.ts`.

**Admin UI:** `/admin/tracks` — список, `/admin/tracks/new` — создание,
`/admin/tracks/[id]` — редактирование + управление уроками с reorder.

---

## 📝 Примеры использования

### Полный flow обучения

```typescript
// 1. Получить урок
const { data: lesson } = useLesson(lessonId);

// 2. Получить первый шаг
const firstStep = lesson?.steps[0];
const { data: stepData } = useStep(firstStep.id, userId);

// 3. Показать видео (если type = video)
if (stepData?.video_url) {
  // Воспроизвести видео
}

// 4. Отметить как завершенный
const completeMutation = useCompleteStep();
completeMutation.mutate({
  stepId: firstStep.id,
  data: { time_spent_seconds: 120 }
});

// 5. Проверить прогресс урока
const { data: lessonProgress } = useLessonProgress(lessonId);
console.log(`Completed: ${lessonProgress.progress_percentage}%`);
```

---

## 🔒 Авторизация

Все защищенные эндпоинты требуют заголовок:
```
Authorization: Bearer {access_token}
```

Токен автоматически добавляется `ApiClient` из `localStorage`.

---

## ⚠️ Обработка ошибок

Все ошибки возвращаются в формате:
```json
{
  "message": "Error message",
  "statusCode": 400,
  "errors": {
    "field": ["Error detail"]
  }
}
```

Ошибки автоматически отображаются через `toast.error()`.
