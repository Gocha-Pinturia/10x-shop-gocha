import { useEffect, useState, useTransition, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, XCircle, RotateCcw } from "lucide-react";
import { fetchProducts, fetchCategories } from "../api/products.api.ts";
import type { Product, Category, SortOption } from "../types/product.ts";
import { ProductGrid } from "../components/product/ProductGrid.tsx";
import { Pagination } from "../components/product/Pagination.tsx";
import { ProductCardSkeleton } from "../components/ui/Skeleton.tsx";
import { useCart } from "../context/CartContext.tsx";
import { useDebounce } from "../hooks/useDebounce.ts";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const [, startTransition] = useTransition();

  // URL state
  const qParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const sortParam = (searchParams.get("sort") || "") as SortOption;
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Local state for immediate typing responsiveness in search input
  const [searchInput, setSearchInput] = useState(qParam);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);

  // Products response state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 12;

  // Load categories once
  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((cats) => {
        if (active) setCategories(cats);
      })
      .catch(() => {
        // Categories fetch fallback
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync debounced search to URL query param
  useEffect(() => {
    if (debouncedSearch.trim() !== qParam.trim()) {
      startTransition(() => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (debouncedSearch.trim()) {
            next.set("q", debouncedSearch.trim());
            next.delete("category"); // PRD: Search clears category
          } else {
            next.delete("q");
          }
          next.set("page", "1");
          return next;
        });
      });
    }
  }, [debouncedSearch, qParam, setSearchParams]);

  // Keep input in sync if URL q is altered outside (e.g., Back/Forward navigation)
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Main fetch effect using AbortController
  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    let sortBy: string | undefined = undefined;
    let order: "asc" | "desc" | undefined = undefined;

    if (sortParam === "price-asc") {
      sortBy = "price";
      order = "asc";
    } else if (sortParam === "price-desc") {
      sortBy = "price";
      order = "desc";
    } else if (sortParam === "rating-desc") {
      sortBy = "rating";
      order = "desc";
    } else if (sortParam === "title-asc") {
      sortBy = "title";
      order = "asc";
    }

    const skip = (currentPage - 1) * limit;

    fetchProducts(
      {
        q: qParam || undefined,
        category: categoryParam || undefined,
        sortBy,
        order,
        limit,
        skip,
      },
      controller.signal
    )
      .then((res) => {
        let fetchedProducts = res.products;

        // Fallback client-side sort if DummyJSON search/category endpoints ignore sorting parameters
        if (sortParam) {
          fetchedProducts = [...fetchedProducts].sort((a, b) => {
            if (sortParam === "price-asc") return a.price - b.price;
            if (sortParam === "price-desc") return b.price - a.price;
            if (sortParam === "rating-desc") return b.rating - a.rating;
            if (sortParam === "title-asc") return a.title.localeCompare(b.title);
            return 0;
          });
        }

        setProducts(fetchedProducts);
        setTotal(res.total);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Failed to load products";
        setError(message);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [qParam, categoryParam, sortParam, currentPage]);

  useEffect(() => {
    const cleanup = loadProducts();
    return cleanup;
  }, [loadProducts]);

  // Handle Category Change
  const handleCategoryChange = (cat: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (cat) {
        next.set("category", cat);
        next.delete("q"); // PRD: Category selection clears search
        setSearchInput("");
      } else {
        next.delete("category");
      }
      next.set("page", "1");
      return next;
    });
  };

  // Handle Sort Change
  const handleSortChange = (newSort: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newSort) {
        next.set("sort", newSort);
      } else {
        next.delete("sort");
      }
      next.set("page", "1");
      return next;
    });
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const totalPages = Math.ceil(total / limit);
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="space-y-6">
      {/* Header and Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse our collection of handpicked goods and daily essentials
          </p>
        </div>

        {!loading && total > 0 && (
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}–{endItem}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{total}</span>
          </div>
        )}
      </div>

      {/* Toolbar: Search, Category, Sort */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all min-h-[44px]"
            aria-label="Search products"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Clear search text"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="w-full md:w-56">
          <select
            value={categoryParam}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[44px]"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-56">
          <div className="relative">
            <select
              value={sortParam}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[44px]"
              aria-label="Sort products"
            >
              <option value="">Default sorting</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating-desc">Rating: high to low</option>
              <option value="title-asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(qParam || categoryParam || sortParam) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Active filters:</span>
          {qParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
              Query: &quot;{qParam}&quot;
            </span>
          )}
          {categoryParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-medium capitalize">
              Category: {categoryParam.replace(/-/g, " ")}
            </span>
          )}
          {sortParam && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              Sorted
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={`skeleton-${idx}`} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 my-10">
          <div className="text-rose-600 dark:text-rose-400 text-base font-semibold">
            {error}
          </div>
          <p className="text-xs text-rose-500/80">
            Please check your connection or retry fetching product listings.
          </p>
          <button
            onClick={() => loadProducts()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            We couldn&apos;t find any matching items for your search criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ProductGrid products={products} onAdd={addItem} />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
