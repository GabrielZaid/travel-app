interface PaginationOptions {
  page?: number;
  limit?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export function resolvePagination({
  page,
  limit,
  defaultLimit = 5,
  maxLimit = 50,
}: PaginationOptions): { page: number; limit: number } {
  const safePage = typeof page === 'number' && page >= 1 ? page : 1;
  const resolvedLimit =
    typeof limit === 'number' && limit >= 1 ? limit : defaultLimit;
  const safeLimit = Math.min(resolvedLimit, maxLimit);
  return { page: safePage, limit: safeLimit };
}

export function slicePage<T>(
  collection: readonly T[],
  page: number,
  limit: number,
): T[] {
  const start = (page - 1) * limit;
  return collection.slice(start, start + limit);
}
