import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  borderRadius = '0.375rem',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-muted/20 ${className}`}
      style={{ width, height, borderRadius, ...style }}
      {...props}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex h-full w-full max-w-sm flex-col overflow-hidden rounded-xl border border-muted/20 bg-surface shadow-sm">
      <Skeleton height={240} borderRadius={0} />
      <div className="flex flex-col gap-3 p-4">
        <div>
          <Skeleton height={20} width="80%" className="mb-2" />
          <Skeleton height={14} width="40%" />
        </div>
        <div className="flex gap-2">
          <Skeleton height={24} width={40} borderRadius="9999px" />
          <Skeleton height={24} width={40} borderRadius="9999px" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton height={24} width={80} />
          <Skeleton height={36} width={100} borderRadius="0.5rem" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <div className="flex w-full items-center border-b border-muted/10 px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 pr-4 last:pr-0">
          <Skeleton height={20} width={i === 0 ? '60%' : '80%'} />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="flex w-full flex-col">
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  );
};

export const ProductGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};
