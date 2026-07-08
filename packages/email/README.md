# @workspace/email

Transactional email for Agropilot (Resend).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Production | Resend API key. Without it, emails are logged to stdout in development. |
| `EMAIL_FROM` | Optional | Sender address, e.g. `Agropilot <invitaciones@tudominio.com>`. |
| `WEB_APP_URL` | Optional | Frontend base URL for links. Falls back to `FRONTEND_URI` or first `ORIGINS` value. |
