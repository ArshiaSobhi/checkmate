# Checkmate

Production-ready real-time chess web application built with Next.js App Router, TypeScript, Tailwind, Prisma, and PostgreSQL. Includes ranked/casual play, friends, leaderboards, onboarding, admin, and secure auth powered by NextAuth.

## Tech Stack
- Next.js 16 (App Router, Server Components)
- TypeScript + Tailwind CSS
- Prisma ORM with PostgreSQL
- NextAuth (credentials) with Prisma Adapter
- Pusher-ready real-time hooks (configure keys)
- chess.js + react-chessboard for rules/board
- SWR, zod, bcrypt, sonner toasts

## Setup
1) Install deps  
`npm install`

2) Environment variables (`.env.local`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/checkmate
NEXTAUTH_SECRET=replace-with-strong-secret
NEXTAUTH_URL=http://localhost:3000
EMAIL_FROM=checkmate@example.com
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=smtp-user
EMAIL_SERVER_PASSWORD=smtp-password
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
```

3) Prisma & database
```
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed    # creates admin user admin/admin
```

4) Run dev
```
npm run dev
```

5) Production build check
```
DATABASE_URL=... NEXTAUTH_SECRET=... npm run build
```

## Deploying to Vercel
- Add the env vars above in Project Settings.  
- Use a managed PostgreSQL (e.g., Neon/Supabase/Railway).  
- Run `prisma migrate deploy` in a pre-deploy step or via Vercel Build command hook.  
- Ensure `NEXTAUTH_URL` matches the Vercel URL and set `NEXTAUTH_SECRET`.  
- Configure Pusher keys for real-time (optional; app still works with polling).  

## Default Admin
- Email: `admin@checkmate.app`
- Username: `admin`
- Password: `admin` (forced change recommended immediately after deploy)

## Notes
- Ranked games require verified email; onboarding gating is enforced on dashboard.  
- All Prisma models live in `prisma/schema.prisma`; seed data in `prisma/seed.ts`.  
- UI components are in `src/components`, API routes in `src/app/api`, and pages in `src/app`.  
