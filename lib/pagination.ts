export function getPagination(pageParam?: string, pageSize = 10) {
  const page = Math.max(1, Number(pageParam ?? 1));
  const skip = (page - 1) * pageSize;
  return { page, skip, take: pageSize };
}
