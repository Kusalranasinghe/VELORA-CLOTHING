import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import AdminProducts from './AdminProducts';
import AdminCategories from './AdminCategories';
import AdminSettings from './AdminSettings';
import AdminLogin from './AdminLogin';

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuth();
  const { products, categories, settings, dataSource, refreshData } = useShop();
  const [activeTab, setActiveTab] = useState('products'); // 'overview' | 'products' | 'categories' | 'settings'
  const navigate = useNavigate();

  // If not authenticated, render Login component directly
  if (!isAdmin) {
    return <AdminLogin />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-velora-50 text-velora-900 pb-16">
      
      {/* Admin Top Header */}
      <header className="bg-velora-950 text-white border-b border-velora-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white">
                <Shield className="w-5 h-5 text-velora-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-black text-sm tracking-wider uppercase text-white">
                    VELORA CLOTHING
                  </h1>
                  <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-velora-300">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-velora-400">Store Management Console</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-velora-300 hover:text-white transition-colors"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-900/60 text-velora-200 hover:text-rose-200 text-xs font-semibold transition-colors"
                title="Log out of Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-velora-200 shadow-sm flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-velora-950 text-white shadow-sm'
                : 'text-velora-700 hover:bg-velora-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-velora-950 text-white shadow-sm'
                : 'text-velora-700 hover:bg-velora-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-velora-950 text-white shadow-sm'
                : 'text-velora-700 hover:bg-velora-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store Settings & API</span>
          </button>
        </div>

        {/* Tab View Render */}
        <div className="animate-fadeIn">
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>

      </div>

    </div>
  );
}
