import React from 'react';
import { Icon } from '@/components/atoms/Icon';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <nav
      className={`flex items-center justify-center space-x-1 sm:space-x-2 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Previous page"
      >
        <Icon name="ChevronLeft" size={20} />
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-muted">
              &hellip;
            </span>
          );
        }

        const isCurrentPage = page === currentPage;

        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onPageChange(page as number)}
            aria-current={isCurrentPage ? 'page' : undefined}
            className={`
              min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent
              ${isCurrentPage ? 'bg-accent text-[#111827]' : 'text-text hover:bg-surface'}
            `
              .trim()
              .replace(/\s+/g, ' ')}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Next page"
      >
        <Icon name="ChevronRight" size={20} />
      </button>
    </nav>
  );
};
