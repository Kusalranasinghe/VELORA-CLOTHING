import axios from 'axios';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS } from './mockData';

const LOCAL_STORAGE_PRODUCTS = 'velora_products_cache';
const LOCAL_STORAGE_CATEGORIES = 'velora_categories_cache';
const LOCAL_STORAGE_SETTINGS = 'velora_settings_cache';

// Helper to get cached or initial data
function getLocalData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for ${key}:`, e);
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error writing localStorage for ${key}:`, e);
  }
}

// Get configured Apps Script URL
export function getAppsScriptUrl() {
  const envUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim();
  const settings = getLocalData(LOCAL_STORAGE_SETTINGS, INITIAL_SETTINGS);
  return settings.appsScriptUrl ? settings.appsScriptUrl.trim() : '';
}

/**
 * Fetch all initial data (Products, Categories, Settings)
 */
export async function fetchStoreData() {
  const url = getAppsScriptUrl();

  // If live Google Apps Script URL exists, try fetching
  if (url) {
    try {
      const response = await axios.get(url, {
        params: { action: 'getAllData' },
        timeout: 10000
      });
      if (response.data && response.data.status === 'success' && response.data.data) {
        const { products, categories, settings } = response.data.data;
        if (products && products.length > 0) setLocalData(LOCAL_STORAGE_PRODUCTS, products);
        if (categories && categories.length > 0) setLocalData(LOCAL_STORAGE_CATEGORIES, categories);
        if (settings && Object.keys(settings).length > 0) setLocalData(LOCAL_STORAGE_SETTINGS, { ...INITIAL_SETTINGS, ...settings });
        
        return {
          products: products || [],
          categories: categories || [],
          settings: { ...INITIAL_SETTINGS, ...(settings || {}) },
          source: 'google-sheets'
        };
      }
    } catch (err) {
      console.warn('Google Sheets API request failed, falling back to local cache/demo mode:', err.message);
    }
  }

  // Fallback to localStorage or mockData
  const products = getLocalData(LOCAL_STORAGE_PRODUCTS, INITIAL_PRODUCTS);
  const categories = getLocalData(LOCAL_STORAGE_CATEGORIES, INITIAL_CATEGORIES);
  const settings = getLocalData(LOCAL_STORAGE_SETTINGS, INITIAL_SETTINGS);

  return { products, categories, settings, source: 'local' };
}

/**
 * Product CRUD
 */
export async function saveProduct(product, isNew = true) {
  const url = getAppsScriptUrl();
  const action = isNew ? 'addProduct' : 'updateProduct';

  // 1. Update local storage first for instant responsive UI
  const products = getLocalData(LOCAL_STORAGE_PRODUCTS, INITIAL_PRODUCTS);
  let updatedProducts;
  if (isNew) {
    const newProd = {
      ...product,
      id: product.id || `prod_${Date.now()}`
    };
    updatedProducts = [newProd, ...products];
  } else {
    updatedProducts = products.map(p => (p.id === product.id ? { ...p, ...product } : p));
  }
  setLocalData(LOCAL_STORAGE_PRODUCTS, updatedProducts);

  // 2. If Google Apps Script is configured, sync to Google Sheets
  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data: product })
      });
    } catch (err) {
      console.error('Failed to sync product with Google Sheet:', err);
    }
  }

  return { success: true, products: updatedProducts };
}

export async function deleteProduct(productId) {
  const url = getAppsScriptUrl();

  // 1. Remove from local storage
  const products = getLocalData(LOCAL_STORAGE_PRODUCTS, INITIAL_PRODUCTS);
  const updatedProducts = products.filter(p => p.id !== productId);
  setLocalData(LOCAL_STORAGE_PRODUCTS, updatedProducts);

  // 2. Sync to Google Sheets
  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteProduct', id: productId })
      });
    } catch (err) {
      console.error('Failed to delete product from Google Sheet:', err);
    }
  }

  return { success: true, products: updatedProducts };
}

/**
 * Category CRUD
 */
export async function saveCategory(category, isNew = true) {
  const url = getAppsScriptUrl();
  const action = isNew ? 'addCategory' : 'updateCategory';

  const categories = getLocalData(LOCAL_STORAGE_CATEGORIES, INITIAL_CATEGORIES);
  let updatedCategories;
  if (isNew) {
    const newCat = {
      ...category,
      id: category.id || `cat_${Date.now()}`
    };
    updatedCategories = [...categories, newCat];
  } else {
    updatedCategories = categories.map(c => (c.id === category.id ? { ...c, ...category } : c));
  }
  setLocalData(LOCAL_STORAGE_CATEGORIES, updatedCategories);

  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data: category })
      });
    } catch (err) {
      console.error('Failed to sync category with Google Sheet:', err);
    }
  }

  return { success: true, categories: updatedCategories };
}

export async function deleteCategory(categoryId) {
  const url = getAppsScriptUrl();

  const categories = getLocalData(LOCAL_STORAGE_CATEGORIES, INITIAL_CATEGORIES);
  const updatedCategories = categories.filter(c => c.id !== categoryId);
  setLocalData(LOCAL_STORAGE_CATEGORIES, updatedCategories);

  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteCategory', id: categoryId })
      });
    } catch (err) {
      console.error('Failed to delete category from Google Sheet:', err);
    }
  }

  return { success: true, categories: updatedCategories };
}

/**
 * Settings CRUD
 */
export async function saveSettings(settings) {
  const url = getAppsScriptUrl();

  const current = getLocalData(LOCAL_STORAGE_SETTINGS, INITIAL_SETTINGS);
  const updatedSettings = { ...current, ...settings };
  setLocalData(LOCAL_STORAGE_SETTINGS, updatedSettings);

  if (url) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateSettings', data: settings })
      });
    } catch (err) {
      console.error('Failed to sync settings with Google Sheet:', err);
    }
  }

  return { success: true, settings: updatedSettings };
}
