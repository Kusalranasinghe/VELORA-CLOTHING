import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAppsScriptUrl, postAppsScriptAction } from '../services/api';

const AuthContext = createContext(null);
const SESSION_STORAGE_KEY = 'velora_auth_session';

function getStoredToken() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch (error) {
    console.warn('Could not read the sign-in session from this browser.', error);
    return '';
  }
}

function storeToken(token) {
  try {
    if (token) sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    else sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    throw new Error(`Could not save your sign-in session in this browser: ${error.message}`);
  }
}

export function isCustomerProfileComplete(profile) {
  return ['name', 'address', 'phone', 'nic'].every(
    (field) => typeof profile?.[field] === 'string' && profile[field].trim().length > 0
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const authConfigured = Boolean(getAppsScriptUrl());

  const applySession = (session) => {
    setUser({
      uid: session.user.id,
      email: session.user.email,
      displayName: session.user.name
    });
    setCustomerProfile(session.user);
    setIsAdmin(session.user.role === 'admin');
    setAuthToken(session.token);
    storeToken(session.token);
    setAuthError('');
  };

  useEffect(() => {
    let active = true;
    const token = getStoredToken();

    if (!token || !authConfigured) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    postAppsScriptAction('getSession', { authToken: token })
      .then((result) => {
        if (active) {
          setUser({
            uid: result.user.id,
            email: result.user.email,
            displayName: result.user.name
          });
          setCustomerProfile(result.user);
          setIsAdmin(result.user.role === 'admin');
          setAuthToken(token);
          setAuthError('');
        }
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authConfigured]);

  const register = async (profile) => {
    const session = await postAppsScriptAction('registerCustomer', { profile });
    applySession(session);
    return {
      customerProfile: session.user,
      isAdmin: session.user.role === 'admin'
    };
  };

  const login = async (email, password) => {
    const session = await postAppsScriptAction('loginCustomer', { email, password });
    applySession(session);
    return {
      customerProfile: session.user,
      isAdmin: session.user.role === 'admin'
    };
  };

  const loginWithGoogle = async (credential) => {
    const session = await postAppsScriptAction('googleSignIn', { credential });
    applySession(session);
    return {
      customerProfile: session.user,
      isAdmin: session.user.role === 'admin'
    };
  };

  const updateCustomerProfile = async (profile) => {
    if (!authToken) throw new Error('Sign in before saving your customer details.');
    const result = await postAppsScriptAction('updateCustomerProfile', {
      authToken,
      profile
    });
    setCustomerProfile(result.user);
    setUser((current) => ({ ...current, displayName: result.user.name }));
  };

  const logout = async () => {
    storeToken('');
    setUser(null);
    setCustomerProfile(null);
    setIsAdmin(false);
    setAuthToken('');
    setAuthError('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        isAdmin,
        authToken,
        loading,
        authError,
        authConfigured,
        googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        register,
        login,
        loginWithGoogle,
        updateCustomerProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
