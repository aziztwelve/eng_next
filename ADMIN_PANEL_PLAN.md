# Admin Panel Feature Plan

**Project:** eng_next  
**Feature:** Admin Dashboard  
**Created:** 2026-04-18  

## Overview

Admin panel for managing the e-learning platform: users, courses, content moderation, analytics.

## Goals

- Centralized management interface
- Role-based access (admin only)
- CRUD operations for all entities
- Analytics and reporting
- Content moderation tools

## Tech Stack

- **Route:** `/admin/*` (App Router)
- **Auth:** Protected routes with middleware
- **UI:** Shadcn/ui or custom components
- **State:** React Query for server state
- **API:** REST calls to eng_go Gateway

## Architecture

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Admin layout with sidebar
│       ├── page.tsx             # Dashboard overview
│       ├── users/
│       │   ├── page.tsx         # Users list
│       │   └── [id]/
│       │       └── page.tsx     # User details/edit
│       ├── courses/
│       │   ├── page.tsx         # Courses list
│       │   ├── new/
│       │   │   └── page.tsx     # Create course
│       │   └── [id]/
│       │       ├── page.tsx     # Course details/edit
│       │       └── modules/
│       │           └── page.tsx # Manage modules
│       ├── videos/
│       │   ├── page.tsx         # Videos list
│       │   └── upload/
│       │       └── page.tsx     # Upload video
│       └── analytics/
│           └── page.tsx         # Analytics dashboard
│
├── components/
│   └── admin/
│       ├── Sidebar.tsx          # Admin navigation
│       ├── Header.tsx           # Admin header
│       ├── DataTable.tsx        # Reusable table
│       ├── UserForm.tsx         # User create/edit form
│       ├── CourseForm.tsx       # Course create/edit form
│       └── VideoUpload.tsx      # Video upload component
│
├── lib/
│   └── api/
│       └── admin.ts             # Admin API calls
│
└── middleware.ts                # Auth middleware for /admin

```

## Implementation Plan

### Phase 1: Foundation (Day 1-2)

**1.1 Setup Admin Routes**
- [ ] Create `/app/admin` directory structure
- [ ] Setup admin layout with sidebar navigation
- [ ] Add middleware for admin-only access
- [ ] Create dashboard overview page

**1.2 Authentication & Authorization**
- [ ] Add role check middleware (admin only)
- [ ] Redirect non-admins to home
- [ ] Add logout functionality
- [ ] Store admin session/token

**1.3 UI Components**
- [ ] Create AdminSidebar component
- [ ] Create AdminHeader component
- [ ] Setup Tailwind/UI library
- [ ] Create base layout structure

### Phase 2: User Management (Day 3-4)

**2.1 Users List**
- [ ] Create `/admin/users` page
- [ ] Fetch users from API (`GET /api/v1/admin/users`)
- [ ] Display users in table (email, role, status, created_at)
- [ ] Add search/filter functionality
- [ ] Add pagination

**2.2 User Details & Edit**
- [ ] Create `/admin/users/[id]` page
- [ ] Fetch user details
- [ ] Create UserForm component
- [ ] Implement edit functionality (`PUT /api/v1/admin/users/{id}`)
- [ ] Add role change (student → instructor → admin)
- [ ] Add ban/unban user

**2.3 User Creation**
- [ ] Create `/admin/users/new` page
- [ ] Implement create user form
- [ ] API call (`POST /api/v1/admin/users`)
- [ ] Validation and error handling

### Phase 3: Course Management (Day 5-7)

**3.1 Courses List**
- [ ] Create `/admin/courses` page
- [ ] Fetch courses from API
- [ ] Display courses table (title, instructor, status, students)
- [ ] Add filters (status, language, level)
- [ ] Add search by title

**3.2 Course Create/Edit**
- [ ] Create `/admin/courses/new` page
- [ ] Create `/admin/courses/[id]` page
- [ ] Build CourseForm component
  - Basic info (title, description, language, level)
  - Pricing
  - Instructor assignment
  - Publish/unpublish toggle
- [ ] API integration (POST/PUT)
- [ ] Image upload for course thumbnail

**3.3 Module & Lesson Management**
- [ ] Create `/admin/courses/[id]/modules` page
- [ ] List modules with drag-to-reorder
- [ ] Add/edit/delete modules
- [ ] Manage lessons within modules
- [ ] Manage steps within lessons
- [ ] Support for text/video/quiz steps

### Phase 4: Video Management (Day 8-9)

**4.1 Videos List**
- [ ] Create `/admin/videos` page
- [ ] Fetch videos from video-service
- [ ] Display videos table (title, duration, status, size)
- [ ] Add filters (status, uploaded date)
- [ ] Preview video thumbnails

**4.2 Video Upload**
- [ ] Create `/admin/videos/upload` page
- [ ] Build VideoUpload component
  - File picker (MP4 only)
  - Upload progress bar
  - Metadata form (title, description)
- [ ] Chunked upload to video-service
- [ ] Processing status indicator

**4.3 Video Details**
- [ ] Create `/admin/videos/[id]` page
- [ ] Display video metadata
- [ ] Video player preview
- [ ] Edit metadata
- [ ] Delete video (with confirmation)
- [ ] View which courses use this video

### Phase 5: Analytics & Reports (Day 10-11)

**5.1 Dashboard Overview**
- [ ] Total users count (by role)
- [ ] Total courses count (by status)
- [ ] Total enrollments
- [ ] Recent activity feed
- [ ] Quick stats cards

**5.2 Analytics Page**
- [ ] Create `/admin/analytics` page
- [ ] User growth chart (daily/weekly/monthly)
- [ ] Course popularity (most enrolled)
- [ ] Completion rates
- [ ] Revenue stats (if applicable)
- [ ] Export reports (CSV/PDF)

**5.3 Activity Logs**
- [ ] User activity logs
- [ ] Admin action logs
- [ ] System events
- [ ] Filter by date/user/action

### Phase 6: Polish & Testing (Day 12-14)

**6.1 UI/UX Polish**
- [ ] Responsive design (mobile/tablet)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Toast notifications
- [ ] Confirmation modals

**6.2 Testing**
- [ ] Unit tests for components
- [ ] Integration tests for API calls
- [ ] E2E tests for critical flows
- [ ] Manual testing all features

**6.3 Documentation**
- [ ] Admin user guide
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide

## API Endpoints Needed (Backend)

### Users
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/{id}` - Get user details
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/{id}` - Update user
- `DELETE /api/v1/admin/users/{id}` - Delete user
- `PUT /api/v1/admin/users/{id}/role` - Change role
- `PUT /api/v1/admin/users/{id}/ban` - Ban/unban user

### Courses
- `GET /api/v1/admin/courses` - List courses
- `GET /api/v1/admin/courses/{id}` - Get course details
- `POST /api/v1/admin/courses` - Create course
- `PUT /api/v1/admin/courses/{id}` - Update course
- `DELETE /api/v1/admin/courses/{id}` - Delete course
- `PUT /api/v1/admin/courses/{id}/publish` - Publish/unpublish

### Modules & Lessons
- `POST /api/v1/admin/courses/{id}/modules` - Create module
- `PUT /api/v1/admin/modules/{id}` - Update module
- `DELETE /api/v1/admin/modules/{id}` - Delete module
- `POST /api/v1/admin/modules/{id}/lessons` - Create lesson
- `PUT /api/v1/admin/lessons/{id}` - Update lesson
- `DELETE /api/v1/admin/lessons/{id}` - Delete lesson

### Videos
- `GET /api/v1/admin/videos` - List videos
- `POST /api/v1/admin/videos/upload` - Upload video
- `PUT /api/v1/admin/videos/{id}` - Update metadata
- `DELETE /api/v1/admin/videos/{id}` - Delete video

### Analytics
- `GET /api/v1/admin/analytics/overview` - Dashboard stats
- `GET /api/v1/admin/analytics/users` - User analytics
- `GET /api/v1/admin/analytics/courses` - Course analytics
- `GET /api/v1/admin/analytics/activity` - Activity logs

## UI Components Library

**Recommended:** Shadcn/ui (Radix UI + Tailwind)

**Key Components:**
- Table (with sorting, filtering, pagination)
- Form (with validation)
- Dialog/Modal
- Dropdown Menu
- Tabs
- Charts (Recharts)
- File Upload (react-dropzone)
- Rich Text Editor (Tiptap or Lexical)

## Security Considerations

- [ ] Admin-only middleware on all `/admin` routes
- [ ] CSRF protection
- [ ] Rate limiting on admin actions
- [ ] Audit logging for sensitive operations
- [ ] Input validation and sanitization
- [ ] File upload validation (size, type)
- [ ] XSS protection

## Performance Optimizations

- [ ] Server-side pagination
- [ ] Lazy loading for large lists
- [ ] Image optimization (Next.js Image)
- [ ] API response caching (React Query)
- [ ] Debounced search inputs
- [ ] Optimistic UI updates

## Future Enhancements

- [ ] Bulk operations (bulk delete, bulk role change)
- [ ] Advanced filters and saved views
- [ ] Email notifications for admin actions
- [ ] Content moderation queue
- [ ] A/B testing tools
- [ ] SEO management
- [ ] Backup/restore functionality
- [ ] Multi-language support for admin UI

## Timeline

- **Phase 1-2:** 4 days (Foundation + Users)
- **Phase 3:** 3 days (Courses)
- **Phase 4:** 2 days (Videos)
- **Phase 5:** 2 days (Analytics)
- **Phase 6:** 3 days (Polish & Testing)

**Total:** ~14 days (2 weeks)

## Success Metrics

- Admin can manage all users without backend access
- Admin can create/edit courses with full content
- Admin can upload and manage videos
- Dashboard provides actionable insights
- All operations complete in <2 seconds
- Zero security vulnerabilities

---

**Next Steps:**
1. Review and approve plan
2. Setup backend admin endpoints in eng_go
3. Start Phase 1 implementation
4. Iterate based on feedback
