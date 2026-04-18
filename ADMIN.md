# Admin Panel Documentation

Административная панель для управления платформой E-Learning.

## 🔐 Доступ

**URL:** `http://localhost:3000/admin`

**Тестовые учётные данные:**
```
Email: admin@test.com
Password: password123
```

## 🏗️ Архитектура

### Разделение контекстов (Вариант 3)

Admin панель интегрирована в основное приложение, но использует:
- Отдельный login (`/admin/login`)
- Отдельную проверку роли
- Изолированные routes (`/admin/*`)

**Преимущества:**
- Быстрая разработка
- Общий backend API
- Легко мигрировать в отдельный проект позже

### Middleware Protection

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  if (pathname.startsWith('/admin')) {
    // Skip login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check token and role
    const token = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    if (!token || userRole !== 'admin') {
      return NextResponse.redirect('/admin/login');
    }
  }
}
```

## 📱 Страницы

### Dashboard (`/admin`)

**Функции:**
- Статистика (users, courses, enrollments, active students)
- Recent activity feed
- Quick actions

**Компоненты:**
- Stats cards с иконками
- Activity timeline
- Quick action buttons

### Login (`/admin/login`)

**Функции:**
- Email/password форма
- Валидация admin роли в токене
- Redirect на dashboard после входа

**Security:**
- Проверка `role: "admin"` в JWT payload
- Отклонение non-admin пользователей
- Токен сохраняется в cookies

### Users (`/admin/users`)

**Функции:**
- Список всех пользователей
- Search по email и имени
- Filter по роли
- Edit и Delete actions

**API Integration:**
```typescript
// Load users
const { users, total } = await adminAPI.listUsers();

// Delete user
await adminAPI.deleteUser(userId);
```

**UI Features:**
- Role badges (цветные)
- Search input
- Action buttons (Edit, Delete)
- Confirmation dialog для delete

### Edit User (`/admin/users/[id]`)

**Функции:**
- Просмотр user details
- Редактирование full_name
- Изменение роли (student/instructor/admin)
- Save и Cancel buttons

**Form Fields:**
- Email (read-only)
- Full Name (editable)
- Role (dropdown: student, instructor, admin)

**API Integration:**
```typescript
// Load user
const user = await adminAPI.getUser(params.id);

// Update user
await adminAPI.updateUser(params.id, {
  full_name: fullName,
  role: role,
});
```

### Courses (`/admin/courses`) - Coming Soon

**Planned Features:**
- List all courses
- Create new course
- Edit course details
- Manage modules and lessons
- Publish/unpublish courses

### Videos (`/admin/videos`) - Coming Soon

**Planned Features:**
- List all videos
- Upload new videos
- Edit video metadata
- Delete videos
- View usage in courses

### Analytics (`/admin/analytics`) - Coming Soon

**Planned Features:**
- User growth charts
- Course popularity
- Completion rates
- Revenue stats
- Export reports

## 🎨 UI Components

### AdminSidebar

**Location:** `src/components/admin/Sidebar.tsx`

**Features:**
- Navigation links с иконками
- Active state highlighting
- "Back to Site" link

**Navigation Items:**
- Dashboard
- Users
- Courses
- Videos
- Analytics

### AdminHeader

**Location:** `src/components/admin/Header.tsx`

**Features:**
- Page title
- Notifications button
- User profile dropdown
- Admin email display

### AdminLayout

**Location:** `src/app/admin/layout.tsx`

**Structure:**
```tsx
<div className="flex h-screen">
  <AdminSidebar />
  <div className="flex-1 flex flex-col">
    <AdminHeader />
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>
```

## 🔌 API Client

### Admin API Client

**Location:** `src/lib/admin-api.ts`

**Methods:**

```typescript
class AdminAPI {
  // Get auth header from cookies
  private getAuthHeader(): string;

  // User management
  async listUsers(): Promise<{ users: User[]; total: number }>;
  async getUser(id: string): Promise<User>;
  async updateUser(id: string, data: UpdateUserData): Promise<User>;
  async deleteUser(id: string): Promise<void>;
}

export const adminAPI = new AdminAPI();
```

**Usage:**

```typescript
import { adminAPI } from '@/lib/admin-api';

// In component
const loadUsers = async () => {
  try {
    const data = await adminAPI.listUsers();
    setUsers(data.users);
  } catch (err) {
    console.error('Failed to load users', err);
  }
};
```

## 🔒 Security

### Authentication Flow

1. User navigates to `/admin`
2. Middleware checks cookies
3. No token → redirect to `/admin/login`
4. User enters credentials
5. Frontend calls `POST /api/v1/auth/login`
6. Backend returns JWT with `role: "admin"`
7. Frontend validates role
8. Token saved in cookies
9. Redirect to `/admin`

### Role-Based Access Control

**Frontend:**
- Middleware checks `user_role` cookie
- Only `admin` role allowed

**Backend:**
- AuthMiddleware validates JWT
- AdminOnlyMiddleware checks role
- Returns 403 if not admin

### Token Storage

```typescript
// Store token in cookies
document.cookie = `auth_token=${token}; path=/; max-age=3600`;
document.cookie = `user_role=${role}; path=/; max-age=3600`;
```

**Security considerations:**
- HttpOnly cookies (planned)
- Secure flag for HTTPS
- SameSite=Strict
- Short expiration (1 hour)

## 🎯 Implementation Status

### Phase 1: Foundation ✅
- [x] Admin routes structure
- [x] Admin layout with sidebar
- [x] Dashboard overview
- [x] Middleware protection
- [x] Admin login page

### Phase 2: User Management ✅
- [x] Users list page
- [x] User details/edit page
- [x] Delete user functionality
- [x] Search and filter
- [x] API integration

### Phase 3: Course Management 🚧
- [ ] Courses list
- [ ] Create course
- [ ] Edit course
- [ ] Manage modules/lessons
- [ ] Content editor

### Phase 4: Video Management 🚧
- [ ] Videos list
- [ ] Upload video
- [ ] Edit metadata
- [ ] Delete video

### Phase 5: Analytics 🚧
- [ ] Dashboard stats
- [ ] User analytics
- [ ] Course analytics
- [ ] Reports

### Phase 6: Polish 🚧
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Confirmation modals

## 🚀 Future Enhancements

### Short-term
- [ ] Pagination for user list
- [ ] Advanced filters
- [ ] Bulk operations
- [ ] Export to CSV
- [ ] Activity logs

### Long-term
- [ ] Separate admin project (Вариант 1)
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] A/B testing tools
- [ ] Content moderation queue

## 🔄 Migration to Separate Project

Когда проект вырастет, легко мигрировать на Вариант 1:

```bash
# 1. Create new project
npx create-next-app@latest eng_admin

# 2. Copy admin code
cp -r eng_next/src/app/admin/* eng_admin/src/app/
cp -r eng_next/src/components/admin/* eng_admin/src/components/

# 3. Update API URLs
# Change from relative to absolute
fetch('/api/v1/admin/users')
→ fetch('http://api.example.com/api/v1/admin/users')

# 4. Remove from eng_next
rm -rf eng_next/src/app/admin
rm -rf eng_next/src/components/admin
```

**Время миграции:** ~30 минут

## 📊 Performance

### Optimization

- Server-side pagination
- Lazy loading for large lists
- Image optimization (Next.js Image)
- API response caching (React Query planned)
- Debounced search inputs

### Bundle Size

Current admin bundle: ~150KB (gzipped)

**Optimization opportunities:**
- Code splitting per route
- Dynamic imports for heavy components
- Tree shaking unused UI components

## 🧪 Testing

### Manual Testing

```bash
# 1. Start backend
cd eng_go && task run-all-bg

# 2. Start frontend
cd eng_next && npm run dev

# 3. Login as admin
# Navigate to http://localhost:3000/admin/login
# Email: admin@test.com
# Password: password123

# 4. Test features
# - View users list
# - Edit user
# - Delete user
# - Search users
```

### Automated Testing (Planned)

```typescript
// tests/admin/users.test.tsx
describe('Admin Users Page', () => {
  it('should list all users', async () => {
    render(<UsersPage />);
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    });
  });

  it('should delete user', async () => {
    // Test delete functionality
  });
});
```

## 📝 Related Documentation

- [ADMIN_PANEL_PLAN.md](./ADMIN_PANEL_PLAN.md) - Implementation plan
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API reference
- [README.md](./README.md) - Project overview
- [Backend Admin API](../eng_go/docs/ADMIN_API.md) - Backend documentation

## 🤝 Contributing

When adding new admin features:

1. Add route in `src/app/admin/`
2. Create components in `src/components/admin/`
3. Add API methods in `src/lib/admin-api.ts`
4. Update sidebar navigation
5. Add to this documentation
6. Test thoroughly

## 📞 Support

For issues or questions:
- GitHub Issues: [eng_next/issues](https://github.com/aziztwelve/eng_next/issues)
- Backend API: [eng_go/issues](https://github.com/aziztwelve/eng_go/issues)
