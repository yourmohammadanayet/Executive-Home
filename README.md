# Executive Home Management System - Backend

This is the production-ready backend for the Executive Home Management System, built using Express (API routes), Supabase (PostgreSQL, Auth, Storage), and Zod for validation.

## Tech Stack
- **API Server:** Express with Vite middleware in development
- **Language:** TypeScript
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Validation:** Zod
- **Testing:** Vitest (Integration)
- **Background Jobs:** node-cron (for scheduled monthly bill generation)

## Architecture Overview
The backend exposes RESTful API endpoints at `/api/*`. It leverages Supabase for identity management and PostgreSQL row-level security (RLS) to ensure that members can only access their own data, while admins have full access.

The core business logic (e.g., calculating joining charges, generating bills, applying advances) is handled via secure PostgreSQL functions and transactions to guarantee data integrity and avoid race conditions.

## Database Schema & Migrations
The complete database schema, RLS policies, views, and functions are defined in `supabase-schema.sql`.

To initialize the database:
1. Copy the contents of `supabase-schema.sql`
2. Run it in the Supabase SQL Editor

### Key Tables
- `profiles` (auth user details)
- `rooms` (available rooms)
- `members` (member records)
- `joining_charges` (one-time fees)
- `monthly_bills` (recurring rent records)
- `payments` & `payment_allocations` (financial tracking)
- `documents` (private storage references)

## Environment Variables
Copy `.env.example` to `.env` and fill in the required values:

```env
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
APP_URL="http://localhost:3000"
```

*Note: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.*

## API Documentation

- `GET /api/members` - List all members (Admin only)
- `POST /api/members` - Create a new member (Admin only)
- `GET /api/settings` - Get home settings

Responses follow the standard format:
```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "uuid" }
}
```

## Running Locally

1. `npm install`
2. `npm run dev`
The server will start on port `3000`.

## Automated Jobs
Monthly bills are generated on the 1st of every month automatically via the backend cron service, which ensures idempotency and skips archived/left members.
