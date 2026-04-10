# Copilot Instructions

## Technology Stack Details

### Core Framework & Runtime

- Monorepo managed with Turborepo

#### Frontend:

- Next.js 16.1.16 with App Router
- React 19.2.0
- TypeScript 5.7.2 with strict mode enabled
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
- Skills may include frontend design, web best practices, Hono framework, React/Next.js optimization, and more.
- If a new skill is added to `.github/skills`, it should be automatically available for Copilot to use.

**How it works:**

1. On every user request, scan `.github/skills` for relevant skills.
2. Load the instructions from each skill file as needed.
3. Apply the knowledge and recommendations from the skills to code generation, review, and suggestions.

---

## External Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Next.js SDK](https://clerk.com/docs/references/nextjs)
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
