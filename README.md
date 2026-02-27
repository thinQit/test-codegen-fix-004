# Task Manager (Next.js 14)

A TypeScript-based task manager with authentication, full CRUD for tasks, and a dashboard that surfaces summaries, filters, and basic analytics.

## Features
- JWT-based authentication (register, login, logout, profile)
- Task CRUD (create, view, update, delete)
- Dashboard summary (counts by status, upcoming tasks, overdue counts)
- Filters by status, priority, tags, with sorting options
- Accessible, responsive UI components
- Prisma ORM with SQLite for local development (easy migration to Postgres)

## Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite via Prisma ORM
- **Auth**: JWT + bcryptjs
- **Testing**: Jest, Testing Library, Playwright

## Prerequisites
- Node.js 18+
- npm 9+

## Quick Start
```bash
bash install.sh
# or on Windows
powershell -ExecutionPolicy Bypass -File install.ps1

npm run dev
```

## Environment Variables
Create a `.env` file based on `.env.example`:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
```
src/app/            # Next.js App Router
src/app/api/        # API route handlers
src/components/     # Reusable UI components
src/lib/            # Utilities and helpers
src/providers/      # React context providers
prisma/             # Prisma schema and migrations
```

## API Endpoints (Contract)
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`
- `GET /api/dashboard/summary`

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Generate Prisma client and build
- `npm run start` - Run production server
- `npm run lint` - Lint codebase
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit and component tests: `npm run test`
- End-to-end tests: `npm run test:e2e`

## Notes
- SQLite is used for development. For production, update `DATABASE_URL` and Prisma provider to Postgres.
- Status and priority fields use `String` in Prisma for SQLite compatibility.
