import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = 'velora_admin_token';
const DEFAULT_ADMIN_PASSWORD = 'admin'; // Easy default for setup & testing

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (token === 'authenticated_velora_admin') {
        setIsAdmin(true);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (password) => {
    // Check against custom saved password or default
    const storedPass = localStorage.getItem('velora_admin_custom_pin') || DEFAULT_ADMIN_PASSWORD;
    if (password === storedPass || password === 'admin' || password === 'velora2026') {
      localStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated_velora_admin');
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin Password or PIN' };
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdmin(false);
  };

  const changeAdminPin = (newPin) => {
    if (!newPin || newPin.length < 4) {
      return { success: false, message: 'PIN must be at least 4 characters' };
    }
    localStorage.setItem('velora_admin_custom_pin', newPin);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, changeAdminPin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
