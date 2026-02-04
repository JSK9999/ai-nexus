---
description: React/Next.js best practices - waterfalls, bundle optimization, server components, re-render prevention
---

# React/Next.js Best Practices

## When to Apply
- Writing React components or Next.js pages
- Implementing data fetching
- Optimizing bundle size or performance

## Critical Rules

### 1. Eliminating Waterfalls
- Move `await` into branches where actually used
- Use `Promise.all()` for independent operations
- Use Suspense to stream content

### 2. Bundle Optimization
- Import directly, avoid barrel files
- Use `next/dynamic` for heavy components
- Load analytics/logging after hydration

### 3. Server-Side
- Prefer Server Components (default in App Router)
- Use `cache()` for request deduplication
- Stream with `loading.tsx` and Suspense

### 4. Client-Side Data
- Use SWR/React Query for client fetching
- Implement stale-while-revalidate pattern
- Deduplicate requests

### 5. Re-render Prevention
- Lift state up to prevent prop drilling
- Use `React.memo()` for expensive components
- Split components at state boundaries

## Code Style
- TypeScript required, no `any`
- Tailwind CSS for styling
- Server Components first, Client only when needed
