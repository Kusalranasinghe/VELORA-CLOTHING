import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Search,
  Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const { products, categories, settings } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL or State
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [priceRange, setPriceRange] = useState(15000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Sync state if URL query changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const search = searchParams.get('search');
    if (search !== null) setSearchTerm(search);
  }, [searchParams]);

  // Available subcategories for current category
  const currentCategoryObj = categories.find(
    c => c.name.toLowerCase() === selectedCategory.toLowerCase()
  );
  const availableSubcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];

  // Reset subcategory if category changes
  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubcategory('All');
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSelectedSize('All');
    setPriceRange(15000);
    setInStockOnly(false);
    setDiscountOnly(false);
    setSortBy('featured');
    setSearchTerm('');
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(query);
        const matchesCat = p.category?.toLowerCase().includes(query);
        const matchesSubcat = p.subcategory?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesSubcat && !matchesDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Subcategory
      if (selectedSubcategory !== 'All' && p.subcategory?.toLowerCase() !== selectedSubcategory.toLowerCase()) {
        return false;
      }

      // Size
      if (selectedSize !== 'All') {
        if (!p.sizes || !p.sizes.includes(selectedSize)) return false;
      }

      // Price
      const finalPrice = p.discountedPrice || p.originalPrice;
      if (finalPrice > priceRange) return false;

      // Stock
      if (inStockOnly && Number(p.stockQuantity) <= 0) return false;

      // Discounted only
      if (discountOnly && (!p.discountPercent || Number(p.discountPercent) <= 0)) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.discountedPrice || a.originalPrice;
      const priceB = b.discountedPrice || b.originalPrice;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'discount') return (b.discountPercent || 0) - (a.discountPercent || 0);
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0; // 'featured' keeps original order
    });
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedSize, priceRange, inStockOnly, discountOnly, sortBy]);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '40', '41', '42'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-velora-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-widest text-velora-500 uppercase">VELORA Wardrobe</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-velora-950 mt-1">
            {selectedCategory === 'All' ? 'All Clothing & Apparel' : `${selectedCategory} Collection`}
          </h1>
          <p className="text-xs sm:text-sm text-velora-500 mt-1">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-velora-300 text-xs font-bold text-velora-900 shadow-sm"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-velora-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold bg-white border border-velora-300 rounded-xl focus:outline-none focus:border-velora-600 text-velora-900 shadow-sm"
            >
              <option value="featured">Featured Collection</option>
              <option value="newest">New Arrivals First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-velora-200/90 shadow-sm space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-4 border-b border-velora-100">
              <span className="text-xs font-bold tracking-wider uppercase text-velora-950 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filter Catalog
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-velora-500 hover:text-velora-900 flex items-center gap-1 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-2">
                Keywords
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Linen, Oversized..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-velora-50 border border-velora-200 focus:outline-none focus:border-velora-500"
                />
                <Search className="w-3.5 h-3.5 text-velora-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Main Categories */}
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'All' ? 'bg-velora-950 text-white' : 'text-velora-700 hover:bg-velora-100'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedCategory === cat.name ? 'bg-velora-950 text-white' : 'text-velora-700 hover:bg-velora-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories (if selected category has subcategories) */}
            {availableSubcategories && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-2">
                  Subcategory
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedSubcategory('All')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedSubcategory === 'All' ? 'bg-velora-800 text-white' : 'bg-velora-100 text-velora-700 hover:bg-velora-200'
                    }`}
                  >
                    All
                  </button>
                  {availableSubcategories.map((sub, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedSubcategory === sub ? 'bg-velora-800 text-white' : 'bg-velora-100 text-velora-700 hover:bg-velora-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div>
              <label className="block text-xs font-bold text-velora-800 uppercase tracking-wider mb-2">
                Available Size
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('All')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                    selectedSize === 'All' ? 'bg-velora-950 text-white border-velora-950' : 'bg-white text-velora-700 border-velora-200 hover:border-velora-400'
                  }`}
                >
                  All
                </button>
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                      selectedSize === s ? 'bg-velora-950 text-white border-velora-950' : 'bg-white text-velora-700 border-velora-200 hover:border-velora-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-velora-800 uppercase tracking-wider">
                  Max Price
                </label>
                <span className="text-xs font-bold text-velora-950">
                  {settings.currency} {priceRange.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-velora-950 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-velora-400 mt-1">
                <span>Rs. 1,000</span>
                <span>Rs. 15,000</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-velora-100">
              <label className="flex items-center gap-2.5 text-xs font-medium text-velora-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-velora-950 focus:ring-0 accent-velora-950"
                />
                <span>In Stock items only</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-velora-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="rounded text-velora-950 focus:ring-0 accent-velora-950"
                />
                <span>Discounted Deals only</span>
              </label>
            </div>

          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-velora-200 shadow-sm max-w-md mx-auto my-10">
              <div className="w-16 h-16 rounded-full bg-velora-100 text-velora-400 mx-auto flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-velora-900 mb-1">
                No matching apparel found
              </h3>
              <p className="text-xs text-velora-500 mb-6 leading-relaxed">
                We couldn't find any products matching your active filters. Try adjusting price range, size, or clearing filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-velora-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-velora-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-velora-100">
              <span className="font-serif font-bold text-lg text-velora-950">Filters</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-velora-400 hover:text-velora-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-velora-900 uppercase mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    selectedCategory === 'All' ? 'bg-velora-950 text-white' : 'text-velora-700 hover:bg-velora-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      selectedCategory === cat.name ? 'bg-velora-950 text-white' : 'text-velora-700 hover:bg-velora-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Max Price</span>
                <span>Rs. {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-velora-950"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-3 border-t border-velora-100">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 rounded-xl border border-velora-300 text-xs font-bold text-velora-700"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-velora-950 text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
