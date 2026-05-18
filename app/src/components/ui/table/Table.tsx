'use client';

import React, { useState, useMemo } from 'react';
import styles from './Table.module.css';

export interface ColumnDef<TRow> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  sortValue?: (row: TRow) => string | number;
  render: (row: TRow) => React.ReactNode;
}

export type SortDirection = 'ASC' | 'DESC';

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface TableProps<TRow> {
  columns: ColumnDef<TRow>[];
  data: TRow[];
  rowKey?: (row: TRow) => string | number;
  onRowClick?: (row: TRow) => void;
}

function nextSortState(current: SortState | null, key: string): SortState | null {
  if (!current || current.key !== key) return { key, direction: 'ASC' };
  if (current.direction === 'ASC') return { key, direction: 'DESC' };
  return null;
}

function SortIndicator({ isActive, direction }: { isActive: boolean; direction: SortDirection | null }) {
  return (
    <span className={[styles.sortIndicator, isActive ? styles.active : ''].join(' ')}>
      <span className={[styles.sortArrow, styles.sortArrowUp, isActive && direction === 'ASC' ? styles.filled : ''].join(' ')} />
      <span className={[styles.sortArrow, styles.sortArrowDown, isActive && direction === 'DESC' ? styles.filled : ''].join(' ')} />
    </span>
  );
}

export function Table<TRow>({ columns, data, rowKey, onRowClick }: TableProps<TRow>) {
  const [sortState, setSortState] = useState<SortState | null>(null);

  const handleSort = (key: string) => {
    setSortState(prev => nextSortState(prev, key));
  };

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const col = columns.find(c => c.key === sortState.key);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortState.direction === 'ASC' ? cmp : -cmp;
    });
  }, [data, sortState, columns]);

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => {
              const isSortable = col.sortable === true && col.sortValue !== undefined;
              const isActive = sortState?.key === col.key;
              const direction = isActive ? sortState!.direction : null;
              return (
                <th
                  key={col.key}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                  className={[
                    styles.th,
                    col.align === 'right' ? styles.right : '',
                    isSortable ? styles.thSortable : '',
                  ].filter(Boolean).join(' ')}
                >
                  {isSortable ? (
                    <span className={styles.thInner}>
                      {col.header}
                      <SortIndicator isActive={isActive} direction={direction} />
                    </span>
                  ) : col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {sortedData.map((row, index) => {
            const key = rowKey ? rowKey(row) : index;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={onRowClick ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
                className={onRowClick ? styles.clickable : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[styles.td, col.align === 'right' ? styles.right : ''].filter(Boolean).join(' ')}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
