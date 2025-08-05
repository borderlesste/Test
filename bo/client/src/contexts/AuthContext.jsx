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
      // Error 401 es normal cuando el usuario no está autenticado
      if (error.response?.status === 401) {
        setUser(null);
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        // Error de red real - log para debugging pero no bloquear la app
        console.warn('Network error al verificar sesión (servidor posiblemente no disponible):', error.message);
        setUser(null);
      } else {
        // Otros errores inesperados
        console.error('Error inesperado al verificar sesión:', error);
        setUser(null);
      }
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