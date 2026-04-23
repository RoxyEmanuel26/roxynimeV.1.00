import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  hasPrev: boolean; // Kept for prop compatibility, though disabled logic uses currentPage
  loading: boolean;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

export const PaginationControl: React.FC<PaginationControlProps> = React.memo(({
  currentPage,
  totalPages,
  hasMore,
  loading,
  totalItems,
  onPageChange,
}) => {
  // Determine effective total pages
  const effectiveTotalPages = hasMore && totalPages <= currentPage ? currentPage + 1 : Math.max(totalPages, 1);

  // Generate page numbers with ellipsis
  const pages = useMemo(() => {
    const p: (number | string)[] = [];
    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) p.push(i);
    } else {
      p.push(1);
      if (currentPage > 3) p.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(effectiveTotalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) p.push(i);
      if (currentPage < effectiveTotalPages - 2) p.push("...");
      p.push(effectiveTotalPages);
    }
    return p;
  }, [currentPage, effectiveTotalPages]);

  // Disable rules
  const disablePrev = currentPage <= 1;
  const disableNext = !hasMore && currentPage >= effectiveTotalPages;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 my-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="flex flex-wrap items-center justify-center gap-1">
          <div className="h-10 w-10 sm:w-20 bg-muted rounded-md animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-10 bg-muted rounded-md animate-pulse hidden sm:block" />
          ))}
          <div className="h-10 w-10 sm:w-20 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <nav 
      className="flex flex-col items-center justify-center space-y-4 my-10 animate-in fade-in slide-in-from-bottom-2 duration-500"
      aria-label="Pagination"
    >
      <div className="text-sm text-muted-foreground font-medium">
        Halaman {currentPage} dari {effectiveTotalPages} 
        {totalItems !== undefined && ` • ${totalItems} judul`}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={disablePrev}
          aria-disabled={disablePrev}
          aria-label="Halaman pertama"
          className="flex items-center justify-center p-2 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disablePrev}
          aria-disabled={disablePrev}
          aria-label="Halaman sebelumnya"
          className="flex items-center justify-center px-3 py-2 gap-1 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 py-2 text-muted-foreground select-none"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                disabled={currentPage === p}
                aria-disabled={currentPage === p}
                aria-label={`Halaman ${p}`}
                aria-current={currentPage === p ? "page" : undefined}
                className={`min-w-[40px] px-3 py-2 rounded-md transition-all duration-150 text-sm font-medium border
                  ${currentPage === p
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] cursor-default"
                    : "border-transparent bg-background hover:bg-muted text-foreground hover:border-border"
                  }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disableNext}
          aria-disabled={disableNext}
          aria-label="Halaman berikutnya"
          className="flex items-center justify-center px-3 py-2 gap-1 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline text-sm font-medium">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(effectiveTotalPages)}
          disabled={disableNext}
          aria-disabled={disableNext}
          aria-label="Halaman terakhir"
          className="flex items-center justify-center p-2 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
});

PaginationControl.displayName = "PaginationControl";
