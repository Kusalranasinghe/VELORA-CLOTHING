import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Package,
  TrendingDown,
  Sparkles,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPrice, calculateDiscountedPrice } from '../utils/whatsapp';

export default function AdminProducts() {
  const { products, categories, settings, addProduct, updateProduct, deleteProduct, showToast } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Delete confirm modal state
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    originalPrice: '',
    discountPercent: 0,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White'],
    stockQuantity: 20,
    imageUrl: '',
    additionalImages: '',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    status: 'active'
  });

  const availableSizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '40', '41', '42'];

  // Metrics
  const totalProducts = products.length;
  const inStockCount = products.filter(p => Number(p.stockQuantity) > 5).length;
  const lowStockCount = products.filter(p => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= 5).length;
  const outOfStockCount = products.filter(p => Number(p.stockQuantity) <= 0).length;
  const discountedCount = products.filter(p => Number(p.discountPercent) > 0).length;

  // Filtered products
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.subcategory && p.subcategory.toLowerCase().includes(q));
    }
    return true;
  });

  // Open modal for new product
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.name || 'Men',
      subcategory: categories[0]?.subcategories?.[0] || 'T-Shirts',
      description: '',
      originalPrice: 3000,
      discountPercent: 10,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White'],
      stockQuantity: 25,
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      additionalImages: '',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      originalPrice: prod.originalPrice || 0,
      discountPercent: prod.discountPercent || 0,
      sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
      colors: Array.isArray(prod.colors) ? prod.colors : [],
      additionalImages: prod.additionalImages || ''
    });
    setIsModalOpen(true);
  };

  const handleToggleSize = (size) => {
    setFormData(prev => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
      };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required', 'info');
      return;
    }

    const payload = {
      ...formData,
      originalPrice: Number(formData.originalPrice) || 0,
      discountPercent: Number(formData.discountPercent) || 0,
      discountedPrice: calculateDiscountedPrice(formData.originalPrice, formData.discountPercent),
      stockQuantity: Number(formData.stockQuantity) || 0
    };

    try {
      if (editingProduct) {
        await updateProduct(payload);
      } else {
        await addProduct(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast(error.message || 'Could not save product.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (deleteCandidate) {
      try {
        await deleteProduct(deleteCandidate.id);
        setDeleteCandidate(null);
      } catch (error) {
        showToast(error.message || 'Could not delete product.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-velora-200 shadow-sm">
          <span className="text-[11px] font-bold text-velora-500 uppercase tracking-wider">Total Products</span>
          <p className="text-2xl font-serif font-black text-velora-950 mt-1">{totalProducts}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-velora-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">In Stock</span>
          <p className="text-2xl font-serif font-black text-emerald-700 mt-1">{inStockCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-velora-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Low Stock (&le;5)</span>
          <p className="text-2xl font-serif font-black text-amber-700 mt-1">{lowStockCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-velora-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Out of Stock</span>
          <p className="text-2xl font-serif font-black text-rose-700 mt-1">{outOfStockCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-velora-200 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">On Discount</span>
          <p className="text-2xl font-serif font-black text-indigo-700 mt-1">{discountedCount}</p>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-velora-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 w-full md:w-auto items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-950"
            />
            <Search className="w-4 h-4 text-velora-400 absolute left-3 top-2.5" />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-velora-50 border border-velora-200 rounded-xl focus:outline-none text-velora-800 font-semibold"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Add Product Button */}
        <button
          onClick={handleOpenAdd}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-velora-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-velora-50 border-b border-velora-200 text-velora-600 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price & Discount</th>
                <th className="py-3.5 px-4">Sizes</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velora-100">
              {filteredProducts.map((p) => {
                const orig = Number(p.originalPrice) || 0;
                const disc = Number(p.discountPercent) || 0;
                const finalP = p.discountedPrice || calculateDiscountedPrice(orig, disc);
                const stock = Number(p.stockQuantity) || 0;

                return (
                  <tr key={p.id} className="hover:bg-velora-50/60 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded-lg bg-velora-100 border border-velora-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-velora-900 truncate max-w-[200px]">{p.name}</p>
                          <span className="text-[10px] text-velora-400 font-mono">#{p.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-velora-800">{p.category}</span>
                      {p.subcategory && (
                        <p className="text-[11px] text-velora-500">{p.subcategory}</p>
                      )}
                    </td>

                    {/* Price & Discount */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-velora-950">{formatPrice(finalP, settings.currency)}</p>
                      {disc > 0 && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-velora-400 line-through">
                            {formatPrice(orig, settings.currency)}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 rounded">
                            -{disc}%
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sizes */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {p.sizes && p.sizes.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-velora-100 text-velora-700 rounded text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      {stock <= 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                          Out of stock
                        </span>
                      ) : stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Low: {stock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {stock} in stock
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-velora-600 hover:text-velora-950 hover:bg-velora-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(p)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-velora-200">
              <h3 className="text-xl font-serif font-bold text-velora-950">
                {editingProduct ? 'Edit Clothing Product' : 'Add New Clothing Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-velora-400 hover:text-velora-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Blend Tailored Chino Trousers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const catObj = categories.find(c => c.name === newCat);
                      setFormData({
                        ...formData,
                        category: newCat,
                        subcategory: catObj?.subcategories?.[0] || ''
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. T-Shirts, Dresses..."
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
                  />
                </div>
              </div>

              {/* Price, Discount & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                    Original Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="3000"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                    Discount % (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                    Final Price (Calculated)
                  </label>
                  <div className="w-full px-4 py-2.5 rounded-xl bg-velora-100 border border-velora-200 text-xs font-black text-velora-950 flex items-center">
                    Rs. {calculateDiscountedPrice(formData.originalPrice, formData.discountPercent).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Stock Quantity (Available Inventory) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-bold"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizesOptions.map(s => {
                    const isSelected = formData.sizes.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => handleToggleSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected ? 'bg-velora-950 text-white border-velora-950' : 'bg-white text-velora-700 border-velora-200 hover:border-velora-400'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Colors (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Black, White, Olive Green"
                  value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Product Image URL (Direct URL or Cloudinary URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-mono text-[11px]"
                />
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-12 h-14 object-cover rounded-lg border border-velora-200"
                    />
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Image preview loaded
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Product material, cut, care instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 resize-none"
                ></textarea>
              </div>

              {/* Promotional Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-velora-100">
                <label className="flex items-center gap-2 text-xs font-medium text-velora-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-velora-950 focus:ring-0 accent-velora-950"
                  />
                  <span>Featured Collection</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-velora-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNewArrival}
                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                    className="rounded text-velora-950 focus:ring-0 accent-velora-950"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-velora-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="rounded text-velora-950 focus:ring-0 accent-velora-950"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-velora-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-velora-300 text-xs font-bold text-velora-700 hover:bg-velora-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all shadow-md"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-velora-950">
              Confirm Deletion
            </h3>
            <p className="text-xs text-velora-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-velora-950">"{deleteCandidate.name}"</span>? This will permanently remove the item from the catalog and Google Sheets.
            </p>
            <div className="pt-3 flex gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-velora-300 text-xs font-bold text-velora-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
