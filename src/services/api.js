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

export async function postAppsScriptAction(action, payload = {}) {
  const url = getAppsScriptUrl();
  if (!url) {
    throw new Error('Google Sheets authentication is not configured. Follow GOOGLE_SHEETS_AUTH_SETUP.md.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload })
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Google Apps Script returned an unreadable response. Check that the latest web app version is deployed.');
  }

  if (!response.ok || result.status !== 'success') {
    const error = new Error(result.message || `Google Sheets rejected the ${action} request.`);
    error.code = result.code;
    throw error;
  }

  return result.data;
}

async function syncAdminMutation(url, action, payload, authToken) {
  if (!authToken) {
    throw new Error('Admin sign-in is required before changing store data.');
  }
  await postAppsScriptAction(action, { ...payload, authToken });
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
export async function saveProduct(product, isNew = true, authToken) {
  const url = getAppsScriptUrl();
  const action = isNew ? 'addProduct' : 'updateProduct';
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

  if (url) {
    await syncAdminMutation(url, action, { data: isNew ? updatedProducts[0] : product }, authToken);
  }

  setLocalData(LOCAL_STORAGE_PRODUCTS, updatedProducts);
  return { success: true, products: updatedProducts };
}

export async function deleteProduct(productId, authToken) {
  const url = getAppsScriptUrl();
  const products = getLocalData(LOCAL_STORAGE_PRODUCTS, INITIAL_PRODUCTS);
  const updatedProducts = products.filter(p => p.id !== productId);

  if (url) {
    await syncAdminMutation(url, 'deleteProduct', { id: productId }, authToken);
  }

  setLocalData(LOCAL_STORAGE_PRODUCTS, updatedProducts);
  return { success: true, products: updatedProducts };
}

/**
 * Category CRUD
 */
export async function saveCategory(category, isNew = true, authToken) {
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
  if (url) {
    await syncAdminMutation(
      url,
      action,
      { data: isNew ? updatedCategories[updatedCategories.length - 1] : category },
      authToken
    );
  }

  setLocalData(LOCAL_STORAGE_CATEGORIES, updatedCategories);
  return { success: true, categories: updatedCategories };
}

export async function deleteCategory(categoryId, authToken) {
  const url = getAppsScriptUrl();

  const categories = getLocalData(LOCAL_STORAGE_CATEGORIES, INITIAL_CATEGORIES);
  const updatedCategories = categories.filter(c => c.id !== categoryId);
  if (url) {
    await syncAdminMutation(url, 'deleteCategory', { id: categoryId }, authToken);
  }

  setLocalData(LOCAL_STORAGE_CATEGORIES, updatedCategories);
  return { success: true, categories: updatedCategories };
}

/**
 * Settings CRUD
 */
export async function saveSettings(settings, authToken) {
  const url = getAppsScriptUrl();

  const current = getLocalData(LOCAL_STORAGE_SETTINGS, INITIAL_SETTINGS);
  const updatedSettings = { ...current, ...settings };
  if (url) {
    await syncAdminMutation(url, 'updateSettings', { data: settings }, authToken);
  }

  setLocalData(LOCAL_STORAGE_SETTINGS, updatedSettings);
  return { success: true, settings: updatedSettings };
}
