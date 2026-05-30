import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, X, Send, Minimize2, Maximize2, Sparkles,
  Search, Scale, Star, Tag, ShoppingCart, Package,
  TrendingUp, ChevronRight, AlertCircle
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import API from "../api/axiosConfig";

const IMAGE_BASE = "http://localhost:8000";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&q=70";

const SUGGESTIONS = [
  { icon: "🔍", text: "Find me wireless earbuds" },
  { icon: "⚖️", text: "Compare iPhone and Samsung" },
  { icon: "💰", text: "Best laptops under ₹50000" },
  { icon: "🏆", text: "Recommend best gaming mouse" },
  { icon: "📦", text: "Browse electronics category" },
  { icon: "⭐", text: "Summarize headphone reviews" },
];

const INTENT_META = {
  SEARCH: { icon: <Search size={12} />, label: "Search", color: "blue" },
  COMPARE: { icon: <Scale size={12} />, label: "Compare", color: "purple" },
  SUMMARY: { icon: <Star size={12} />, label: "Reviews", color: "yellow" },
  RECOMMEND: { icon: <TrendingUp size={12} />, label: "Top Picks", color: "green" },
  PRICE_FILTER: { icon: <Tag size={12} />, label: "Budget", color: "teal" },
  CATEGORY_BROWSE: { icon: <Package size={12} />, label: "Browse", color: "indigo" },
  ORDER_HELP: { icon: <ShoppingCart size={12} />, label: "Orders", color: "orange" },
  GREET: { icon: <Sparkles size={12} />, label: "Hello", color: "pink" },
  UNKNOWN: { icon: <Bot size={12} />, label: "AI", color: "gray" },
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ProductCard({ product, navigate, addToCart }) {
  const img = product.images?.[0]
    ? (product.images[0].startsWith("http") ? product.images[0] : `${IMAGE_BASE}${product.images[0]}`)
    : FALLBACK_IMG;

  return (
    <div className="flex gap-2.5 bg-white border border-gray-100 rounded-xl p-2.5 hover:border-green-300 hover:shadow-sm transition-all group">
      <img
        src={img}
        alt={product.name}
        onError={e => { e.target.src = FALLBACK_IMG; }}
        className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-50"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 leading-tight truncate group-hover:text-green-700">
          {product.name}
        </p>
        {product.brand && (
          <p className="text-[10px] text-gray-400 mt-0.5">{product.brand} · {product.category}</p>
        )}
        <p className="text-sm font-bold text-green-600 mt-1">₹{product.price?.toLocaleString("en-IN")}</p>
        {product.stock === 0 && (
          <p className="text-[10px] text-red-500 font-medium">Out of stock</p>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={() => navigate(`/products/${product.id}`)}
          className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          View
        </button>
        {product.stock > 0 && (
          <button
            onClick={() => addToCart && addToCart({ product, quantity: 1 })}
            className="text-[10px] px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

function CompareView({ compareResult, navigate }) {
  const { product1: p1, product2: p2, winner, reasoning } = compareResult;
  if (!p1 || !p2) return null;

  const imgFor = p => {
    const img = p.images?.[0];
    return img ? (img.startsWith("http") ? img : `${IMAGE_BASE}${img}`) : FALLBACK_IMG;
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {[p1, p2].map(p => (
          <div
            key={p.id}
            className={`border rounded-xl p-2.5 text-center ${winner === p.name ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}
          >
            {winner === p.name && (
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                ✓ Better Value
              </span>
            )}
            <img src={imgFor(p)} alt={p.name} onError={e => { e.target.src = FALLBACK_IMG; }}
              className="w-12 h-12 object-cover rounded-lg mx-auto mt-1.5 mb-1.5" />
            <p className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2">{p.name}</p>
            <p className="text-xs font-bold text-green-600 mt-1">₹{p.price?.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-gray-400">{p.brand}</p>
            <button
              onClick={() => navigate(`/products/${p.id}`)}
              className="mt-1.5 w-full text-[10px] py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Attribute comparison */}
      <div className="bg-gray-50 rounded-xl p-2.5 text-[11px]">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left font-medium pb-1">Feature</th>
              <th className="text-center font-medium pb-1 truncate max-w-[60px]">{p1.name.split(" ")[0]}</th>
              <th className="text-center font-medium pb-1 truncate max-w-[60px]">{p2.name.split(" ")[0]}</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {[
              { label: "Price", v1: `₹${p1.price?.toLocaleString("en-IN")}`, v2: `₹${p2.price?.toLocaleString("en-IN")}` },
              { label: "Brand", v1: p1.brand, v2: p2.brand },
              { label: "Category", v1: p1.category, v2: p2.category },
              { label: "Stock", v1: p1.stock > 0 ? "✅ In Stock" : "❌ OOS", v2: p2.stock > 0 ? "✅ In Stock" : "❌ OOS" },
            ].map(row => (
              <tr key={row.label} className="border-t border-gray-200">
                <td className="py-1 text-gray-500">{row.label}</td>
                <td className="py-1 text-center text-gray-800">{row.v1 || "—"}</td>
                <td className="py-1 text-center text-gray-800">{row.v2 || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BotMessage({ msg, navigate, addToCart }) {
  const meta = INTENT_META[msg.intent] || INTENT_META.UNKNOWN;

  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
        <Bot size={13} className="text-green-700" />
      </div>
      <div className="max-w-[85%]">
        {/* Intent badge */}
        {msg.intent && msg.intent !== "GREET" && (
          <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mb-1.5 bg-${meta.color}-50 text-${meta.color}-600 border border-${meta.color}-200`}>
            {meta.icon} {meta.label}
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-line ${msg.error ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-800"}`}>
          {msg.text}
        </div>

        {/* Compare view */}
        {msg.compareResult && (
          <div className="mt-2 w-full">
            <CompareView compareResult={msg.compareResult} navigate={navigate} />
          </div>
        )}

        {/* LLM Summary */}
        {msg.llmSummary && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-900 leading-relaxed">
            <div className="flex items-center gap-1 mb-1 text-amber-600 font-semibold text-[10px]">
              <Sparkles size={10} /> AI Analysis
            </div>
            {msg.llmSummary}
          </div>
        )}

        {/* Product cards */}
        {msg.products && msg.products.length > 0 && (
          <div className="mt-2 space-y-1.5 w-full">
            {msg.products.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIChatBot() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      intent: "GREET",
      text: "👋 Hi! I'm **NexShop AI** — your smart shopping assistant!\n\nI can search products, compare items, filter by budget, recommend top picks, and more.\n\nWhat are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const userId = user?.userId || 0;
      const res = await API.post(`/ai/query?userId=${userId}`, query, {
        headers: { "Content-Type": "text/plain" },
      });

      const data = res.data; // AIResponseDTO

      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          intent: data.intent,
          text: data.message || "",
          products: data.products || [],
          compareResult: data.compareResult || null,
          llmSummary: data.llmSummary || null,
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          intent: "UNKNOWN",
          text: "⚠️ AI service unavailable. Make sure the backend is running and Ollama is installed.\n\nRun: `ollama pull phi3:mini`",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "bot",
      intent: "GREET",
      text: "Chat cleared! How can I help you? 😊",
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
        >
          <Bot size={24} />
          <span className="absolute -top-10 right-0 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask AI Assistant
          </span>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col transition-all ${minimized ? "w-72 h-14" : "w-80 sm:w-96 h-[580px]"}`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">NexShop AI</p>
                {!minimized && (
                  <p className="text-green-100 text-xs flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-yellow-300 animate-pulse" : "bg-green-300"}`}></span>
                    {loading ? "Thinking..." : "Powered by phi3:mini"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!minimized && (
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all text-[10px] font-medium px-2"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              >
                {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[78%] px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-green-600 text-white">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <BotMessage
                        msg={msg}
                        navigate={navigate}
                        addToCart={addToCart}
                      />
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot size={13} className="text-green-700" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* Suggestion chips — show only at start */}
                {messages.length === 1 && !loading && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <p className="text-gray-400 text-xs font-medium">Try asking:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s.text}
                          onClick={() => sendMessage(s.text)}
                          className="text-left text-[11px] px-2.5 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-colors leading-tight"
                        >
                          {s.icon} {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-100 pt-2">
                <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about any product..."
                    className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 outline-none resize-none max-h-20"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white flex items-center justify-center flex-shrink-0 transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
                <p className="text-gray-400 text-[10px] text-center mt-1.5">
                  NexShop AI · phi3:mini (3.8B) · Ollama
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
