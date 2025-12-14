## Overview
- Convert page-embedded UI into reusable Vue components and composables
- Keep current stack: Nuxt 4 (Vue 3), TailwindCSS, Nitro APIs
- Avoid new libraries; leverage auto-imported components/composables in Nuxt

## Goals
- Reduce duplication with shared UI primitives and feature components
- Isolate data access and side effects via composables
- Strengthen typing for props/events and API results
- Keep pages thin: layout + component wiring only

## Proposed Structure
- `components/ui/` — atomic UI primitives (button, card, input, modal, alert)
- `components/layout/` — shell, page header, section wrappers
- `components/workouts/` — list, item, empty state, form, detail blocks
- `components/exercises/` — list, item, set row/editor
- `components/progress/` — chart/summary blocks
- `composables/` — `useApi`, `useWorkouts`, `useExercises`
- `types/` — shared client-side DTOs (Workout, Exercise, Set)
- `utils/` — formatters (dates, weights), helpers

## UI Primitives (Tailwind-based)
- `components/ui/Button.vue` — variants: primary/secondary/ghost, size: sm/md/lg, loading
- `components/ui/Card.vue` — header/body/footer slots
- `components/ui/Input.vue` — label, hint, error, v-model, types
- `components/ui/Select.vue` — options, v-model
- `components/ui/Modal.vue` — controlled open/close, slots
- `components/ui/Alert.vue` — success/warning/error, dismissible
- `components/ui/Skeleton.vue` — loading placeholders

## Layout
- `components/layout/AppShell.vue` — header/nav/container wraps `<NuxtPage />`
- `components/layout/PageHeader.vue` — title, actions slot
- `components/layout/Section.vue` — section title and content

## Feature Components
- Workouts:
  - `WorkoutList.vue`, `WorkoutListItem.vue`, `WorkoutsEmptyState.vue`
  - `WorkoutForm.vue` for `/workouts/new`
  - `WorkoutSummary.vue` and `WorkoutDetail.vue` for `[id]`
- Exercises:
  - `ExerciseList.vue`, `ExerciseItem.vue`, `SetRow.vue`, `ExerciseEditor.vue`
- Progress:
  - `ProgressSummary.vue`, `ProgressChart.vue` (simple/no external chart lib; use CSS/DOM first)

## Composables
- `useApi.ts` — thin `$fetch` wrapper with base path, error normalization, typed responses
- `useWorkouts.ts` — list/create/get/delete workouts; loading/errors; returns refs
- `useExercises.ts` — CRUD exercises and sets; loading/errors; returns refs

## Types
- `types/workout.ts` — `Workout`, `WorkoutCreate`, `WorkoutDetail`
- `types/exercise.ts` — `Exercise`, `ExerciseSet`, `ExerciseCreate`
- `types/api.ts` — ApiError shape, Result types

## Page Refactors (thin controllers)
- `pages/index.vue` — compose `PageHeader`, `QuickActions` (derived from `Button`), `StatsCard`
- `pages/workouts/index.vue` — call `useWorkouts()`, render `WorkoutList`
- `pages/workouts/new.vue` — render `WorkoutForm`, submit via `useWorkouts().create`
- `pages/workouts/[id].vue` — load via `useWorkouts().getById`, render `WorkoutSummary`, `ExerciseList`

## Error/Loading UX
- Use `Alert` and `Skeleton` to standardize errors and loading
- Normalize API errors in `useApi`; surface to components via props/slots

## Conventions
- Components: PascalCase filenames; `<script setup lang="ts">`; emit `update:modelValue` for v-model
- Props: typed; defaults via `withDefaults`
- Composables: `useX` naming; return refs and methods; no DOM
- Styling: Tailwind utility-first; reuse `assets/css/main.css` component classes

## Incremental Migration Steps
1. Create UI primitives under `components/ui` and replace direct Tailwind blocks in pages
2. Extract Workout list/detail and forms into `components/workouts`
3. Extract Exercise list and set rows into `components/exercises`
4. Introduce `useApi`, then `useWorkouts` and `useExercises` for all network calls
5. Add `types` and update components/composables to use them
6. Refactor pages to thin controllers using the new components/composables

## Verification
- Run dev server; verify `/`, `/workouts`, `/workouts/new`, `/workouts/:id` still function
- Check loading/error states via network throttling or forced failures
- Type-check and ensure no implicit `any` in props/composables

## Optional Enhancements (later)
- Add lightweight charts (only if needed) and unit tests with Vitest
- Consider `@nuxtjs/color-mode` for dark mode and Tailwind theme variants
- Evaluate Pinia for broader cross-page state if use cases emerge