export interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export function parsePaginationMeta(res: Response, page: number, size: number, bodyCount: number): PaginationMeta | null {
  const hTotalCount = res.headers.get('X-Total-Count');
  const hTotalPages = res.headers.get('X-Total-Pages');
  const hPage = res.headers.get('X-Page');
  const hPageSize = res.headers.get('X-Page-Size');

  if (hTotalCount && hTotalPages && hPage && hPageSize) {
    const totalCount = Number(hTotalCount);
    const totalPages = Number(hTotalPages);
    const pageNum = Number(hPage);
    const pageSize = Number(hPageSize);
    if ([totalCount, totalPages, pageNum, pageSize].every(Number.isFinite)) {
      return { totalCount, totalPages, page: pageNum, pageSize };
    }
  }

  const contentRange = res.headers.get('Content-Range');
  if (contentRange) {
    const match = /items\s+(\d+)-(\d+)\/(\d+)/i.exec(contentRange);
    if (match) {
      const totalCount = Number(match[3]);
      const totalPages = Math.max(1, Math.ceil(totalCount / (size || 1)));
      return { totalCount, totalPages, page, pageSize: size };
    }
  }

  if (Number.isFinite(bodyCount)) {
    const totalCount = bodyCount;
    const totalPages = Math.max(1, Math.ceil(totalCount / (size || 1)));
    return { totalCount, totalPages, page, pageSize: size };
  }

  return null;
}

