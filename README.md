# E-Learning Platform - Frontend

Next.js frontend application for the E-Learning platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel (✅ Phase 1-4 complete)
│   │   ├── login/         # Admin login page
│   │   ├── users/         # User management (✅ complete)
│   │   ├── courses/       # Course management (✅ complete with content editor)
│   │   ├── videos/        # Video management (✅ complete with upload)
│   │   └── analytics/     # Analytics (coming soon)
│   ├── auth/              # User authentication
│   ├── courses/           # Course catalog
│   ├── dashboard/         # User dashboard
│   └── learn/             # Learning interface
│
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   │   ├── Sidebar.tsx   # Admin navigation
│   │   ├── Header.tsx    # Admin header
│   │   └── course/       # Course management components
│   │       ├── ModuleManager.tsx    # Module CRUD
│   │       ├── LessonManager.tsx    # Lesson CRUD
│   │       ├── StepManager.tsx      # Step CRUD (text/video/quiz)
│   │       ├── RichTextEditor.tsx   # Markdown editor
│   │       └── VideoSelector.tsx    # Video picker modal
│   ├── ui/               # Reusable UI components
│   └── ...
│
├── lib/                   # Utilities and helpers
│   ├── admin-api.ts      # Admin API client
│   ├── api-client.ts     # General API client
│   └── utils.ts          # Helper functions
│
└── types/                 # TypeScript types
    └── api.ts            # API response types
```

## 🎨 Features

### User Features
- ✅ Course catalog browsing
- ✅ User authentication (login/register)
- ✅ User dashboard
- ✅ Course enrollment
- ✅ Learning interface
- 🚧 Progress tracking
- 🚧 Video playback
- 🚧 Quiz completion

### Admin Features
- ✅ Admin authentication (separate login)
- ✅ Role-based access control
- ✅ User management (list, view, edit, delete)
- 🚧 Course management
- 🚧 Video management
- 🚧 Analytics dashboard

## 🔐 Admin Panel

### Access

Admin panel is available at: `http://localhost:3000/admin`

**Test Credentials:**
```
Email: admin@test.com
Password: password123
```

### Features

#### User Management (`/admin/users`)
- View all users with search and filtering
- Edit user details (name, role)
- Change user roles (student → instructor → admin)
- Delete users

#### Dashboard (`/admin`)
- Overview statistics
- Recent activity
- Quick actions

### Security

Admin routes are protected by:
1. **Middleware** - checks for valid auth token
2. **Role validation** - verifies `admin` role in JWT token
3. **Separate login** - admin login at `/admin/login`

## 🔌 API Integration

### Backend API

Base URL: `http://localhost:8080/api/v1`

### Admin API Client

```typescript
// lib/admin-api.ts
import { adminAPI } from '@/lib/admin-api';

// List users
const { users, total } = await adminAPI.listUsers();

// Get user
const user = await adminAPI.getUser(userId);

// Update user
const updated = await adminAPI.updateUser(userId, {
  full_name: 'New Name',
  role: 'instructor'
});

// Delete user
await adminAPI.deleteUser(userId);
```

### Authentication Flow

#### User Auth
1. User logs in at `/auth/login`
2. Backend returns JWT token
3. Token stored in cookies
4. Used for protected routes

#### Admin Auth
1. Admin logs in at `/admin/login`
2. Backend returns JWT token with `role: "admin"`
3. Frontend validates admin role
4. Token stored in cookies
5. Middleware checks token + role on `/admin/*` routes

## 🎨 UI Components

### Shadcn/ui

Project uses [shadcn/ui](https://ui.shadcn.com/) components:

- Card
- Input
- Button
- Select
- Dropdown Menu
- Accordion
- Checkbox

### Custom Components

- `AdminSidebar` - Admin navigation with icons
- `AdminHeader` - Admin header with user info
- `ErrorBoundary` - Error handling
- `Layout` - Page layouts

## 🛠️ Development

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting

### Building

```bash
# Development build
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Documentation

- [ADMIN_PANEL_PLAN.md](./ADMIN_PANEL_PLAN.md) - Admin panel implementation plan
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API endpoints reference
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API integration guide

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t eng-next .

# Run container
docker run -p 3000:3000 eng-next
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## 🔗 Related Projects

- [eng_go](../eng_go) - Backend API (Go microservices)
- [GitHub Repository](https://github.com/aziztwelve/eng_next)

## 📊 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **State Management:** React Context / Hooks
- **API Client:** Fetch API
- **Authentication:** JWT (cookies)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
