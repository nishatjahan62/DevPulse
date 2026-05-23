# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL
https://devpulse-jify.onrender.com

## Features
- User registration and login with JWT authentication
- Role-based access control (contributor and maintainer)
- Create, read, update, and delete issues
- Filter and sort issues by type, status, and date
- Secure password hashing with bcrypt

## Tech Stack
- Node.js + TypeScript
- Express.js
- PostgreSQL (NeonDB)
- bcrypt, jsonwebtoken, http-status-codes

## Setup

```bash
git clone https://github.com/nishatjahan62/DevPulse
cd devpulse
npm install
```

Create `.env` file:
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

## Database Schema

**users:** id, name, email, password (hashed), role, created_at, updated_at

**issues:** id, title (max 150), description (min 20), type, status, reporter_id, created_at, updated_at