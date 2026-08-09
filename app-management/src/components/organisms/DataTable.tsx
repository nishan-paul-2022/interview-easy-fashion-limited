'use client';

import React from 'react';
import { EmptyState, EmptyStateProps } from '@/components/molecules/EmptyState';
import { Pagination, PaginationProps } from '@/components/molecules/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHeader,
  TableLoading,
  TableRow,
} from '@/components/molecules/Table';

export interface DataTableColumn<T> {
  key: string | keyof T;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyProps?: Partial<EmptyStateProps>;
  rowActions?: (row: T) => React.ReactNode;
  pagination?: PaginationProps;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isEmpty = false,
  emptyProps,
  rowActions,
  pagination,
}: DataTableProps<T>) {
  const colSpan = columns.length + (rowActions ? 1 : 0);

  // Client-side sorting state
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc' | null>(null);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortBy(null);
        setSortOrder(null);
      }
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy || !sortOrder) {
      return data;
    }

    return [...data].sort((a, b) => {
      // Resolve custom display properties if they are nested or not simple
      const aVal = a[sortBy as keyof T];
      const bVal = b[sortBy as keyof T];

      if (aVal === undefined || aVal === null) {
        return 1;
      }
      if (bVal === undefined || bVal === null) {
        return -1;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [data, sortBy, sortOrder]);

  // Treat empty data array as empty state if not loading
  const showEmpty = isEmpty || (!isLoading && sortedData.length === 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full overflow-x-auto rounded-xl border border-muted/20 bg-surface shadow-sm">
        <Table>
          <thead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHeader
                  key={String(col.key) || idx}
                  sortable={col.sortable}
                  sortDirection={sortBy === col.key ? sortOrder : null}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  {col.header}
                </TableHeader>
              ))}
              {rowActions && <TableHeader align="right">Actions</TableHeader>}
            </TableRow>
          </thead>
          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={colSpan} rows={5} />
            ) : showEmpty ? (
              <TableEmpty colSpan={colSpan}>
                <EmptyState
                  icon={emptyProps?.icon || 'Package'}
                  title={emptyProps?.title || 'No data found'}
                  description={emptyProps?.description || 'There are no records to display.'}
                  action={emptyProps?.action}
                />
              </TableEmpty>
            ) : (
              sortedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} striped>
                  {columns.map((col, colIndex) => (
                    <TableCell key={String(col.key) || colIndex}>
                      {col.render ? col.render(row) : (row[col.key as keyof T] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-2">{rowActions(row)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex justify-end mt-2">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
