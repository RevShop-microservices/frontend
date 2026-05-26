import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, ArrowLeft, Package, Tag, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { getProductById } from "../api/productApi";
import { getReviews, getRating, addReview } from "../api/reviewApi";
import { addToWishlist } from "../api/wishlistApi";
import { checkPurchase } from "../api/orderApi";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import RatingStars from "../components/RatingStars";
import Loader from "../components/Loader";

const IMAGE_BASE = "http://localhost:8081";
const FALLBACK = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // userId is optional param
        const res = user?.userId
          ? await getProductById(id, user.userId)
          : await getProductById(id, null);
        const p = res.data;
        setProduct(p);
        const img = p.images?.[0];
        setMainImage(img ? (img.startsWith("http") ? img : `${IMAGE_BASE}${img}`) : FALLBACK);
      } catch {
        toast.error("Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  useEffect(() => {
    getReviews(id).then((r) => setReviews(r.data || [])).catch(() => { });
    getRating(id).then((r) => setAvgRating(r.data?.averageRating || r.data || 0)).catch(() => { });

    if (user && user.role === "CUSTOMER") {
      checkPurchase(id, user.userId).then((r) => setCanReview(r.data)).catch(() => setCanReview(false));
    }
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(user?.userId, product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }
    navigate("/checkout", { state: { buyNowProduct: { ...product, quantity: 1 } } });
  };

  const handleWishlist = async () => {
    if (!user) { toast.error("Login to save wishlist"); return; }
    try {
      await addToWishlist({ userId: user.userId, productId: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Login to review"); return; }
    setSubmitting(true);
    try {
      await addReview({ productId: id, userId: user.userId, rating: reviewRating, comment: reviewText });
      toast.success("Review submitted!");
      setReviewText("");
      const r = await getReviews(id);
      setReviews(r.data || []);
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;
  if (!product) return null;

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 aspect-square mb-3 shadow-sm">
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-6" onError={(e) => { e.target.src = FALLBACK; }} />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => {
                  const src = img.startsWith("http") ? img : `${IMAGE_BASE}${img}`;
                  return (
                    <button key={i} onClick={() => setMainImage(src)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${mainImage === src ? "border-green-500" : "border-gray-200"}`}>
                      <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK; }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">{product.category}</span>
              <span className="text-gray-400 text-xs">{product.brand}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={Math.round(avgRating)} />
              <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-6">₹{product.price?.toLocaleString()}</div>
            <p className="text-gray-500 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <Package size={16} className={product.stock > 0 ? "text-green-600" : "text-red-500"} />
              <span className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5 font-semibold">
                  <Tag size={12} /> Specifications
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-gray-400 text-xs">{k}</span>
                      <p className="text-gray-800 text-sm font-semibold">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all">
                Buy Now
              </button>
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={handleWishlist}
                className={`p-3.5 rounded-xl border transition-all shadow-sm ${wishlisted ? "bg-red-50 border-red-300 text-red-500" : "bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}>
                <Heart size={20} className={wishlisted ? "fill-red-500" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {canReview && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-gray-900 font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onClick={() => setReviewRating(s)}>
                        <Star size={22} className={s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..." rows={4} required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none mb-4" />
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {reviews.length > 0 ? reviews.map((r, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                      {(r.userId || "U").toString()[0].toUpperCase()}
                    </div>
                    <RatingStars rating={r.rating} size={14} />
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
                </div>
              )) : (
                <div className="text-gray-400 text-sm py-8 text-center">No reviews yet. Be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
