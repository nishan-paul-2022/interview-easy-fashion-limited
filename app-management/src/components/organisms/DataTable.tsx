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

  // Treat empty data array as empty state if not loading
  const showEmpty = isEmpty || (!isLoading && data.length === 0);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="w-full overflow-x-auto rounded-xl border border-muted/20 bg-surface shadow-sm">
        <Table>
          <thead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHeader key={String(col.key) || idx} sortable={col.sortable}>
                  {col.header}
                </TableHeader>
              ))}
              {rowActions && <TableHeader className="text-right">Actions</TableHeader>}
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
              data.map((row, rowIndex) => (
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
