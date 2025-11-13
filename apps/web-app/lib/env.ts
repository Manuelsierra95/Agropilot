import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url().nonempty(),
    NEXT_PUBLIC_API_VERSION: z.string().nonempty(),
    NEXT_PUBLIC_FRONTEND_URL: z.string().url().nonempty(),
    NEXT_PUBLIC_CACHE_TIME: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_CACHE_TIME: process.env.NEXT_PUBLIC_CACHE_TIME,
  },
})
