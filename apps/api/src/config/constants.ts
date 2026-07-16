export const DEVORIGINS = ["http://localhost:3000", "http://localhost:3001"]

export const ORIGINS = process.env.ORIGINS?.split(",") ?? [
  "https://agropilotapp.es",
]
