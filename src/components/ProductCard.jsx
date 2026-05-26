import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, Scale } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { addToWishlist } from "../api/wishlistApi";

const IMAGE_BASE = "http://localhost:8000";

const CATEGORY_FALLBACKS = {
  Electronics: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75",
  Fashion: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=75",
  Home: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=75",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=75",
  Books: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=75",
  Beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=75",
  Toys: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=75",
  "Health & Wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=75",
  Food: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=75",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=75",
};

function getFallback(category) {
  if (!category) return CATEGORY_FALLBACKS.default;
  const exact = CATEGORY_FALLBACKS[category];
  if (exact) return exact;
  const key = Object.keys(CATEGORY_FALLBACKS).find(
    (k) =>
      k.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_FALLBACKS[key] : CATEGORY_FALLBACKS.default;
}

function getImageSrc(product) {
  const raw = product.images?.[0];
  if (!raw || raw.trim() === "") return getFallback(product.category);
  if (raw.startsWith("http")) return raw;
  return `${IMAGE_BASE}${raw}`;
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imgSrc = imgError ? getFallback(product.category) : getImageSrc(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Redirect to login if not authenticated
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    addToCart(user.userId, product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to save to wishlist");
      navigate("/login");
      return;
    }
    if (wishlisted) return;
    try {
      await addToWishlist({ userId: user.userId, productId: product.id });
      setWishlisted(true);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="relative overflow-hidden bg-gray-50 h-48">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 ${wishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
          >
            <Heart size={14} className={wishlisted ? "fill-red-500" : ""} />
          </button>
        </div>
        {product.category && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-medium bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
              {product.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-400 mb-0.5">{product.brand}</p>
        <h3 className="text-gray-900 font-semibold text-sm leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={11}
              className={
                s <= Math.round(product.averageRating || 0)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200"
              }
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); navigate(`/compare?id1=${product.id}`); }}
              title="Compare"
              className="p-1.5 border border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-lg transition-all"
            >
              <Scale size={13} className="text-gray-500 hover:text-green-600" />
            </button>
            {user?.role !== "SELLER" && user?.role !== "ADMIN" && (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold rounded-lg transition-all"
              >
                <ShoppingCart size={13} /> Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}