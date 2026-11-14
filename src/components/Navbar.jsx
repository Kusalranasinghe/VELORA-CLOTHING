import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  Shield,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/whatsapp';

export default function Navbar() {
  const { products, settings, wishlist, searchQuery, setSearchQuery } = useShop();
  const { isAdmin, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    <header className="sticky top-0 z-40 w-full bg-[#111111] text-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between gap-4 sm:h-[76px]">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="group flex flex-col items-center leading-none">
            <span className="font-serif text-2xl font-black tracking-wide text-white transition-colors group-hover:text-white/80 sm:text-3xl">
              VELORA
            </span>
            <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.34em] text-white/55 transition-all group-hover:tracking-[0.4em]">
              COLLECTION
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-3 md:flex lg:gap-5 xl:gap-8">
            <Link
              to="/shop"
              className={`text-[11px] font-semibold tracking-[0.12em] transition-colors ${
                location.pathname === '/shop' ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              SHOP
            </Link>
            <Link
              to="/shop?sort=newest"
              className={`text-[11px] font-semibold tracking-[0.12em] transition-colors ${
                location.search.includes('sort=newest') ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              NEW
            </Link>
            <Link
              to="/shop?category=Men"
              className={`text-[11px] font-semibold tracking-[0.12em] transition-colors ${
                location.search.includes('category=Men') ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              MENS
            </Link>
            <Link
              to="/shop?category=Women"
              className={`text-[11px] font-semibold tracking-[0.12em] transition-colors ${
                location.search.includes('category=Women') ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              WOMENS
            </Link>
            <Link
              to="/shop?category=Accessories"
              className={`text-[11px] font-semibold tracking-[0.12em] transition-colors ${
                location.search.includes('category=Accessories') ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
            >
              ACCESSORIES
            </Link>
          </nav>

          {/* Right Action Icons & Live Search */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Input Trigger */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative hidden w-40 sm:block lg:w-48">
                <input
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchOpen) setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full border border-white/15 bg-white/[0.04] py-2 pl-9 pr-3 text-[11px] tracking-[0.12em] text-white transition-colors placeholder:text-white/45 focus:border-white/40 focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/65" />
              </form>

              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Instant Results Dropdown */}
              {searchOpen && searchQuery.trim().length > 1 && (
                <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-xl border border-velora-200 bg-white text-velora-900 shadow-2xl sm:w-96 animate-fadeIn">
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
              className="relative rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to={isAdmin ? '/admin' : '/account'}
              aria-label={isAdmin ? 'Admin dashboard' : user ? 'Your account' : 'Sign in'}
              className="flex items-center gap-2 rounded-md p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isAdmin ? <Shield className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              <span className="hidden text-[10px] font-semibold tracking-wide sm:inline">
                {isAdmin ? 'ADMIN' : user ? 'ACCOUNT' : 'LOG IN'}
              </span>
            </Link>

          </div>
        </div>
      </div>

      <div className="velora-promo-bar overflow-hidden border-y border-white/[0.06] bg-[#2a2b2e]">
        <div className="velora-promo-track flex w-max items-center py-2.5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {[settings.deliveryNote || 'FREE SHIPPING', 'NEW DROP EVERY FRIDAY', 'SHOP THE LATEST COLLECTION', 'EASY WHATSAPP ORDERING'].map((message) => (
                <span key={`${copy}-${message}`} className="flex items-center">
                  <span className="px-8 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 sm:px-12 sm:text-[10px]">
                    {message}
                  </span>
                  <span className="text-white/40" aria-hidden="true">—</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="space-y-4 border-t border-white/10 bg-[#151515] px-4 pb-6 pt-4 text-white md:hidden animate-fadeIn">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/45 focus:border-white/40 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-white/55" />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-semibold">
            <Link
              to="/shop"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Shop
            </Link>
            <Link
              to="/shop?sort=newest"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              New Arrivals
            </Link>
            <Link
              to="/shop?category=Men"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Menswear
            </Link>
            <Link
              to="/shop?category=Women"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Womenswear
            </Link>
            <Link
              to="/shop?category=Accessories"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Accessories
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-black">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to="/contact"
              className="rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              Contact & Store Info
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/account'}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              {isAdmin ? <Shield className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <span>{isAdmin ? 'Admin Dashboard' : user ? 'My Account' : 'Log in / Register'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
