import React from 'react';

import { Icon } from '@/components/atoms/Icon';
import { TableSkeleton } from '@/components/molecules/Skeleton';

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-muted/20 bg-surface">
      <table ref={ref} className={`w-full text-sm text-left text-text ${className}`} {...props}>
        {children}
      </table>
    </div>
  ),
);
Table.displayName = 'Table';

export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => (
  <thead
    ref={ref}
    className={`text-xs text-muted uppercase bg-surface/50 border-b border-muted/20 ${className}`}
    {...props}
  >
    {children}
  </thead>
));
TableHead.displayName = 'TableHead';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className = '', children, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
));
TableBody.displayName = 'TableBody';

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
}

export const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className = '', children, sortable, sortDirection, onClick, ...props }, ref) => (
    <th
      ref={ref}
      className={`px-4 py-3 font-medium whitespace-nowrap sticky top-0 ${sortable ? 'cursor-pointer hover:bg-muted/10 transition-colors' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="flex flex-col">
            {sortDirection === 'asc' ? (
              <Icon name="ChevronRight" className="-rotate-90 text-accent" size={14} />
            ) : sortDirection === 'desc' ? (
              <Icon name="ChevronRight" className="rotate-90 text-accent" size={14} />
            ) : (
              <Icon name="Minus" className="text-muted/30" size={14} />
            )}
          </span>
        )}
      </div>
    </th>
  ),
);
TableHeader.displayName = 'TableHeader';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  striped?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', children, striped, ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-muted/10 transition-colors hover:bg-muted/5 ${striped ? 'even:bg-muted/5' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  ),
);
TableRow.displayName = 'TableRow';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', children, align = 'left', ...props }, ref) => {
    const alignClass =
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return (
      <td ref={ref} className={`px-4 py-3 whitespace-nowrap ${alignClass} ${className}`} {...props}>
        {children}
      </td>
    );
  },
);
TableCell.displayName = 'TableCell';

export interface TableEmptyProps {
  children: React.ReactNode;
  colSpan: number;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({ children, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12 text-center">
      {children}
    </td>
  </tr>
);

export interface TableLoadingProps {
  colSpan: number;
  rows?: number;
  children?: React.ReactNode;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ colSpan, rows = 5, children }) => (
  <tr>
    <td colSpan={colSpan} className="p-0">
      {children || <TableSkeleton rows={rows} columns={colSpan} />}
    </td>
  </tr>
);
