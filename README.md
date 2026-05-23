# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL
https://devpulse-jify.onrender.com

## Tech Stack
- Node.js + TypeScript + Express.js
- PostgreSQL (NeonDB) — raw pg driver, no ORM
- bcrypt, jsonwebtoken, http-status-codes

## Features
- JWT authentication with role-based access control
- Create, read, update, and delete issues
- Filter issues by type and status, sort by date
- Secure password hashing with bcrypt

## Setup

```bash
git clone https://github.com/nishatjahan62/DevPulse
cd devpulse
npm install
```

Create `.env`:
```
DATABASE_URL=your_neondb_url
JWT_SECRET=your_secret
PORT=3001
NODE_ENV=development
```

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| POST | /api/issues | Authenticated |
| GET | /api/issues | Public |
| GET | /api/issues/:id | Public |
| PATCH | /api/issues/:id | Authenticated |
| DELETE | /api/issues/:id | Maintainer only |

**GET /api/issues query params:** `sort` (newest/oldest) · `type` (bug/feature_request) · `status` (open/in_progress/resolved)

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique |
| password | TEXT | Hashed |
| role | VARCHAR(20) | contributor or maintainer |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### issues
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Max 150 chars |
| description | TEXT | Min 20 chars |
| type | VARCHAR(20) | bug or feature_request |
| status | VARCHAR(20) | open, in_progress, resolved |
| reporter_id | INTEGER | No FK constraint |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |