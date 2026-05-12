# Admin Panel Documentation

## Overview
Admin panel for managing users, courses, and videos. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Access
- **URL:** `http://your-domain/admin`
- **Login:** `http://your-domain/admin/login`
- **Credentials:** admin@test.com / password123

## Features

### Phase 1: Foundation ✅
- Admin layout with sidebar and header
- Dashboard with stats cards
- Middleware protection (auth + role check)
- Separate admin login page

### Phase 2: User Management ✅
- List users with search and filters
- Edit user (email, role)
- Delete user with confirmation
- Role management (admin, instructor, student)

### Phase 3: Course Management ✅
- List courses with search and status badges
- Create course with form validation
- Edit course with tabs (details + content)
- Module/Lesson/Step management
- Rich text editor for text steps
- Video selector for video steps
- Quiz builder (JSON textarea)
- Publish/unpublish toggle
- Delete course

### Phase 4: Video Management ✅
- List videos with search, duration, size, status
- Upload video with progress bar
- Real file upload (multipart/form-data)
- Edit video metadata
- Delete video
- Video usage tracking

### Phase 0: Learning Tracks (standalone content) ✅
- List tracks with `track_type` filter and search
- Create track via dedicated form (code, title, description, icon_url, language, level, type, sort_order)
- Edit track on `/admin/tracks/[id]` page
- Publish / unpublish toggle (list + detail view)
- Delete track (lessons preserved, links cascaded)
- Manage attached lessons:
  - Add lesson by UUID (works for both standalone and module-bound lessons)
  - Remove from track
  - Reorder via ↑/↓ buttons (atomic backend `reorderTrackLessons`)
- Visual badge: `standalone` vs `in module` for each attached lesson
- Backward-compatible: existing courses untouched; new `lessons.module_id` is nullable

## Architecture

### Routes
```
/admin
├── /login              # Admin login (separate from user login)
├── /                   # Dashboard
├── /users              # User list
│   └── /[id]          # Edit user
├── /courses            # Course list
│   ├── /new           # Create course
│   └── /[id]          # Edit course (with content management)
├── /tracks             # Learning tracks list
│   ├── /new           # Create track
│   └── /[id]          # Edit track + manage lessons (add / remove / reorder)
└── /videos             # Video list
    └── /upload        # Upload video
```

### Authentication
- Uses cookies: `auth_token` and `user_role`
- Middleware checks both cookies on all `/admin/*` routes
- Redirects to `/admin/login` if not authenticated or not admin

### API Integration
- API client: `lib/admin-api.ts`
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (http://204.168.248.33:8080)
- All requests include `Authorization: Bearer <token>` header

## Components

### Layout Components
- `components/admin/Sidebar.tsx` - Navigation sidebar
- `components/admin/Header.tsx` - Top header with user info

### Course Management Components
- `components/admin/course/ModuleManager.tsx` - Module CRUD with expand/collapse
- `components/admin/course/LessonManager.tsx` - Lesson CRUD nested in modules
- `components/admin/course/StepManager.tsx` - Step CRUD (text/video/quiz types)
- `components/admin/course/RichTextEditor.tsx` - Markdown editor with toolbar and preview
- `components/admin/course/VideoSelector.tsx` - Video picker modal with search

## Course Content Structure

```
Course
├── Module 1
│   ├── Lesson 1
│   │   ├── Step 1 (text)
│   │   ├── Step 2 (video)
│   │   └── Step 3 (quiz)
│   └── Lesson 2
│       └── ...
└── Module 2
    └── ...
```

### Step Types
1. **Text Step** - Rich text content with markdown support
2. **Video Step** - Video player with video selector
3. **Quiz Step** - Multiple choice questions (JSON format)

## Course Levels
Uses CEFR standard:
- **A1** - Beginner
- **A2** - Elementary
- **B1** - Intermediate
- **B2** - Upper Intermediate
- **C1** - Advanced
- **C2** - Proficiency

## Course Status
- **draft** - Not visible to students (default)
- **published** - Visible to students

## Video Upload
- Accepts video files via file input
- Shows upload progress bar
- Uses `XMLHttpRequest` for progress tracking
- Backend streams to video-service via gRPC
- Stored in MinIO with metadata in PostgreSQL

## Development

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://204.168.248.33:8080
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Deploy with PM2
```bash
pm2 start npm --name "eng_next" -- start
pm2 restart eng_next
```

## Known Issues

### Browser Cache
After code changes, you may need to:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Or rebuild: `rm -rf .next && npm run build`

### Course List
Currently shows only 5 published courses instead of all 11. Backend filters by `is_published = true`. Fix pending to show all courses including drafts in admin panel.

## API Endpoints

See [eng_go/docs/ADMIN_API.md](../../eng_go/docs/ADMIN_API.md) for full API documentation.

### Quick Reference
- `GET /api/v1/admin/me` - Get admin info
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/courses` - List courses
- `POST /api/v1/admin/courses` - Create course
- `GET /api/v1/admin/videos` - List videos
- `POST /api/v1/admin/videos/upload` - Upload video

## Test Credentials
- **Admin:** admin@test.com / password123
- **Instructor:** instructor1@test.com / password123
- **Student:** student1@test.com / password123

## Future Improvements
- [ ] Show all courses (including drafts) in admin panel
- [ ] Add pagination to all list pages
- [ ] Add advanced filters (date range, status, etc.)
- [ ] Implement visual quiz builder (instead of JSON textarea)
- [ ] Add thumbnail upload for courses and videos
- [ ] Add bulk operations (delete multiple, publish multiple)
- [ ] Add course preview before publishing
- [ ] Add analytics dashboard with charts
