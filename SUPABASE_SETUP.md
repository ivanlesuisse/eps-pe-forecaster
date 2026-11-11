# Supabase / PostgreSQL

The application uses PostgreSQL in the private `fintrack` schema. Keep this schema out of Supabase Data API exposed schemas; browser access goes through authenticated Next.js routes.

Set server-only environment variables:
- `DATABASE_URL`: Supabase transaction pooler, port 6543, with `?pgbouncer=true&sslmode=require&schema=fintrack`.
- `DIRECT_URL`: the same Supabase shared pooler in session mode, port 5432, with `?sslmode=require&schema=fintrack`, for Prisma migrations.
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

Vercel build command: `npm run vercel-build`. This applies checked-in PostgreSQL migrations before building. A failed migration blocks deployment. Ordinary `npm run build` does not mutate a database.

For local work, use a separate PostgreSQL database and run `npm run db:migrate`, then `npm run dev`. Never point preview/development deployments at production.

The previous SQLite schema and migrations are preserved in `prisma/legacy-sqlite` for reference. The PostgreSQL migration creates new tables; it does not copy data from an existing SQLite file. Do not run a reset or use `db push --accept-data-loss` against production.
