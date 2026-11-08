import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  Shield,
  ShoppingBag,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/whatsapp';

export default function Navbar() {
  const { products, settings, wishlist, searchQuery, setSearchQuery } = useShop();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Live search preview results (up to 5 items)
  const searchResults = searchQuery.trim().length > 1
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-velora-200 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-velora-950 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">
              {settings.heroTitle || 'NEW COLLECTION 2026'} – Direct WhatsApp Ordering
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-velora-300">
            <span>{settings.deliveryNote || 'Islandwide Delivery Available'}</span>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 hover:text-white transition-colors text-velora-400 font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Admin Dashboard' : 'Admin Login'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-velora-700 hover:text-velora-950 hover:bg-velora-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex flex-col items-center group">
            <span className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-velora-950 group-hover:text-velora-800 transition-colors">
              VELORA
            </span>
            <span className="text-[10px] tracking-[0.3em] font-medium text-velora-500 uppercase -mt-1 group-hover:tracking-[0.35em] transition-all">
              CLOTHING
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/' ? 'text-velora-950 font-bold' : 'text-velora-600 hover:text-velora-950'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/shop"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/shop' ? 'text-velora-950 font-bold' : 'text-velora-600 hover:text-velora-950'
              }`}
            >
              SHOP
            </Link>
            <Link
              to="/categories"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/categories' ? 'text-velora-950 font-bold' : 'text-velora-600 hover:text-velora-950'
              }`}
            >
              CATEGORIES
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-semibold tracking-wide transition-colors ${
                location.pathname === '/contact' ? 'text-velora-950 font-bold' : 'text-velora-600 hover:text-velora-950'
              }`}
            >
              CONTACT
            </Link>
          </nav>

          {/* Right Action Icons & Live Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Input Trigger */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
                <input
                  type="text"
                  placeholder="Search clothing..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchOpen) setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-velora-100 border border-transparent focus:border-velora-400 focus:bg-white focus:outline-none transition-all placeholder:text-velora-400"
                />
                <Search className="w-4 h-4 text-velora-400 absolute left-3 top-2.5" />
              </form>

              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 sm:hidden text-velora-700 hover:text-velora-950 hover:bg-velora-100 rounded-full"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Instant Results Dropdown */}
              {searchOpen && searchQuery.trim().length > 1 && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-velora-200 overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 bg-velora-50 border-b border-velora-100 flex items-center justify-between text-xs text-velora-500 font-medium">
                    <span>Products matching "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-velora-400 hover:text-velora-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-velora-100 max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-velora-50 transition-colors group"
                        >
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-14 object-cover rounded-md bg-velora-100"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-velora-900 truncate group-hover:text-velora-600">
                              {p.name}
                            </h4>
                            <p className="text-[11px] text-velora-500">{p.category} &bull; {p.subcategory}</p>
                            <span className="text-xs font-bold text-velora-950">
                              {formatPrice(p.discountedPrice || p.originalPrice, settings.currency)}
                            </span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-velora-500">
                        No products found for "{searchQuery}".
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-velora-50 border-t border-velora-100 text-center">
                    <button
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchOpen(false);
                      }}
                      className="text-xs font-semibold text-velora-900 hover:underline inline-flex items-center gap-1"
                    >
                      View all results <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-velora-700 hover:text-velora-950 hover:bg-velora-100 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shop CTA Button (Desktop) */}
            <Link
              to="/shop"
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-velora-950 text-white text-xs font-semibold tracking-wider hover:bg-velora-800 transition-all shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              EXPLORE
            </Link>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-velora-200 bg-white px-4 pt-4 pb-6 space-y-4 animate-fadeIn">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-velora-100 border border-transparent focus:bg-white focus:border-velora-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-velora-400 absolute left-3.5 top-3.5" />
          </form>

          <div className="flex flex-col space-y-3 font-semibold text-sm">
            <Link
              to="/"
              className="py-2 px-3 rounded-lg hover:bg-velora-100 text-velora-800"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="py-2 px-3 rounded-lg hover:bg-velora-100 text-velora-800"
            >
              Shop All Products
            </Link>
            <Link
              to="/categories"
              className="py-2 px-3 rounded-lg hover:bg-velora-100 text-velora-800"
            >
              Categories
            </Link>
            <Link
              to="/wishlist"
              className="py-2 px-3 rounded-lg hover:bg-velora-100 text-velora-800 flex items-center justify-between"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/contact"
              className="py-2 px-3 rounded-lg hover:bg-velora-100 text-velora-800"
            >
              Contact & Store Info
            </Link>
            <Link
              to="/admin"
              className="py-2 px-3 rounded-lg bg-velora-100 text-velora-900 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-velora-700" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
