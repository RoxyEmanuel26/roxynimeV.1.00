'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Show max 5 page numbers on mobile

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('...');
        }

        // Show pages around current
        for (
            let i = Math.max(2, currentPage - 1);
            i <= Math.min(totalPages - 1, currentPage + 1);
            i++
        ) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-full sm:w-auto btn-outline px-4 sm:px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
            >
                <span className="sm:hidden">Prev</span>
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-2 sm:px-3 py-2 text-muted-foreground text-sm sm:text-base"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={`page-${page}`}
                            onClick={() => onPageChange(page as number)}
                            className={`min-w-[36px] sm:min-w-[44px] px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${currentPage === page
                                    ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                    : 'hover:bg-muted'
                                }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto btn-outline px-4 sm:px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed order-3"
            >
                Next
            </button>
        </div>
    );
}
