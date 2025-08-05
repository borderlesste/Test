import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, login as apiLogin } from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  const checkUserSession = useCallback(async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await apiLogin(credentials);
      await checkUserSession();
      return res.data; 
    } catch (error) {
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };


  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkUserSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;