import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Scale, ShoppingCart, Heart, ArrowLeft, Check, X, ChevronDown } from "lucide-react";
import { getProducts, getProductById } from "../api/productApi";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";

const IMAGE_BASE = "http://localhost:8000";
const FALLBACK = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&q=80";

function getImg(product) {
  const img = product?.images?.[0];
  return img ? (img.startsWith("http") ? img : `${IMAGE_BASE}${img}`) : FALLBACK;
}

const COMPARE_FIELDS = [
  { key: "price", label: "Price", format: v => `₹${v?.toLocaleString("en-IN")}` },
  { key: "brand", label: "Brand" },
  { key: "category", label: "Category" },
  { key: "stock", label: "Stock", format: v => v > 0 ? `${v} available` : "Out of stock" },
  { key: "description", label: "Description", multiline: true },
];

export default function ProductCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([null, null]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState(["", ""]);
  const [loading, setLoading] = useState([false, false]);
  const { addToCart } = useCart();

  // Pre-load from URL params (?id1=...&id2=...)
  useEffect(() => {
    const ids = [searchParams.get("id1"), searchParams.get("id2")];
    ids.forEach((id, i) => {
      if (id) loadProduct(id, i);
    });
    getProducts()
      .then(r => {
        console.log("PRODUCT RESPONSE:", r.data);

        const products =
          r.data?.products ||
          r.data?.content ||
          r.data?.data?.content ||
          r.data?.data ||
          [];

        setAllProducts(Array.isArray(products) ? products : []);
      })
      .catch(() => {
        setAllProducts([]);
      });

  }, []);

  const loadProduct = async (id, slot) => {
    setLoading(prev => { const a = [...prev]; a[slot] = true; return a; });
    try {
      const res = await getProductById(id, null);
      setProducts(prev => { const a = [...prev]; a[slot] = res.data; return a; });
    } catch {
      toast.error("Product not found");
    } finally {
      setLoading(prev => { const a = [...prev]; a[slot] = false; return a; });
    }
  };

  const selectProduct = (product, slot) => {
    setProducts(prev => { const a = [...prev]; a[slot] = product; return a; });
    setSearch(prev => { const a = [...prev]; a[slot] = ""; return a; });
  };

  const clearSlot = slot => {
    setProducts(prev => { const a = [...prev]; a[slot] = null; return a; });
  };

  const filteredFor = slot => {
    const q = search[slot].toLowerCase();
    if (!q) return allProducts.slice(0, 8);
    return allProducts
      .filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  };

  // Which slot has the better price?
  const cheaperSlot = () => {
    const [p1, p2] = products;
    if (!p1 || !p2) return null;
    return p1.price <= p2.price ? 0 : 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <Scale size={22} className="text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">Product Comparison</h1>
          <span className="text-sm text-gray-500 ml-2">Side-by-side comparison</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Product selectors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[0, 1].map(slot => (
            <div key={slot} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {products[slot] ? (
                <div>
                  <div className="relative">
                    <img
                      src={getImg(products[slot])}
                      alt={products[slot].name}
                      onError={e => { e.target.src = FALLBACK; }}
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                    <button
                      onClick={() => clearSlot(slot)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                    {cheaperSlot() === slot && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        Better Value
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{products[slot].name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{products[slot].brand} · {products[slot].category}</p>
                    <p className="text-xl font-bold text-green-600 mt-2">
                      ₹{products[slot].price?.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-2 mt-3">
                      {products[slot].stock > 0 ? (
                        <button
                          onClick={() => addToCart({ product: products[slot], quantity: 1 })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl font-medium transition-colors"
                        >
                          <ShoppingCart size={13} /> Add to Cart
                        </button>
                      ) : (
                        <span className="flex-1 text-center py-2 bg-gray-100 text-gray-500 text-xs rounded-xl">Out of Stock</span>
                      )}
                      <button
                        onClick={() => navigate(`/products/${products[slot].id}`)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="w-full h-48 bg-gray-50 rounded-xl flex flex-col items-center justify-center mb-4 border-2 border-dashed border-gray-200">
                    <Scale size={28} className="text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">Select Product {slot + 1}</p>
                  </div>
                  <input
                    type="text"
                    value={search[slot]}
                    onChange={e => setSearch(prev => { const a = [...prev]; a[slot] = e.target.value; return a; })}
                    placeholder="Search products to compare..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                  {search[slot] && (
                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                      {filteredFor(slot).map(p => (
                        <button
                          key={p.id}
                          onClick={() => selectProduct(p, slot)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
                        >
                          <img src={getImg(p)} alt={p.name} onError={e => { e.target.src = FALLBACK; }}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-50" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-green-600 font-semibold">₹{p.price?.toLocaleString("en-IN")}</p>
                          </div>
                        </button>
                      ))}
                      {filteredFor(slot).length === 0 && (
                        <p className="text-xs text-gray-400 p-3 text-center">No products found</p>
                      )}
                    </div>
                  )}
                  {!search[slot] && (
                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                      {allProducts.filter(p => p.id !== products[slot === 0 ? 1 : 0]?.id).slice(0, 8).map(p => (
                        <button
                          key={p.id}
                          onClick={() => selectProduct(p, slot)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-green-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
                        >
                          <img src={getImg(p)} alt={p.name} onError={e => { e.target.src = FALLBACK; }}
                            className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-50" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-green-600 font-semibold">₹{p.price?.toLocaleString("en-IN")}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison table */}
        {products[0] && products[1] && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Detailed Comparison</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {COMPARE_FIELDS.map(field => {
                const v1 = products[0][field.key];
                const v2 = products[1][field.key];
                const display = v => field.format ? field.format(v) : v;

                // Highlight lower price
                const highlight = field.key === "price"
                  ? [v1 <= v2, v1 >= v2]
                  : [false, false];

                return (
                  <div key={field.key} className="grid grid-cols-3 items-start">
                    <div className="px-6 py-4 bg-gray-50 border-r border-gray-100">
                      <p className="text-sm font-medium text-gray-600">{field.label}</p>
                    </div>
                    {[0, 1].map(slot => (
                      <div key={slot} className={`px-6 py-4 ${highlight[slot] ? "bg-green-50" : ""} ${slot === 0 ? "border-r border-gray-100" : ""}`}>
                        <p className={`text-sm ${field.multiline ? "text-gray-600 line-clamp-3" : "font-medium text-gray-900"} ${highlight[slot] ? "text-green-700 font-bold" : ""}`}>
                          {display(products[slot][field.key]) || "—"}
                        </p>
                        {highlight[slot] && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 font-medium mt-0.5">
                            <Check size={10} /> Better price
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Tags row */}
            {(products[0].tags?.length > 0 || products[1].tags?.length > 0) && (
              <div className="grid grid-cols-3 items-start border-t border-gray-100">
                <div className="px-6 py-4 bg-gray-50 border-r border-gray-100">
                  <p className="text-sm font-medium text-gray-600">Tags</p>
                </div>
                {[0, 1].map(slot => (
                  <div key={slot} className={`px-6 py-4 ${slot === 0 ? "border-r border-gray-100" : ""}`}>
                    <div className="flex flex-wrap gap-1">
                      {(products[slot].tags || []).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{t}</span>
                      ))}
                      {!products[slot].tags?.length && <span className="text-sm text-gray-400">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(!products[0] || !products[1]) && (
          <div className="text-center py-12 text-gray-400">
            <Scale size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select two products above to see a detailed comparison</p>
          </div>
        )}
      </div>
    </div>
  );
}