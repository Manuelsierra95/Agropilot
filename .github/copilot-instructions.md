# Copilot Instructions

## Technology Stack Details

### Core Framework & Runtime

- Monorepo managed with Turborepo

#### Frontend:

- Next.js 16.1.16 with App Router
- React 19.2.0
- TypeScript 5.7.2 with strict mode enabled
- Server components by default; use `'use client'` only when necessary
- Better Auth for authentication (with Drizzle adapter)
- Styling & UI:
  - Tailwind CSS v4 (using `@import 'tailwindcss'` syntax)
  - PostCSS with `@tailwindcss/postcss` plugin
  - shadcn/ui component library (Radix UI primitives)
  - CSS custom properties for theming (OKLCH color format)
- State Management:
  - Zustand 5.x for global state
  - Nuqs for URL search params state management
  - React Hook Form + Zod for form handling

#### Backend:

- Hono 3.x for API routes and serverless functions

### Data & APIs

- TanStack Table for data tables
- Recharts for analytics/charts
- Mock API utilities in `src/constants/mock-api.ts`

### Development Tools

- ESLint 8.x with Next.js core-web-vitals config
- Prettier 3.x with prettier-plugin-tailwindcss
- Husky for git hooks
- lint-staged for pre-commit formatting

### State Management

- Zustand 5.x for global state
- Nuqs for URL search params state management
- React Hook Form + Zod for form handling

## Data Fetching Patterns

### Server Components (Default)

Fetch data directly in async components:

```tsx
export default async function ProductPage() {
  const products = await getProducts(); // Your data fetch
  return <ProductTable data={products} />;
}
```

### URL State Management

Use `nuqs` for search params state:

```tsx
import { useQueryState } from 'nuqs';

const [search, setSearch] = useQueryState('search');
```

---

## Internal Documentation

This workspace is configured to use custom Copilot skills located in the `.github/skills` directory.

**Instructions:**

- Always load and consume all skills found in `.github/skills`.
- Each skill in this folder provides domain-specific knowledge or best practices for the project.
- When a user request matches the domain of a skill, ensure that the skill is loaded and its guidance is applied.
- If a new skill is added to `.github/skills`, it should be automatically available for Copilot to use.

---

### Available Skills

#### 🌐 Web Design Guidelines — React & Next.js Best Practices

- **Path:** `.github/skills/web-design-guidelines/SKILL.md`
- **Use when:** Writing or optimizing any React or Next.js code: component architecture, App Router patterns, SSR/SSG, hydration, performance, accessibility, and general frontend best practices.

#### ⚡ Hono Framework

- **Path:** `.github/skills/hono/SKILL.md`
- **Use when:** Writing or modifying API routes, middleware, RPC handlers, or any server-side logic using Hono.

#### ✅ Vercel React Best Practices

- **Path:** `.github/skills/vercel-react-best-practices/SKILL.md`
- **Use when:** Optimizing React rendering, managing re-renders, implementing async patterns, handling bundles, or writing server components. Includes granular rules in `.github/skills/vercel-react-best-practices/rules/`.
- **Key rule categories:**
  - `rendering-*` — SSR, hydration, SVG, resource hints
  - `rerender-*` — memo, derived state, transitions, refs
  - `async-*` — suspense, parallel fetching, deferred loading
  - `bundle-*` — dynamic imports, barrel imports, tree-shaking
  - `js-*` — DOM batching, caching, set/map lookups, early exit
  - `server-*` — auth actions, LRU cache, static IO hoisting
  - `client-*` — localStorage schema, passive listeners, SWR dedup

#### 🔐 Better Auth

- **Path:** `.github/skills/betterauth-skills/better-auth/`
- **Use when:** Implementing or modifying authentication flows.
- **Sub-skills:**
  - `create-auth/SKILL.md` — Initial auth setup with Drizzle adapter
  - `emailAndPassword/SKILL.md` — Email & password authentication
  - `organization/SKILL.md` — Multi-tenant / organization support
  - `twoFactor/SKILL.md` — Two-factor authentication
  - `best-practices/SKILL.md` — Auth security best practices
  - `commands/explain-error.md` — Diagnosing Better Auth errors
  - `commands/providers.md` — OAuth provider configuration

#### 🛡️ Security

- **Path:** `.github/skills/betterauth-skills/security/SKILL.MD`
- **Use when:** Reviewing or writing any code that handles authentication, authorization, secrets, user data, or API security.

#### 🏢 Awesome Design — UI & Visual Design Reference

- **Path:** `.github/skills/awesome-design/design-md/<brand>/README.md`
- **Use when:** Designing or building any UI component, page layout, or visual interface. Load the most relevant brand as inspiration for aesthetics, spacing, typography, color, and component patterns. Default to brands known for clean, modern product design (e.g. Linear, Vercel, Stripe, Notion, Raycast) unless a specific brand is requested.
- **Available brands:** Airbnb, Airtable, Apple, BMW, Cal, Claude, Clay, ClickHouse, Cohere, Coinbase, Composio, Cursor, ElevenLabs, Expo, Ferrari, Figma, Framer, HashiCorp, IBM, Intercom, Kraken, Lamborghini, Linear, Lovable, Minimax, Mintlify, Miro, Mistral, MongoDB, Notion, NVIDIA, Ollama, Opencode, Pinterest, PostHog, Raycast, Renault, Replicate, Resend, Revolut, RunwayML, Sanity, Semrush, Sentry, SpaceX, Spotify, Stripe, Supabase, Superhuman, Tesla, Together.ai, Uber, Vercel, VoltAgent, Warp, Webflow, Wise, xAI, Zapier

---

**How it works:**

1. On every user request, scan `.github/skills` for relevant skills.
2. Load the instructions from each matching skill file.
3. Apply the knowledge and recommendations to code generation, review, and suggestions.
4. **For UI/visual design:** always load `.github/skills/awesome-design/design-md/vercel/README.md` using the most relevant brand as reference.
5. **For React/Next.js best practices:** always load `.github/skills/web-design-guidelines/SKILL.md` alongside `vercel-react-best-practices`.
6. **For `vercel-react-best-practices`:** also scan the `rules/` subdirectory for the most specific applicable rule.
7. **For `betterauth-skills`:** load the sub-skill that matches the feature being implemented.

---

## External Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TanStack Table](https://tanstack.com/table/latest)

---

## Notes for AI Agents

1. **Always use `cn()` for className merging** - never concatenate strings manually
2. **Respect the feature-based structure** - put new feature code in `src/features/`
3. **Server components by default** - only add `'use client'` when using browser APIs or React hooks
4. **Type safety first** - avoid `any`, prefer explicit types
5. **Follow existing patterns** - look at similar components before creating new ones
6. **shadcn components** - don't modify files in `@workspace/ui/components/` directly; extend them instead
