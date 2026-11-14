import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchStoreData,
  saveProduct,
  deleteProduct as apiDeleteProduct,
  saveCategory,
  deleteCategory as apiDeleteCategory,
  saveSettings as apiSaveSettings
} from '../services/api';
import { INITIAL_SETTINGS } from '../services/mockData';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const { isAdmin, authToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading'); // 'google-sheets' | 'local'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('velora_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('velora_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Load store data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchStoreData();
      setProducts(data.products || []);
      setCategories(data.categories || []);
      setSettings(data.settings || INITIAL_SETTINGS);
      setDataSource(data.source || 'local');
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Wishlist actions
  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Added to Wishlist! ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  const getAdminAuthToken = () => {
    if (!authToken || !isAdmin) {
      throw new Error('You must sign in with an admin account before changing store data.');
    }
    return authToken;
  };

  // Admin Actions
  const handleAddProduct = async (productData) => {
    const res = await saveProduct(productData, true, getAdminAuthToken());
    setProducts(res.products);
    showToast('Product added successfully!');
    return res;
  };

  const handleUpdateProduct = async (productData) => {
    const res = await saveProduct(productData, false, getAdminAuthToken());
    setProducts(res.products);
    showToast('Product updated successfully!');
    return res;
  };

  const handleDeleteProduct = async (productId) => {
    const res = await apiDeleteProduct(productId, getAdminAuthToken());
    setProducts(res.products);
    showToast('Product removed!');
    return res;
  };

  const handleAddCategory = async (catData) => {
    const res = await saveCategory(catData, true, getAdminAuthToken());
    setCategories(res.categories);
    showToast('Category added!');
    return res;
  };

  const handleUpdateCategory = async (catData) => {
    const res = await saveCategory(catData, false, getAdminAuthToken());
    setCategories(res.categories);
    showToast('Category updated!');
    return res;
  };

  const handleDeleteCategory = async (catId) => {
    const res = await apiDeleteCategory(catId, getAdminAuthToken());
    setCategories(res.categories);
    showToast('Category deleted!');
    return res;
  };

  const handleUpdateSettings = async (newSettings) => {
    const res = await apiSaveSettings(newSettings, getAdminAuthToken());
    setSettings(res.settings);
    showToast('Store settings updated!');
    return res;
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        settings,
        loading,
        dataSource,
        searchQuery,
        setSearchQuery,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toast,
        showToast,
        addProduct: handleAddProduct,
        updateProduct: handleUpdateProduct,
        deleteProduct: handleDeleteProduct,
        addCategory: handleAddCategory,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory,
        updateSettings: handleUpdateSettings,
        refreshData: loadData
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl bg-velora-900 text-white border border-velora-700 animate-bounce duration-300">
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
}
