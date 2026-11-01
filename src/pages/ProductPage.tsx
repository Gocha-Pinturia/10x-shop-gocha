import { useEffect, useState, useMemo, useId } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { fetchProductById, fetchRelatedProducts } from "../api/products.api.ts";
import { isApiError } from "../api/ApiError.ts";
import type { Product, Review } from "../types/product.ts";
import { ProductCard } from "../components/product/ProductCard.tsx";
import { Spinner } from "../components/ui/Spinner.tsx";
import { formatPrice, discountedPrice, formatDate } from "../utils/format.ts";
import { validateReview } from "../utils/validation.ts";
import { useCart } from "../context/CartContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../context/ToastContext.tsx";
import { reviewsStorage } from "../models/StorageService.ts";
import NotFoundPage from "./NotFoundPage.tsx";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const ratingSelectId = useId();
  const commentTextareaId = useId();

  // Validate ID format (must be positive integer)
  const numericId = Number(id);
  const isValidId = !isNaN(numericId) && numericId > 0 && Number.isInteger(numericId);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Local user reviews stored in localStorage
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  // Review form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Load product and reviews
  useEffect(() => {
    if (!isValidId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setQuantity(1);

    const controller = new AbortController();

    // Load stored local reviews for this product
    const allStoredReviews = reviewsStorage.get() || {};
    const storedForProduct = allStoredReviews[numericId] || [];
    setLocalReviews(storedForProduct);

    fetchProductById(numericId, controller.signal)
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.thumbnail || (data.images && data.images[0]) || "");
        setLoading(false);

        // Fetch related products from category
        if (data.category) {
          fetchRelatedProducts(data.category, numericId, controller.signal).then((related) => {
            setRelatedProducts(related);
          });
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (isApiError(err) && (err.status === 404 || err.message.includes("not found"))) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load product");
        }
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [id, numericId, isValidId]);

  // Combined reviews and average rating
  const allReviews = useMemo(() => {
    const apiReviews = product?.reviews || [];
    return [...localReviews, ...apiReviews];
  }, [product, localReviews]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return product?.rating || 0;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / allReviews.length) * 10) / 10;
  }, [allReviews, product]);

  if (!isValidId || notFound) {
    return <NotFoundPage />;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" label="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto my-12 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error loading product</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || "Product not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const finalPrice = discountedPrice(product.price, product.discountPercentage);
  const hasDiscount = product.discountPercentage >= 1;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock) return product.stock;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateReview(reviewRating, reviewComment);
    if (Object.keys(validationErrors).length > 0) {
      setReviewErrors(validationErrors);
      return;
    }

    setSubmittingReview(true);

    const reviewerName = user.isLoggedIn
      ? `${user.firstName || user.username} ${user.lastName || ""}`.trim()
      : "Guest Shopper";

    const newRev: Review = {
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString(),
      reviewerName,
    };

    // Save to localStorage
    const allStored = reviewsStorage.get() || {};
    const productReviews = allStored[numericId] || [];
    const updatedProductReviews = [newRev, ...productReviews];
    allStored[numericId] = updatedProductReviews;
    reviewsStorage.set(allStored);

    setLocalReviews(updatedProductReviews);
    setReviewComment("");
    setReviewRating(5);
    setReviewErrors({});
    setSubmittingReview(false);
    showToast("Review added ✓", "success");
  };

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.thumbnail];

  return (
    <div className="space-y-12">
      {/* Back to Catalog */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </button>
      </div>

      {/* Main Product Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={selectedImage || product.thumbnail}
              alt={product.title}
              width={600}
              height={600}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
          </div>

          {/* Thumbnails Row */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 p-2 shrink-0 transition-all overflow-hidden ${
                    selectedImage === imgUrl
                      ? "border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6">
          {/* Category & Brand Link */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {product.brand && <span>{product.brand} · </span>}
            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {product.category.replace(/-/g, " ")}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            {product.title}
          </h1>

          {/* Rating and Reviews Counter */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold border border-amber-200/60 dark:border-amber-800/60">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <button
              onClick={() => setActiveTab("reviews")}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline decoration-slate-300 font-medium"
            >
              {allReviews.length} reviews
            </button>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            {/* Stock Badge */}
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isOutOfStock
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  : isLowStock
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              }`}
            >
              {isOutOfStock ? "Out of stock" : isLowStock ? `Only ${product.stock} left!` : "In stock"}
            </span>
          </div>

          {/* Price Block */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 dark:text-slate-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  -{Math.round(product.discountPercentage)}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tax included. Free shipping on orders over $100.
            </p>
          </div>

          {/* Quantity Stepper & Add to Cart */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl p-1.5 w-full sm:w-36 min-h-[48px]">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900 dark:text-white text-base select-none px-2">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all min-h-[48px] focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                  isOutOfStock
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white shadow-lg shadow-indigo-600/25"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{isOutOfStock ? "Out of stock" : "Add to cart"}</span>
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <Truck className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Standard delivery 2–4 business days</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <RotateCcw className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Free 30-day return policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-base font-bold transition-colors relative ${
              activeTab === "description"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-base font-bold transition-colors relative flex items-center gap-2 ${
              activeTab === "reviews"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>Customer Reviews</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {allReviews.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "description" ? (
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4">
            <p>{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 not-prose text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">SKU / Item ID</span>
                <span className="font-semibold text-slate-900 dark:text-white">#{product.id}</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="text-slate-400 block mb-1">Availability</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Write a Review Section */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Write a Review</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Share your experience with other shoppers
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating Select */}
                <div>
                  <label htmlFor={ratingSelectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Rating (1-5 stars)
                  </label>
                  <select
                    id={ratingSelectId}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                  {reviewErrors.rating && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
                      {reviewErrors.rating}
                    </p>
                  )}
                </div>

                {/* Comment Textarea */}
                <div>
                  <label htmlFor={commentTextareaId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    id={commentTextareaId}
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write at least 10 characters describing quality, sizing, and usability..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  {reviewErrors.comment && (
                    <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
                      {reviewErrors.comment}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {allReviews.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                allReviews.map((rev, idx) => (
                  <div
                    key={`review-${idx}`}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {rev.reviewerName}
                        </span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={`star-${idx}-${sIdx}`}
                              className={`w-3.5 h-3.5 ${
                                sIdx < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(rev.date)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Related Products
            </h2>
            <Link
              to={`/?category=${encodeURIComponent(product.category)}`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all in {product.category.replace(/-/g, " ")} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} onAdd={addItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
