import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Sports", "Books", "Beauty", "Toys"];
const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        keyword: keyword || undefined,
        category: category !== "All" ? category : undefined,
        page,
        size: PAGE_SIZE,
      };
      const res = await getProducts(params);
      let data = res.data;
      let items = data?.products || data?.content || (Array.isArray(data) ? data : []);

      if (sort === "price_asc") items = [...items].sort((a, b) => a.price - b.price);
      if (sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);

      setProducts(items);
      setTotalElements(data?.totalElements || items.length);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 350);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-green-200">
              <TrendingUp size={12} />
              AI-Powered Commerce
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3">
              Discover Your <span className="text-green-600">Perfect</span> Product
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              Curated products with intelligent search and seamless shopping.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm"
            />
            {keyword && (
              <button onClick={() => { setKeyword(""); setPage(0); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all flex-shrink-0 ${showFilters ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
              }`}>
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Category Chips (always visible) */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${category === cat ? "bg-green-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
                }`}>{cat}</button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-5 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">Sort by</p>
                <div className="flex gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setSort(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sort === opt.value ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              {(keyword || category !== "All" || sort) && (
                <button onClick={() => { setKeyword(""); setCategory("All"); setSort(""); setPage(0); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-gray-400 text-sm mb-5">
            Showing <span className="text-gray-700 font-medium">{products.length}</span> of <span className="text-gray-700 font-medium">{totalElements}</span> products
            {keyword && <> for "<span className="text-green-600 font-medium">{keyword}</span>"</>}
            {category !== "All" && <> in <span className="text-green-600 font-medium">{category}</span></>}
          </p>
        )}

        {/* Product Grid */}
        {loading ? (
          <Loader text="Loading products..." />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-gray-300 hover:text-gray-900 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = totalPages <= 7 ? i : (page < 4 ? i : (page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i));
                  return (
                    <button key={pageNum} onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === pageNum ? "bg-green-600 text-white" : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200"
                        }`}>{pageNum + 1}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-gray-300 hover:text-gray-900 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-600 text-lg font-semibold">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
            {(keyword || category !== "All") && (
              <button onClick={() => { setKeyword(""); setCategory("All"); }}
                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all">
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
