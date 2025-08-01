
// src/App.jsx

import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { LanguageProvider } from './context/LanguageContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import QuotesPage from './pages/QuotesPage';
import OrdersPage from './pages/OrdersPage';
import HistoryPage from './pages/HistoryPage';
import ClientsViewPage from './pages/ClientsViewPage';
import ClientsNewPage from './pages/ClientsNewPage';
import ClientsStatsPage from './pages/ClientsStatsPage';
import FinancePaymentsPage from './pages/FinancePaymentsPage';
import FinanceReportsPage from './pages/FinanceReportsPage';
import FinanceInvoicesPage from './pages/FinanceInvoicesPage';
import CommunicationNotificationsPage from './pages/CommunicationNotificationsPage';
import CommunicationMessagesPage from './pages/CommunicationMessagesPage';
import CommunicationEmailMarketingPage from './pages/CommunicationEmailMarketingPage';
import PaymentsPage from './pages/PaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';
import ProjectsAdminPage from './pages/ProjectsAdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import ClientDashboard from './pages/ClientDashboard';
import RequestForm from './components/RequestForm';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/admin') || location.pathname.includes('/panel-cliente');

  return (
    <LanguageProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/portafolio" element={<Portfolio />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/solicitud"
            element={
              <ProtectedRoute>
                <RequestForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel-cliente"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cotizaciones"
            element={
              <ProtectedRoute adminOnly={true}>
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute adminOnly={true}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute adminOnly={true}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ver-clientes"
            element={
              <ProtectedRoute adminOnly={true}>
                <ClientsViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nuevo-cliente"
            element={
              <ProtectedRoute adminOnly={true}>
                <ClientsNewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estadisticas-clientes"
            element={
              <ProtectedRoute adminOnly={true}>
                <ClientsStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos-finanzas"
            element={
              <ProtectedRoute adminOnly={true}>
                <FinancePaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes-finanzas"
            element={
              <ProtectedRoute adminOnly={true}>
                <FinanceReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas-finanzas"
            element={
              <ProtectedRoute adminOnly={true}>
                <FinanceInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones-comm"
            element={
              <ProtectedRoute adminOnly={true}>
                <CommunicationNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes-comm"
            element={
              <ProtectedRoute adminOnly={true}>
                <CommunicationMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emails-comm"
            element={
              <ProtectedRoute adminOnly={true}>
                <CommunicationEmailMarketingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos-admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <ProjectsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagos"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
          </main>
          {!isDashboard && <Footer />}
        </div>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
