Here's your full README. Create/replace the `README.md` in the **root** of your project (same level as `backend/` and `frontend/` folders):

```markdown
# Job Application Tracker

A full-stack web app to track your job applications. Built as an internship assignment.

**Live Demo:** https://job-application-tracker-f.vercel.app

---

## Screenshots

![Register Page](./screenshots/register.png)
![Login Page](./screenshots/login.png)
![Dashboard](./screenshots/dashboard.png)
![Add Application](./screenshots/add-application.png)


---

## Tech Stack

**Backend**
- NestJS + TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- REST API
- Deployed on Railway

**Frontend**
- Next.js 14 + TypeScript
- Tailwind CSS
- Axios
- Deployed on Vercel

---

## Features

- Register and login with JWT authentication
- Add, edit, delete job applications
- Filter applications by status
- Search by company name or job title
- Track status: Applied, Interviewing, Offer, Rejected

---

## Project Structure

```
job-application-tracker/
├── backend/    # NestJS REST API
└── frontend/   # Next.js frontend
```

---

## Prerequisites

- Node.js v18+
- PostgreSQL
- npm

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/nischitshr/job-application-tracker.git
cd job-application-tracker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/job_tracker"
JWT_SECRET=your_secret_key
```

Run migrations and start:
```bash
npx prisma migrate dev
npm run start:dev
```

API runs at `http://localhost:3000/api`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Start:
```bash
npm run dev
```

Frontend runs at `http://localhost:3001`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register | No |
| POST | /api/auth/login | Login | No |
| GET | /api/applications | Get all applications | Yes |
| GET | /api/applications/:id | Get one application | Yes |
| POST | /api/applications | Create application | Yes |
| PATCH | /api/applications/:id | Update application | Yes |
| DELETE | /api/applications/:id | Delete application | Yes |

Query params: `?status=Applied` and `?search=google`

---

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key for JWT tokens |
| FRONTEND_URL | Frontend URL for CORS |
| PORT | Server port (default 3000) |

### Frontend
| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_API_URL | Backend API base URL |

---

## Live Links

- Frontend: https://job-application-tracker-f.vercel.app
- Backend API: https://job-application-tracker-production-f56f.up.railway.app/api
```

---
