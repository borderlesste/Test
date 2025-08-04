import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { 
  FolderOpen, 
  FileText, 
  CreditCard, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load client statistics
      const [statsResponse, projectsResponse, invoicesResponse] = await Promise.all([
        api.get('/client/stats'),
        api.get('/client/projects?limit=3'),
        api.get('/client/invoices?limit=3')
      ]);

      setStats(statsResponse.data.data);
      setRecentProjects(projectsResponse.data.data);
      setRecentInvoices(invoicesResponse.data.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado': return 'text-green-600 bg-green-100';
      case 'en_progreso': return 'text-blue-600 bg-blue-100';
      case 'planificado': return 'text-yellow-600 bg-yellow-100';
      case 'pausado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'en_progreso': return 'En Progreso';
      case 'planificado': return 'Planificado';
      case 'pausado': return 'Pausado';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {user?.nombre}! 👋
        </h1>
        <p className="text-blue-100">
          Aquí tienes un resumen de tus proyectos y actividad reciente.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Proyectos Totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.totalProyectos || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En Progreso
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.proyectosEnProgreso || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.proyectosCompletados || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inversión Total
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(stats?.inversionTotal || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Proyectos Recientes
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Ver todos
              </button>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {project.titulo}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.descripcion?.substring(0, 60)}...
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.estado)}`}>
                          {getStatusText(project.estado)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCurrency(project.presupuesto)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proyectos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no tienes proyectos asignados.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Facturas Recientes
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-500">
                Ver todas
              </button>
            </div>
            
            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {invoice.numero_factura}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(invoice.fecha_emision)}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.estado === 'pagada' ? 'text-green-600 bg-green-100' :
                          invoice.estado === 'pendiente' ? 'text-yellow-600 bg-yellow-100' :
                          'text-red-600 bg-red-100'
                        }`}>
                          {invoice.estado === 'pagada' ? 'Pagada' :
                           invoice.estado === 'pendiente' ? 'Pendiente' : 'Vencida'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aún no tienes facturas generadas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <FolderOpen className="h-6 w-6 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-600">Ver Proyectos</span>
            </button>
            
            <button className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-600">Cotizaciones</span>
            </button>
            
            <button className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <CreditCard className="h-6 w-6 text-purple-600 mr-3" />
              <span className="text-sm font-medium text-purple-600">Facturas</span>
            </button>
            
            <button className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
              <span className="text-sm font-medium text-orange-600">Soporte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;