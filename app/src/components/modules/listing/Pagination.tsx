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
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({ total, pageSize, currentPage }: PaginationProps) {
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(currentPage, totalPages);

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const pages = pageNumbers(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagina-navigatie">
      <div className={styles.countInfo}>
        {total === 0 ? (
          <span>Geen woningen gevonden</span>
        ) : (
          <><strong>{showingFrom}–{showingTo}</strong> van <strong>{total}</strong> woningen</>
        )}
      </div>

      <div className={styles.pages}>
        <Link
          href={buildUrl(params, page - 1)}
          className={`${styles.btn} ${styles.arrow}${prevDisabled ? ` ${styles.disabled}` : ""}`}
          aria-disabled={prevDisabled}
          aria-label="Vorige pagina"
          tabIndex={prevDisabled ? -1 : undefined}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Vorige
        </Link>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className={`${styles.btn} ${styles.ellipsis}`} aria-hidden="true">…</span>
          ) : (
            <Link
              key={p}
              href={buildUrl(params, p)}
              className={`${styles.btn}${p === page ? ` ${styles.active}` : ""}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          )
        )}

        <Link
          href={buildUrl(params, page + 1)}
          className={`${styles.btn} ${styles.arrow}${nextDisabled ? ` ${styles.disabled}` : ""}`}
          aria-disabled={nextDisabled}
          aria-label="Volgende pagina"
          tabIndex={nextDisabled ? -1 : undefined}
        >
          Volgende
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6"/>
          </svg>
        </Link>
      </div>
    </nav>
  );
}
