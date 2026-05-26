import { useEffect, useState, useContext } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getWishlist, removeFromWishlist, moveToCart } from "../api/wishlistApi";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

const IMAGE_BASE = "http://localhost:8081";
const FALLBACK = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80";

export default function Wishlist() {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) { setLoading(false); return; }
    getWishlist(user.userId)
      .then((res) => setWishlist(res.data || { products: [] }))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist({ userId: user.userId, productId });
      setWishlist((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== productId) }));
      toast.success("Removed from wishlist");
    } catch { toast.error("Failed to remove"); }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await moveToCart({ userId: user.userId, productId });
      setWishlist((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== productId) }));
      toast.success("Moved to cart!");
    } catch { toast.error("Failed to move to cart"); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Wishlist</h1>

        {wishlist.products?.length === 0 ? (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl">
            <Heart size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm mt-1">Save products you love and buy them later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlist.products.map((product) => {
              const imgSrc = product.images?.[0]
                ? product.images[0].startsWith("http") ? product.images[0] : `${IMAGE_BASE}${product.images[0]}`
                : FALLBACK;
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img src={imgSrc} alt={product.name} className="w-full h-44 object-cover"
                    onError={(e) => { e.target.src = FALLBACK; }} />
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{product.brand}</p>
                    <p className="text-green-600 font-bold mt-1">₹{product.price?.toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleMoveToCart(product.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all">
                        <ShoppingCart size={14} /> Move to Cart
                      </button>
                      <button onClick={() => handleRemove(product.id)}
                        className="p-2 bg-red-50 text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
