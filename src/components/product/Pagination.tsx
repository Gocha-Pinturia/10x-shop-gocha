import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const handlePageClick = (p: number) => {
    if (p !== page && p >= 1 && p <= totalPages) {
      onChange(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Catalog Pagination">
      {/* Previous Button */}
      <button
        onClick={() => handlePageClick(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Numbered Buttons */}
      {getPageNumbers().map((item, idx) => {
        if (item === "...") {
          return (
            <span
              key={`dots-${idx}`}
              className="px-2 text-slate-400 dark:text-slate-600 font-bold select-none"
            >
              ...
            </span>
          );
        }

        const pageNum = Number(item);
        const isActive = pageNum === page;

        return (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            className={`min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => handlePageClick(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}
