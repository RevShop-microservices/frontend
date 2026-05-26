import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";
import API from "../../api/axiosConfig";

export default function AddProductModal({ user, onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "", description: "", category: "", brand: "", price: "", stock: "", city: ""
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ["Electronics", "Fashion", "Home", "Sports", "Books", "Beauty", "Toys", "Other"];

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("product", JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sellerId: user.userId,
      }));
      Array.from(images).forEach((file) => {
        formData.append("images", file);
      });
      await API.post(`/products?sellerId=${user.userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Product added successfully!");
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {[
            { name: "name", label: "Product Name", placeholder: "e.g. Wireless Earbuds Pro" },
            { name: "brand", label: "Brand", placeholder: "e.g. Sony" },
            { name: "city", label: "City", placeholder: "e.g. Chennai" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} required placeholder={placeholder}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm transition-all" />
            </div>
          ))}

          <div>
            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Category</label>
            <select name="category" value={form.category} onChange={handleChange} required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-green-500 text-sm">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe your product..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Price (₹)</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="999"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm" />
            </div>
            <div>
              <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Stock</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required placeholder="100"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm" />
            </div>
          </div>

          <div>
            <label className="text-gray-600 text-xs font-semibold uppercase tracking-wider block mb-1.5">Product Images</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            {images.length > 0 && <p className="text-xs text-gray-500 mt-2">{images.length} file(s) selected</p>}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all mt-2">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
