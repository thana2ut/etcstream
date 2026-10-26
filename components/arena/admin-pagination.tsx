"use client";
import { useState, type ReactNode } from "react";

export const ADMIN_PAGE_SIZE = 6;

export function AdminPagedItems<T>({ items, children }: { items: T[]; children: (items: T[]) => ReactNode }) {
  const [pageIndex, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / ADMIN_PAGE_SIZE)), page = Math.min(pageIndex, pages - 1);
  return <>{children(items.slice(page * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE + ADMIN_PAGE_SIZE))}{pages > 1 && <AdminPagination page={page} onPage={setPage} hasNext={page < pages - 1} totalPages={pages} totalItems={items.length} />}</>;
}

export function AdminPagination({ page, onPage, hasNext, busy = false, totalPages, totalItems }: { page: number; onPage: (page: number) => void; hasNext: boolean; busy?: boolean; totalPages?: number; totalItems?: number }) {
  return <nav className="admin-market-pages" aria-label="เปลี่ยนหน้ารายการ" aria-busy={busy}>
    <button type="button" disabled={busy || page === 0} onClick={() => onPage(page - 1)}>ย้อนกลับ</button>
    <span role="status" aria-live="polite">หน้า {page + 1}{totalPages ? ` / ${totalPages}` : ""}{totalItems !== undefined && <small>{`${Math.min(page * ADMIN_PAGE_SIZE + 1, totalItems)}–${Math.min((page + 1) * ADMIN_PAGE_SIZE, totalItems)} จาก ${totalItems} รายการ`}</small>}</span>
    <button type="button" disabled={busy || !hasNext} onClick={() => onPage(page + 1)}>ถัดไป</button>
  </nav>;
}
