## Goal

Make the first three dashboard metrics (Total Workouts, This Week, Total Exercises) more compact, reducing vertical space while preserving readability.

## Design Changes

* Replace bulky `.card` blocks with compact stat items using a new `.stat` utility class.

* Reduce padding and font sizes: labels become `text-xs` with subdued color; values become `text-2xl` bold.

* Keep responsive grid but tighten spacing (e.g., `gap-4`), maintaining 1/2/3 columns across breakpoints.

* Do not alter `.card` globally to avoid unintended layout changes elsewhere.

## Implementation

1. Add `.stat` class in `assets/css/main.css`:

   * `@apply bg-white rounded-md border p-3`

   * Purpose: small, unobtrusive containers for key metrics.
2. Update `pages/index.vue` (lines 3–19) to use `.stat` instead of `.card`:

   * Labels: `text-xs font-medium text-gray-600` (optionally uppercase + tracking-wide)

   * Values: `text-2xl font-bold text-gray-900`

   * Reduce the grid gap from `gap-6` to `gap-4`.
3. Leave data logic as-is (stats computed in the same file) to avoid behavioral changes.

## Validation

* Run the app locally and visually inspect the dashboard for reduced vertical footprint and consistent spacing.

* Verify responsiveness (mobile: single column; tablet: two columns; desktop: three columns).

## Impact & References

* Files touched: `assets/css/main.css`, `pages/index.vue`.

* Code locations: `pages/index.vue:3–19` for the metric blocks.

## Future Optional Enhancements

* Inline stat bar (three metrics in a single horizontal container) if even more compression is desired.

* Add icons later if the project adopts an icon set; none added now to avoid new deps.

