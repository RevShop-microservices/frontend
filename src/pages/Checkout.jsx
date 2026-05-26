import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MapPin, ShoppingBag, ArrowRight, CreditCard, CheckCircle, Tag } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { placeOrder, buyNow } from "../api/orderApi";
import { useLocation } from "react-router-dom";
import API from "../api/axiosConfig";

export default function Checkout() {
  const { user } = useContext(AuthContext);
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowProduct = location.state?.buyNowProduct;

  const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;
  const displayTotal = buyNowProduct ? (buyNowProduct.price * buyNowProduct.quantity) : cartTotal;

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    const fetchActiveCoupons = async () => {
      setLoadingCoupons(true);
      try {
        const res = await API.get("/coupons/active");
        setActiveCoupons(res.data || []);
      } catch (err) {
        console.error("Error fetching active coupons", err);
      } finally {
        setLoadingCoupons(false);
      }
    };
    if (user?.userId) {
      fetchActiveCoupons();
    }
  }, [user]);

  const handleChange = (e) => setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleApplyCouponCode = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code || !code.trim()) { toast.error("Enter a coupon code"); return; }
    try {
      const res = await API.get(`/coupons/validate?code=${code}`);
      const coupon = res.data;
      let disc = 0;
      if (coupon.sellerId) {
        // Calculate subtotal for seller's products only
        let applicableSubtotal = 0;
        if (buyNowProduct) {
          const product = buyNowProduct.product || buyNowProduct;
          if (product.sellerId === coupon.sellerId) {
            applicableSubtotal = product.price * buyNowProduct.quantity;
          }
        } else {
          cartItems.forEach(item => {
            const product = item.product || item;
            if (product.sellerId === coupon.sellerId) {
              applicableSubtotal += product.price * item.quantity;
            }
          });
        }

        if (applicableSubtotal === 0) {
          toast.error("This coupon is only valid for products from a specific seller, which are not in your order.");
          return;
        }

        if (coupon.discountType === "PERCENTAGE") {
          disc = Math.min(applicableSubtotal, applicableSubtotal * coupon.discountValue / 100);
        } else {
          disc = Math.min(applicableSubtotal, coupon.discountValue);
        }
      } else {
        // Global coupon
        if (coupon.discountType === "PERCENTAGE") {
          disc = Math.min(displayTotal, displayTotal * coupon.discountValue / 100);
        } else {
          disc = Math.min(displayTotal, coupon.discountValue);
        }
      }

      setDiscount(disc);
      setCouponApplied(true);
      toast.success(`Coupon applied! You save ₹${disc.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  const handleApplyBestCoupon = async () => {
    if (!user?.userId) return;
    try {
      let url = `/coupons/best-deal?userId=${user.userId}`;
      if (buyNowProduct) {
        url += `&productId=${buyNowProduct.id}&quantity=${buyNowProduct.quantity}`;
      }
      const res = await API.get(url);
      if (res.status === 204 || !res.data) {
        toast.error("No applicable coupons found for this order");
        return;
      }
      const best = res.data;
      setCouponCode(best.code);
      setDiscount(best.calculatedDiscount);
      setCouponApplied(true);
      toast.success(`Applied best coupon ${best.code}! Saved ₹${best.calculatedDiscount.toLocaleString()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to find the best coupon");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.phone || !address.street || !address.city || !address.pincode) {
      toast.error("Please fill in all address fields");
      return;
    }
    setLoading(true);
    try {
      if (buyNowProduct) {
        await buyNow({
          userId: user.userId,
          productId: buyNowProduct.id,
          quantity: buyNowProduct.quantity,
          addressId: 1,
          couponCode: couponApplied ? couponCode : undefined
        });
      } else {
        await placeOrder({ userId: user.userId, addressId: 1, couponCode: couponApplied ? couponCode : undefined });
        clearCart(user?.userId);
      }
      setPlaced(true);
      toast.success("Order placed successfully!");
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
        <p className="text-gray-400">Redirecting to your orders...</p>
      </div>
    );
  }

  if (!buyNowProduct && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <ShoppingBag size={40} className="text-gray-300" />
        <p className="text-gray-500 font-medium">Your cart is empty</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <MapPin size={18} className="text-green-600" /> Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "fullName", label: "Full Name", placeholder: "John Doe" },
                    { name: "phone", label: "Phone Number", placeholder: "9876543210" },
                    { name: "street", label: "Street Address", placeholder: "123 Main St", full: true },
                    { name: "city", label: "City", placeholder: "Chennai" },
                    { name: "state", label: "State", placeholder: "Tamil Nadu" },
                    { name: "pincode", label: "PIN Code", placeholder: "600001" },
                  ].map(({ name, label, placeholder, full }) => (
                    <div key={name} className={full ? "sm:col-span-2" : ""}>
                      <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
                      <input name={name} value={address[name]} onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-green-600" /> Payment Method
                </h2>
                <div className="flex flex-col gap-3">
                  {[
                    { value: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives" },
                    { value: "CARD", label: "Credit / Debit Card", desc: "Coming soon" },
                    { value: "UPI", label: "UPI", desc: "Coming soon" },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === value ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      } ${value !== "COD" ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <input type="radio" name="payment" value={value} checked={paymentMethod === value}
                        onChange={() => value === "COD" && setPaymentMethod(value)} className="accent-green-600" />
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{label}</p>
                        <p className="text-gray-400 text-xs">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
                <div className="flex flex-col gap-3 mb-5 max-h-60 overflow-y-auto">
                  {displayItems.map((item) => {
                    const product = item.product || item;
                    return (
                      <div key={item.productId || product.id} className="flex justify-between text-sm text-gray-500 border-b border-gray-50 pb-2">
                        <span className="truncate max-w-[160px]">{product.name} ×{item.quantity}</span>
                        <span className="font-medium text-gray-700">₹{((product.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2 mb-5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span><span>₹{displayTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span><span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between text-gray-900 font-bold text-lg">
                    <span>Total</span><span>₹{(displayTotal - discount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Tag size={12} /> Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SUMMER20" disabled={couponApplied}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 text-sm" />
                    {couponApplied ? (
                      <button type="button" onClick={() => { setDiscount(0); setCouponApplied(false); setCouponCode(""); }}
                        className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100">Remove</button>
                    ) : (
                      <button type="button" onClick={() => handleApplyCouponCode(couponCode)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">Apply</button>
                    )}
                  </div>

                  {/* Best Coupon button */}
                  {!couponApplied && (
                    <button
                      type="button"
                      disabled={loadingCoupons}
                      onClick={handleApplyBestCoupon}
                      className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-60 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95"
                    >
                      🔥 Apply Best Coupon
                    </button>
                  )}

                  {/* Available Coupons list */}
                  {!couponApplied && activeCoupons.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Available Coupons (Click to apply):</p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {activeCoupons.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCouponCode(c.code);
                              handleApplyCouponCode(c.code);
                            }}
                            className="text-[11px] px-2 py-1 bg-green-50 border border-green-100 text-green-700 rounded-md hover:bg-green-100 transition-all font-semibold flex items-center gap-1 text-left"
                          >
                            <Tag size={8} />
                            <span>{c.code}</span>
                            <span className="text-[9px] font-normal text-green-600 bg-white border border-green-100 px-1 rounded ml-1">
                              {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                              {c.sellerId && ` (Seller)`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading ? "Placing Order..." : <><span>Place Order</span><ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
