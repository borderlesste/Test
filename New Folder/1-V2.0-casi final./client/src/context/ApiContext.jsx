
import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';

const ApiContext = createContext();


export const ApiProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Nueva versión: funciona con sesiones basadas en cookies
  const register = async (data) => {
    const res = await api.post('/api/auth/register', data);
    // Con sesiones, el backend automáticamente crea la sesión y establece la cookie
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const login = async (credentials) => {
    const res = await api.post('/api/auth/login', credentials);
    if (res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    } else {
      throw new Error(res.data.message || 'Error de login');
    }
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout para destruir la sesión en el servidor
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    // Limpiar estado local
    setUser(null);
    setOrders([]);
    setPayments([]);
    setQuotes([]);
    setInvoices([]);
    setProjects([]);
    setClients([]);
    setNotifications([]);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/api/payments');
      setPayments(res.data);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  const fetchQuotes = async () => {
    try {
      const res = await api.get('/api/quotes');
      setQuotes(res.data);
    } catch (error) {
      // Silently handle auth errors
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        console.error('Error loading quotes:', error);
      }
      setQuotes([]);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/api/users');
      // Handle both possible response structures
      const users = res.data.data || res.data || [];
      setClients(users.filter(user => user.rol === 'cliente'));
    } catch (error) {
      // Silently handle auth errors
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        console.error('Error loading clients:', error);
      }
      setClients([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Con sesiones, solo necesitamos hacer la petición - la cookie se envía automáticamente
        const res = await api.get('/api/auth/profile');
        setUser(res.data);
      } catch (error) {
        // Si falla, significa que no hay sesión válida
        console.error("Failed to load user from session:", error);
        setUser(null);
      }
    };
    loadUser();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (user && user.rol === 'admin') {
      fetchOrders();
      fetchPayments();
      fetchQuotes();
      fetchInvoices();
      fetchProjects();
      fetchClients();
      fetchNotifications();
    }
  }, [user]);

  return (
    <ApiContext.Provider
      value={{ 
        user, 
        orders, 
        payments, 
        quotes, 
        invoices, 
        projects, 
        clients, 
        notifications,
        register, 
        login, 
        logout, 
        fetchOrders, 
        fetchPayments,
        fetchQuotes,
        fetchInvoices,
        fetchProjects,
        fetchClients,
        fetchNotifications
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useApi = () => useContext(ApiContext);
