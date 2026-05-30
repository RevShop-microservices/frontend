import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const IMAGE_BASE = "http://localhost:8000";
const FALLBACK = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&q=80";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-400">Add some products to get started</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2">
          Shop Now <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button onClick={() => clearCart(user?.userId)} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {cartItems.map((item) => {
              const product = item.product || item;
              const imgSrc = product.images?.[0]
                ? product.images[0].startsWith("http") ? product.images[0] : `${IMAGE_BASE}${product.images[0]}`
                : FALLBACK;
              const productId = item.productId || product.id;
              const qty = item.quantity || 1;

              return (
                <div key={productId} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <img src={imgSrc} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    onError={(e) => { e.target.src = FALLBACK; }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-semibold truncate">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{product.brand}</p>
                    <p className="text-green-600 font-bold mt-1">₹{product.price?.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(user?.userId, productId)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(user?.userId, productId, qty - 1)} className="text-gray-500 hover:text-gray-900">
                        <Minus size={14} />
                      </button>
                      <span className="text-gray-900 text-sm font-semibold w-5 text-center">{qty}</span>
                      <button onClick={() => updateQuantity(user?.userId, productId, qty + 1)} className="text-gray-500 hover:text-gray-900">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(user ? "/checkout" : "/login")}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/")} className="w-full mt-3 py-2.5 text-gray-400 hover:text-gray-700 text-sm transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
