"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./Pagination.module.css";

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
}

function buildUrl(params: URLSearchParams, page: number): string {
  const next = new URLSearchParams(params.toString());
  if (page === 1) {
    next.delete("pagina");
  } else {
    next.set("pagina", String(page));
  }
  const qs = next.toString();
  return qs ? `?${qs}` : "/";
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ total, pageSize, currentPage }: PaginationProps) {
  const params = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = pageNumbers(currentPage, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginering">
      <Link
        href={buildUrl(params, currentPage - 1)}
        className={`${styles.btn} ${currentPage <= 1 ? styles.disabled : ""}`}
        aria-disabled={currentPage <= 1}
        aria-label="Vorige pagina"
      >
        ‹
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(params, p)}
            className={`${styles.btn} ${p === currentPage ? styles.active : ""}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={buildUrl(params, currentPage + 1)}
        className={`${styles.btn} ${currentPage >= totalPages ? styles.disabled : ""}`}
        aria-disabled={currentPage >= totalPages}
        aria-label="Volgende pagina"
      >
        ›
      </Link>
    </nav>
  );
}
