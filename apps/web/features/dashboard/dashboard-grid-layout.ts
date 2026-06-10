/** Container-query grid for default-view + skeleton (adapts when copilot/nav shrink width). */

/** Wrapper: establishes @main container from available content width (not viewport). */
export const dashboardContainerClassName = "@container/main min-w-0 w-full"

export const dashboardMainClassName =
  "grid min-w-0 w-full grid-cols-1 gap-0 p-4 @min-[1100px]/main:grid-cols-3"

const fullRow = "col-span-full min-w-0"

export const dashboardGridSlot = {
  topRow: `${fullRow} flex flex-col gap-0 @min-[1100px]/main:col-span-2 @min-[1100px]/main:col-start-1 @min-[1100px]/main:row-start-1`,
  resumeCropWrapper: `${fullRow} order-first flex min-w-0 items-stretch gap-4 @min-[1100px]/main:order-none @min-[1100px]/main:row-span-2 @min-[1100px]/main:col-start-3 @min-[1100px]/main:row-start-1`,
  resumeCrop: "min-w-0 flex-1",
  financeRow: `${fullRow} flex flex-col gap-0 @min-[1100px]/main:col-span-2 @min-[1100px]/main:row-start-2`,
  recoMapRow: `${fullRow} flex flex-col gap-0 @min-[1100px]/main:col-span-3 @min-[1100px]/main:row-start-3`,
  tablesRow: `${fullRow} flex flex-col gap-0 @min-[1100px]/main:col-span-3 @min-[1100px]/main:row-start-4`,
  productionValueRow: `${fullRow} flex flex-col gap-0 @min-[1100px]/main:col-span-3 @min-[1100px]/main:row-start-5`,
  productionValue: "min-w-0",
  rowInner:
    "flex min-w-0 flex-col items-stretch gap-4 @lg/main:flex-row @min-[1100px]/main:flex-row",
  verticalSepDesktop: "hidden @min-[1100px]/main:block",
  /** Between stacked blocks on mobile (hidden on desktop grid rows). */
  horizSepMobile: "@min-[1100px]/main:hidden",
} as const
