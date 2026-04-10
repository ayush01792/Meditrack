# MediTrack — Medicine Reminder & Health Tracker

A full-stack health management application that helps users track medicines, log vitals, manage medical history, and receive timely reminders via email notifications.

**Live Demo**: [meditrack-steel.vercel.app](https://meditrack-steel.vercel.app)

---

## Features

- **JWT Authentication** — Secure login/register with access + refresh token rotation
- **Medicine Management** — CRUD with dosage, frequency, and custom reminder times
- **Automated Reminders** — Cron-based email notifications for missed/upcoming medicines
- **Vitals Tracking** — Log blood pressure, blood sugar, and weight with trend charts
- **Adherence Dashboard** — Visual stats showing medicine intake adherence over time
- **Health Reports** — Download PDF reports; generate shareable doctor-view links
- **Medical History** — Store past hospital visits with prescription image uploads
- **Weekly Summary Emails** — Automated weekly health summaries via Nodemailer

---

## Tech Stack

### Frontend
| Tech | Usage |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool |
| TailwindCSS | Styling with dark/light mode |
| TanStack Query v5 | Server state & caching |
| React Hook Form + Zod | Form validation |
| Zustand | Auth & theme global state |
| Recharts | Vitals trend graphs |
| React Router v7 | Client-side routing |
| Axios | HTTP client with refresh interceptor |

### Backend
| Tech | Usage |
|---|---|
| Node.js + Express 5 | REST API server |
| TypeScript | Type safety |
| PostgreSQL | Primary database |
| Supabase | DB hosting + file storage |
| JWT | Access (1h) + Refresh (7d) tokens |
| node-cron | Scheduled reminder jobs |
| Nodemailer | Email notifications (Gmail SMTP) |
| Multer | File upload handling |
| PDFKit | PDF report generation |
| Zod | Request validation |
| bcryptjs | Password hashing |
| helmet + cors + rate-limit | Security middleware |

---

## Architecture

```
client/                     # React frontend (deployed on Vercel)
├── src/
│   ├── features/           # Feature-based modules
│   │   ├── auth/
│   │   ├── medicines/
│   │   ├── vitals/
│   │   ├── reminders/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   └── medicalHistory/
│   ├── components/         # Shared UI components
│   ├── pages/              # Route-level page components
│   ├── store/              # Zustand stores
│   ├── lib/                # Axios instance, utils
│   └── router/             # React Router config

server/                     # Express backend (deployed on Render)
├── src/
│   ├── controllers/        # Request handlers
│   ├── routes/             # Express routers
│   ├── middleware/         # Auth, validation, error handling
│   ├── db/queries/         # Typed PostgreSQL queries
│   ├── services/           # Cron jobs, mailer, PDF, FCM
│   └── config/             # DB, env, Firebase, Supabase
└── scripts/                # Database migration scripts
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Medicines
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medicines` | List all medicines |
| POST | `/api/medicines` | Add medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |
| PATCH | `/api/medicines/:id/toggle` | Toggle active status |

### Vitals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vitals` | Get vitals history |
| POST | `/api/vitals` | Log a vital |
| DELETE | `/api/vitals/:id` | Delete a vital entry |

### Reminders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reminders/today` | Today's reminders |
| PATCH | `/api/reminders/:id/status` | Take / snooze / skip |

### Medical History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/medical-records` | List all records |
| POST | `/api/medical-records` | Add record (with file upload) |
| DELETE | `/api/medical-records/:id` | Delete record |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/download` | Download PDF health report |
| POST | `/api/reports/share` | Generate doctor-share link |
| GET | `/api/reports/shared/:token` | View shared report (public) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)
- Gmail account with App Password for emails

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd client
npm install
# create .env.local with:
# VITE_API_URL=http://localhost:8080/api
npm run dev
```

### Database Migration

```bash
cd server
npx tsx scripts/migrate.ts
npx tsx scripts/migrate-medical-history.ts
```

---

## Environment Variables

### Server `.env`
```env
PORT=8080
NODE_ENV=development
CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

DATABASE_URL=your_postgresql_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MediTrack <your@gmail.com>"
```

### Client `.env.local`
```env
VITE_API_URL=http://localhost:8080/api
```

---

## Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [Supabase](https://supabase.com) |
| File Storage | Supabase Storage |

---

## Key Implementation Details

- **Token Refresh**: Axios interceptor automatically refreshes expired access tokens and queues concurrent requests during refresh
- **Cron Jobs**: 5 scheduled jobs — daily reminder creation, minute-level notifications, 30-min missed marking, Monday weekly summary, daily token purge
- **File Upload**: Multer (memory storage) → Supabase Storage with automatic cleanup on delete
- **PDF Generation**: PDFKit renders adherence stats, medicine list, and vitals history into a downloadable report
- **Doctor Share**: Time-limited signed tokens for read-only public health report views
- **Security**: Helmet headers, CORS, rate limiting (100 req/15min global, 10 req/15min auth)
