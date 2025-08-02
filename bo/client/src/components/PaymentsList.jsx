import { useState, useEffect } from 'react';
import { getClientPayments } from '../api/axios';
import logger from '../utils/logger';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Eye, 
  Download,
  X,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';

const PaymentsList = () => {
  const { error: showError } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);

  // Cargar pagos
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getClientPayments();
      
      if (response.data) {
        setPayments(Array.isArray(response.data) ? response.data : []);
      } else {
        setPayments([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar pagos';
      setError(errorMessage);
      showError(errorMessage);
      logger.setContext('PaymentsList').error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.amount?.toString().includes(searchTerm);
    
    const matchesFilter = filter === 'all' || payment.status?.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Calcular estadísticas
  const stats = {
    total: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    paid: payments.filter(p => p.status?.toLowerCase() === 'pagado').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    pending: payments.filter(p => p.status?.toLowerCase() === 'pendiente').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    overdue: payments.filter(p => p.status?.toLowerCase() === 'vencido').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  };

  // Obtener icono según el estado
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pagado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'vencido':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'procesando':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener color del badge según el estado
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pagado': { variant: 'default', text: 'Pagado', className: 'bg-green-100 text-green-800' },
      'pendiente': { variant: 'default', text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      'vencido': { variant: 'destructive', text: 'Vencido' },
      'procesando': { variant: 'default', text: 'Procesando', className: 'bg-blue-100 text-blue-800' },
      'cancelado': { variant: 'secondary', text: 'Cancelado' }
    };

    const config = statusConfig[status?.toLowerCase()] || { variant: 'secondary', text: status || 'Desconocido' };
    
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon(status)}
        <Badge 
          variant={config.variant} 
          className={config.className}
        >
          {config.text}
        </Badge>
      </div>
    );
  };

  // Obtener icono del método de pago
  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'transferencia':
      case 'transfer':
        return <TrendingUp className="w-4 h-4" />;
      case 'tarjeta':
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'efectivo':
      case 'cash':
        return <Wallet className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
        <span className="ml-2">Cargando pagos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <X className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchPayments} variant="outline">
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pagados</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue)}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar pagos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="procesando">Procesando</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {filteredPayments.length} pagos encontrados
        </div>
      </Card>

      {/* Lista de pagos */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No se encontraron pagos</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{payment.concept}</div>
                      {payment.projectName && (
                        <div className="text-sm text-gray-500 truncate">
                          Proyecto: {payment.projectName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-lg">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(payment.method)}
                      <span className="capitalize">{payment.method || 'No especificado'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDate(payment.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog open={showPaymentDetail && selectedPayment?.id === payment.id}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Detalle del Pago
                            </DialogTitle>
                          </DialogHeader>
                          <PaymentDetailModal 
                            payment={selectedPayment}
                            onClose={() => {
                              setShowPaymentDetail(false);
                              setSelectedPayment(null);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        title="Descargar comprobante"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Modal para detalles de pago
const PaymentDetailModal = ({ payment, onClose }) => {
  if (!payment) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pagado':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'pendiente':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'vencido':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'procesando':
        return <AlertCircle className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(payment.status)}
          <div>
            <h3 className="text-lg font-semibold">{payment.concept}</h3>
            <p className="text-sm text-gray-500">Estado: {payment.status}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(payment.amount)}
          </div>
          <div className="text-sm text-gray-500">ID: #{payment.id}</div>
        </div>
      </div>

      {/* Información del pago */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Información del Pago</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Concepto:</strong> {payment.concept}</div>
            <div><strong>Monto:</strong> {formatCurrency(payment.amount)}</div>
            <div><strong>Estado:</strong> {payment.status}</div>
            <div><strong>Método:</strong> {payment.method || 'No especificado'}</div>
            <div><strong>Fecha:</strong> {formatDate(payment.date)}</div>
          </div>
        </div>
        
        {payment.projectName && (
          <div>
            <h4 className="font-semibold mb-3">Proyecto Relacionado</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Proyecto:</strong> {payment.projectName}</div>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Información Adicional</h4>
        <div className="text-sm text-gray-600">
          <p>Este pago forma parte de tu historial de transacciones.</p>
          {payment.status?.toLowerCase() === 'pagado' && (
            <p className="text-green-600 mt-2">✓ Pago procesado exitosamente</p>
          )}
          {payment.status?.toLowerCase() === 'pendiente' && (
            <p className="text-yellow-600 mt-2">⏳ Pago pendiente de procesamiento</p>
          )}
          {payment.status?.toLowerCase() === 'vencido' && (
            <p className="text-red-600 mt-2">⚠️ Pago vencido - Contacta con soporte</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Descargar Comprobante
        </Button>
        <Button onClick={onClose} variant="outline">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default PaymentsList;