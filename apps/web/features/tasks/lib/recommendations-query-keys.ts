export const recommendationsQueryKeys = {
  all: ["recommendations"] as const,
  list: (parcelId?: string) =>
    [...recommendationsQueryKeys.all, "list", parcelId ?? "all"] as const,
}
