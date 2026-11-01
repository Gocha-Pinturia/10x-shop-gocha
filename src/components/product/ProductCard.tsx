import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import type { Product } from "../../types/product.ts";
import { formatPrice, discountedPrice } from "../../utils/format.ts";

export interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export const ProductCard = React.memo(function ProductCard({ product, onAdd }: ProductCardProps) {
  const finalPrice = discountedPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage >= 1;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      onAdd(product);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail area with Link */}
      <Link
        to={`/products/${product.id}`}
        className="relative block w-full aspect-square bg-slate-100 dark:bg-slate-800/60 overflow-hidden focus:outline-none"
        aria-label={`View details for ${product.title}`}
      >
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          width={300}
          height={300}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-xs">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        {/* Stock Badge */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-md ${
            isOutOfStock
              ? "bg-rose-500/90 text-white"
              : isLowStock
              ? "bg-amber-500/90 text-white"
              : "bg-slate-900/75 text-white dark:bg-slate-800/90"
          }`}
        >
          {isOutOfStock ? "Out of stock" : isLowStock ? `Only ${product.stock} left!` : "In stock"}
        </span>
      </Link>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 gap-2">
          <span className="truncate uppercase font-medium tracking-wider">
            {product.category} {product.brand ? `· ${product.brand}` : ""}
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-500 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base mb-2"
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Price and Cart Button */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatPrice(finalPrice)}
            </div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 dark:text-slate-500 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xs"
            }`}
            aria-label={isOutOfStock ? "Out of stock" : `Add ${product.title} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Out of stock" : "Add to cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
