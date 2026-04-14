Neon-only setup

Environment strategy

    - Local development (Neon dev database/branch):
    	- APP_ENV=local (or development)
        - DATABASE_URL=postgresql://...
    - Preview/Staging (Neon):
    - APP_ENV=preview (or staging)
    - DATABASE_URL=postgresql://...
    - Production (Neon):
    - APP_ENV=production
    - DATABASE_URL=postgresql://...

Drizzle config resolves URLs in this order:

    - all environments: DATABASE_URL
