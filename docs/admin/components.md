# Admin Components Documentation

Документация компонентов административной панели.

## Layout Components

### Sidebar

Боковое меню навигации.

**Расположение:** `src/components/admin/Sidebar.tsx`

**Функционал:**
- Навигация по разделам (Dashboard, Users, Courses, Videos)
- Активное состояние текущей страницы
- Иконки для каждого раздела

**Использование:**
```tsx
import Sidebar from '@/components/admin/Sidebar';

<Sidebar />
```

**Разделы:**
- Dashboard (`/admin`)
- Users (`/admin/users`)
- Courses (`/admin/courses`)
- Videos (`/admin/videos`)

---

### Header

Шапка административной панели.

**Расположение:** `src/components/admin/Header.tsx`

**Функционал:**
- Отображение текущего пользователя
- Кнопка выхода
- Breadcrumbs (planned)

**Использование:**
```tsx
import Header from '@/components/admin/Header';

<Header />
```

---

## Course Management Components

### ModuleManager

Компонент для управления модулями курса.

**Расположение:** `src/components/admin/course/ModuleManager.tsx`

**Props:**
```typescript
interface ModuleManagerProps {
  courseId: string;
  modules: Module[];
  onUpdate: () => void;
}
```

**Функционал:**
- Добавление нового модуля
- Редактирование модуля (inline)
- Удаление модуля с подтверждением
- Раскрытие/скрытие уроков
- Drag & drop для изменения порядка (planned)

**API Integration:**
- `POST /api/v1/admin/courses/:courseId/modules` - создание
- `PUT /api/v1/admin/courses/modules/:moduleId` - обновление
- `DELETE /api/v1/admin/courses/modules/:moduleId` - удаление

**Пример:**
```tsx
<ModuleManager
  courseId={courseId}
  modules={course.modules}
  onUpdate={fetchCourse}
/>
```

---

### LessonManager

Компонент для управления уроками внутри модуля.

**Расположение:** `src/components/admin/course/LessonManager.tsx`

**Props:**
```typescript
interface LessonManagerProps {
  moduleId: string;
  lessons: Lesson[];
  onUpdate: () => void;
}
```

**Функционал:**
- Добавление урока
- Редактирование урока
- Удаление урока
- Раскрытие/скрытие шагов

**API Integration:**
- `POST /api/v1/admin/courses/modules/:moduleId/lessons`
- `PUT /api/v1/admin/courses/lessons/:lessonId`
- `DELETE /api/v1/admin/courses/lessons/:lessonId`

---

### StepManager

Компонент для управления шагами урока.

**Расположение:** `src/components/admin/course/StepManager.tsx`

**Props:**
```typescript
interface StepManagerProps {
  lessonId: string;
  steps: Step[];
  onUpdate: () => void;
}
```

**Функционал:**
- Добавление шага (3 типа: text, video, quiz)
- Редактирование шага
- Удаление шага
- Специализированные редакторы для каждого типа

**Типы шагов:**

1. **Text Step** - текстовый контент с markdown
   - Использует RichTextEditor
   - Поддержка markdown синтаксиса
   - Live preview

2. **Video Step** - видео контент
   - Использует VideoSelector
   - Выбор из загруженных видео
   - Preview thumbnail

3. **Quiz Step** - тестовые вопросы
   - JSON редактор (временно)
   - Планируется визуальный редактор

**API Integration:**
- `POST /api/v1/admin/courses/lessons/:lessonId/steps`
- `PUT /api/v1/admin/courses/steps/:stepId`
- `DELETE /api/v1/admin/courses/steps/:stepId`

---

### RichTextEditor

Markdown редактор с панелью инструментов и preview.

**Расположение:** `src/components/admin/course/RichTextEditor.tsx`

**Props:**
```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}
```

**Функционал:**
- Toolbar с кнопками форматирования
- Bold, Italic, Heading, List, Link
- Live preview markdown
- Tabs: Edit / Preview

**Пример:**
```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
/>
```

**Поддерживаемый markdown:**
- `# Heading` - заголовки
- `**bold**` - жирный текст
- `*italic*` - курсив
- `[link](url)` - ссылки
- `- item` - списки

---

### VideoSelector

Modal для выбора видео из библиотеки.

**Расположение:** `src/components/admin/course/VideoSelector.tsx`

**Props:**
```typescript
interface VideoSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (videoId: string) => void;
}
```

**Функционал:**
- Поиск по названию
- Фильтрация по статусу
- Thumbnail preview
- Информация о видео (duration, size)

**API Integration:**
- `GET /api/v1/admin/videos` - список видео

**Пример:**
```tsx
<VideoSelector
  isOpen={showSelector}
  onClose={() => setShowSelector(false)}
  onSelect={(videoId) => {
    setSelectedVideo(videoId);
    setShowSelector(false);
  }}
/>
```

---

## Form Components (Planned)

### FormInput
Переиспользуемый input с валидацией.

### FormSelect
Select с поддержкой поиска.

### FormTextarea
Textarea с автоматическим resize.

### FormCheckbox
Checkbox с label.

---

## UI Components (Planned)

### Button
Кнопка с различными вариантами (primary, secondary, danger).

### Modal
Модальное окно с backdrop.

### Alert
Уведомления (success, error, warning, info).

### Spinner
Loading индикатор.

### Badge
Бейдж для статусов.

---

## Best Practices

### 1. Composition over Inheritance
```tsx
// Good
<ModuleManager>
  <LessonManager>
    <StepManager />
  </LessonManager>
</ModuleManager>

// Bad - монолитный компонент
<CourseEditor />
```

### 2. Controlled Components
```tsx
// Good
const [value, setValue] = useState('');
<Input value={value} onChange={setValue} />

// Bad - uncontrolled
<Input defaultValue="..." />
```

### 3. Error Boundaries
```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <ModuleManager />
</ErrorBoundary>
```

### 4. Loading States
```tsx
{loading ? <Spinner /> : <Content />}
```

### 5. Optimistic Updates
```tsx
// Обновляем UI сразу, откатываем при ошибке
const handleUpdate = async () => {
  const oldData = data;
  setData(newData);
  
  try {
    await api.update(newData);
  } catch (error) {
    setData(oldData);
    showError(error);
  }
};
```

---

## Styling Guidelines

### Tailwind Classes
```tsx
// Consistent spacing
className="p-4 mb-4"

// Responsive design
className="w-full md:w-1/2 lg:w-1/3"

// Hover states
className="hover:bg-gray-100 transition-colors"

// Focus states
className="focus:outline-none focus:ring-2 focus:ring-blue-500"
```

### Color Palette
- Primary: `blue-600`
- Secondary: `gray-600`
- Success: `green-600`
- Danger: `red-600`
- Warning: `yellow-600`

### Typography
- Heading: `text-2xl font-bold`
- Subheading: `text-lg font-semibold`
- Body: `text-base`
- Small: `text-sm text-gray-600`

---

## Testing (Planned)

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import ModuleManager from './ModuleManager';

test('renders module list', () => {
  render(<ModuleManager modules={mockModules} />);
  expect(screen.getByText('Module 1')).toBeInTheDocument();
});
```

### Integration Tests
```tsx
test('creates new module', async () => {
  render(<ModuleManager />);
  
  const input = screen.getByPlaceholderText('Module title');
  fireEvent.change(input, { target: { value: 'New Module' } });
  
  const button = screen.getByText('Add Module');
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('New Module')).toBeInTheDocument();
  });
});
```
