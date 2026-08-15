# Deployment

## Recommended

- Frontend/server: Vercel or a Node-compatible platform supporting Next.js 16.
- Database/Auth: Supabase.
- Domain: custom production domain.
- Monitoring: Sentry-equivalent error monitoring + platform logs.
- Email: production SMTP provider configured in Supabase Auth.

## Environment

Use `.env.example` as the contract. `SUPABASE_SECRET_KEY` must remain server-only.

## Security

- Keep RLS enabled.
- Never expose Supabase secret/service credentials to browser bundles.
- Use publishable key on client.
- Restrict rule writes to privileged backend/admin operations.
- Treat HPP as confidential business data.
- Enable backups and test restore procedure.

## Deployment order

1. Supabase project.
2. SQL migration.
3. Seed verified rules.
4. Auth/SMTP configuration.
5. Deploy Next.js.
6. Configure environment secrets.
7. Smoke test rule mode production.
8. Run calculation regression suite.
9. Run import tests with representative seller files.
