# Job Application Tracker — NestJS Backend

A production-quality REST API for tracking job applications, built with NestJS, TypeScript (strict), PostgreSQL, and Prisma ORM.

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap: pipes, filters, CORS, prefix
├── app.module.ts                    # Root module
├── prisma/
│   ├── prisma.module.ts             # @Global DB module
│   └── prisma.service.ts            # PrismaClient wrapper (connect/disconnect)
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts # Global error handler → consistent error shape
│   └── pipes/
│       └── parse-uuid-param.pipe.ts # Validates :id route params are UUID v4
└── applications/
    ├── applications.module.ts
    ├── applications.controller.ts   # Route handlers (thin layer)
    ├── applications.service.ts      # Business logic + DB queries
    └── dto/
        ├── create-application.dto.ts
        ├── update-application.dto.ts # extends PartialType(Create...)
        └── query-application.dto.ts  # Query params for GET /applications
prisma/
└── schema.prisma                    # Your single source of truth for DB schema
```

---

## API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint               | Description                         |
|--------|------------------------|-------------------------------------|
| POST   | /applications          | Create a new application            |
| GET    | /applications          | Get all (filterable + searchable)   |
| GET    | /applications/:id      | Get one by UUID                     |
| PATCH  | /applications/:id      | Partial update                      |
| DELETE | /applications/:id      | Delete by UUID                      |

### Query Parameters (GET /applications)
| Param  | Type   | Example              | Description                          |
|--------|--------|----------------------|--------------------------------------|
| status | enum   | `?status=Applied`    | Filter by status                     |
| search | string | `?search=google`     | Search company_name or job_title     |

Both can be combined: `?status=Interviewing&search=engineer`

### Request Body (POST / PATCH)
```json
{
  "company_name": "Google",
  "job_title": "Software Engineering Intern",
  "job_type": "Internship",
  "status": "Applied",
  "applied_date": "2024-03-15",
  "notes": "Applied via LinkedIn"
}
```

### Enums
- **job_type**: `Internship` | `FullTime` | `PartTime`
- **status**: `Applied` | `Interviewing` | `Offer` | `Rejected`

### Response Shape (error)
```json
{
  "statusCode": 404,
  "message": "Application with ID \"abc\" not found",
  "error": "Not Found",
  "path": "/api/applications/abc",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

---

## DATABASE SETUP GUIDE
### (Follow these steps yourself — great learning opportunity!)

---

### STEP 1 — Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:** Download the installer from https://www.postgresql.org/download/windows/

**Verify it's running:**
```bash
psql --version
# Expected: psql (PostgreSQL) 15.x
```

---

### STEP 2 — Create your database

Connect to PostgreSQL as the default superuser:
```bash
# macOS/Linux
psql postgres

# If the above fails, try:
sudo -u postgres psql
```

Once inside the `psql` prompt, run these SQL commands:

```sql
-- Create a dedicated database for this project
CREATE DATABASE job_tracker;

-- (Optional but recommended) Create a dedicated user
-- Replace 'yourpassword' with something real
CREATE USER job_tracker_user WITH PASSWORD 'yourpassword';

-- Grant all privileges on the database to the new user
GRANT ALL PRIVILEGES ON DATABASE job_tracker TO job_tracker_user;

-- Exit psql
\q
```

**Why a separate user?** It's a security best practice — the app only gets access
to its own database, not your entire PostgreSQL instance.

**Verify it works:**
```bash
psql -U job_tracker_user -d job_tracker -h localhost
# If it connects, you're good. Type \q to exit.
```

---

### STEP 3 — Configure your environment

Copy the example env file and fill it in:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://job_tracker_user:yourpassword@localhost:5432/job_tracker"
```

**Breaking down the URL:**
```
postgresql://  USER          :  PASSWORD     @  HOST      :PORT /  DATABASE
postgresql://  job_tracker_user:yourpassword  @  localhost :5432/  job_tracker
```

> ⚠️ Never commit `.env` to git. It's in `.gitignore` already.

---

### STEP 4 — Understand the Prisma Schema

Open `prisma/schema.prisma` and read through it. Key decisions made:

**Why UUIDs instead of auto-increment integers?**
- UUIDs are globally unique — safe to generate on the client side
- Don't expose how many records you have (security)
- Better for distributed systems and future scaling

**Why `@@map("applications")`?**
- The Prisma model is `Application` (PascalCase, singular)
- But the actual PostgreSQL table will be named `applications` (lowercase, plural)
- This follows both Prisma conventions AND PostgreSQL conventions

**Why `@updatedAt`?**
- Prisma automatically updates this field on every `.update()` call
- You never have to remember to set it manually

**The enums** (`JobType`, `ApplicationStatus`) are defined in Prisma AND
created as native PostgreSQL enum types in the migration. This means
the database itself enforces valid values — not just your application.

---

### STEP 5 — Install dependencies

```bash
npm install
```

---

### STEP 6 — Generate Prisma Client

```bash
npx prisma generate
```

This reads your schema and generates a fully type-safe client in `node_modules/@prisma/client`.
Run this again any time you change `schema.prisma`.

---

### STEP 7 — Run your first migration

```bash
npx prisma migrate dev --name init
```

**What this does:**
1. Reads your `schema.prisma`
2. Compares it to the current database state (empty)
3. Generates a SQL migration file in `prisma/migrations/`
4. Runs the migration against your database
5. Re-generates the Prisma Client

**Look inside the generated migration** at `prisma/migrations/[timestamp]_init/migration.sql`.
You'll see the actual SQL — `CREATE TABLE`, `CREATE TYPE` for enums, etc.
This is excellent SQL to learn from!

**Verify the table was created:**
```bash
psql -U job_tracker_user -d job_tracker -h localhost
\dt          # List all tables — should show "applications"
\d applications  # Describe the table structure
\q
```

---

### STEP 8 — Start the development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

---

### STEP 9 — Test your endpoints

**Create an application:**
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Google",
    "job_title": "Software Engineering Intern",
    "job_type": "Internship",
    "status": "Applied",
    "applied_date": "2024-03-15",
    "notes": "Applied via LinkedIn referral"
  }'
```

**Get all applications:**
```bash
curl http://localhost:3000/api/applications
```

**Filter by status:**
```bash
curl "http://localhost:3000/api/applications?status=Applied"
```

**Search:**
```bash
curl "http://localhost:3000/api/applications?search=google"
```

**Get one by ID** (use an ID from the create response):
```bash
curl http://localhost:3000/api/applications/YOUR-UUID-HERE
```

**Partial update:**
```bash
curl -X PATCH http://localhost:3000/api/applications/YOUR-UUID-HERE \
  -H "Content-Type: application/json" \
  -d '{"status": "Interviewing"}'
```

**Delete:**
```bash
curl -X DELETE http://localhost:3000/api/applications/YOUR-UUID-HERE
```

---

### Useful Prisma Commands (reference)

```bash
npx prisma studio          # Visual database browser at localhost:5555
npx prisma migrate dev     # Create + apply a new migration
npx prisma migrate reset   # ⚠️  Wipe the DB and re-run all migrations (dev only)
npx prisma generate        # Regenerate the client after schema changes
npx prisma db pull         # Pull schema from an existing DB (reverse engineering)
```

---

## Architectural Decisions

### 1. Controller → Service separation
Controllers only handle HTTP (parse request, call service, return response).
Services contain all business logic and DB queries.
This makes services independently testable without spinning up HTTP.

### 2. Global PrismaModule (@Global)
The DB connection is used everywhere. Making it global avoids re-importing
`PrismaModule` in every feature module.

### 3. PartialType for UpdateDto
`UpdateApplicationDto extends PartialType(CreateApplicationDto)` makes all
fields optional but keeps all validation decorators. No duplication.

### 4. Global Exception Filter
All errors — whether from NestJS, Prisma, or unexpected code — return the
same JSON shape. The frontend only needs to handle one error format.

### 5. Custom ParseUUIDParam pipe
Validates route params before they hit the service. Returns a clear 400
instead of letting an invalid UUID reach Prisma (which would return a
cryptic error).

### 6. Prisma transaction for findAll
`$transaction([findMany, count])` fetches data and total count in one
database round-trip instead of two sequential queries.

---

## Next Steps (for Next.js frontend)

The API is CORS-enabled. Set `FRONTEND_URL` in `.env` to your Next.js dev URL:
```env
FRONTEND_URL=http://localhost:3001
```

Suggested fetch pattern from Next.js:
```typescript
const res = await fetch('http://localhost:3000/api/applications?status=Applied');
const { data, total } = await res.json();
```
