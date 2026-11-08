import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle, Layers, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory, showToast } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subcategories: '',
    imageUrl: '',
    status: 'active'
  });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      subcategories: 'Tops, Bottoms, Outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      ...cat,
      subcategories: Array.isArray(cat.subcategories) ? cat.subcategories.join(', ') : (cat.subcategories || '')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'info');
      return;
    }

    const subcatsArray = typeof formData.subcategories === 'string'
      ? formData.subcategories.split(',').map(s => s.trim()).filter(Boolean)
      : formData.subcategories;

    const payload = {
      ...formData,
      subcategories: subcatsArray,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-')
    };

    if (editingCategory) {
      await updateCategory(payload);
    } else {
      await addCategory(payload);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteCandidate) {
      await deleteCategory(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-velora-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-velora-950">Store Categories</h3>
          <p className="text-xs text-velora-500">Organize your clothing catalog into distinct collections and subcategories</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const productCount = products.filter(
            p => p.category?.toLowerCase() === cat.name.toLowerCase()
          ).length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-velora-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Header Image */}
              <div className="relative aspect-[16/9] overflow-hidden bg-velora-100">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                  <h4 className="text-lg font-serif font-bold">{cat.name}</h4>
                  <span className="text-[11px] text-velora-300 font-medium">
                    {productCount} items linked
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-velora-400 uppercase tracking-wider block mb-2">
                    Subcategories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories && cat.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-velora-100 text-velora-800 text-xs font-medium rounded-lg"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-velora-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-velora-600 hover:text-velora-950 hover:bg-velora-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(cat)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-velora-200">
              <h3 className="text-lg font-serif font-bold text-velora-950">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-velora-400 hover:text-velora-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Formal Wear"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Blazers, Suits, Trousers"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-velora-50 border border-velora-200 text-xs focus:outline-none focus:border-velora-900 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-velora-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-velora-300 text-xs font-bold text-velora-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-velora-950 text-white text-xs font-bold uppercase tracking-wider"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-velora-950">
              Delete Category?
            </h3>
            <p className="text-xs text-velora-600">
              Are you sure you want to remove <span className="font-bold text-velora-950">"{deleteCandidate.name}"</span>?
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 rounded-xl border border-velora-300 text-xs font-bold text-velora-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
