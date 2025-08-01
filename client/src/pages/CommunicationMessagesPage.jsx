import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Skeleton } from '../components';
import { getMessages, createMessage, markMessageAsRead } from '../api/axios';
import { 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Calendar, 
  User, 
  Send, 
  Reply, 
  Forward,
  Eye,
  Download,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Paperclip
} from 'lucide-react';

const CommunicationMessagesPage = ({ showNavigation = true }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    destinatario: '',
    asunto: '',
    mensaje: '',
    prioridad: 'normal'
  });

  // Cargar datos desde las APIs
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const messagesRes = await getMessages();

      if (messagesRes.data.success) {
        setMessages(messagesRes.data.data || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };


  const handleMarkAsRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(messages.map(message => 
        message.id === messageId ? { ...message, estado: 'leido' } : message
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleReply = (message) => {
    setNewMessage({
      destinatario: message.remitente_email,
      asunto: `Re: ${message.asunto}`,
      mensaje: `\n\n--- Mensaje original ---\nDe: ${message.remitente}\nFecha: ${formatDate(message.fecha_envio)}\nAsunto: ${message.asunto}\n\n${message.mensaje}`,
      prioridad: message.prioridad
    });
    setShowComposeModal(true);
  };

  const handleSendMessage = async () => {
    try {
      await createMessage(newMessage);
      const messageToSend = {
        id: `msg-${Date.now()}`,
        remitente: 'Admin',
        remitente_email: 'admin@sistema.com',
        destinatario: newMessage.destinatario,
        asunto: newMessage.asunto,
        mensaje: newMessage.mensaje,
        fecha_envio: new Date().toISOString(),
        estado: 'enviado',
        prioridad: newMessage.prioridad,
        tipo: 'respuesta_admin',
        pedido_relacionado: null,
        adjuntos: [],
        respondido: false,
        createdAt: new Date().toISOString()
      };

      console.log('Enviando mensaje:', messageToSend);
      alert('Mensaje enviado exitosamente');
      
      // Marcar el mensaje original como respondido si es una respuesta
      if (selectedMessage) {
        setMessages(messages.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, respondido: true } : msg
        ));
      }

      setShowComposeModal(false);
      setNewMessage({ destinatario: '', asunto: '', mensaje: '', prioridad: 'normal' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consulta_pedido': return <MessageSquare className="w-4 h-4" />;
      case 'consulta_general': return <Mail className="w-4 h-4" />;
      case 'soporte': return <AlertCircle className="w-4 h-4" />;
      case 'cotizacion': return <Star className="w-4 h-4" />;
      case 'feedback': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consulta_pedido': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'consulta_general': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'soporte': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'cotizacion': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'feedback': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta': case 'high': return 'border-l-red-500';
      case 'normal': case 'medium': return 'border-l-yellow-500';
      case 'baja': case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredMessages = messages.filter(message => {
    const statusMatch = filter === 'all' || 
      (filter === 'read' && message.estado === 'leido') ||
      (filter === 'unread' && message.estado === 'no_leido') ||
      (filter === 'replied' && message.respondido) ||
      (filter === 'pending' && !message.respondido);
    
    const typeMatch = statusFilter === 'all' || message.tipo === statusFilter;
    
    const searchMatch = searchTerm === '' || 
      message.asunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.remitente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.mensaje?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportMessages = () => {
    const dataStr = JSON.stringify(filteredMessages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mensajes_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Calcular estadísticas
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => m.estado === 'no_leido').length;
  const repliedMessages = messages.filter(m => m.respondido).length;
  const pendingMessages = messages.filter(m => !m.respondido).length;

  if (loading) {
    return (
      <div className={showNavigation ? "min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6" : "p-6"}>
        <div className={showNavigation ? "max-w-7xl mx-auto" : ""}>
          <div className="mb-8">
            <Skeleton height="8" width="1/3" className="mb-4" />
            <Skeleton height="4" width="2/3" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="gradient" className="animate-pulse">
                <Skeleton height="6" width="1/4" className="mb-4" />
                <Skeleton height="4" width="full" className="mb-2" />
                <Skeleton height="4" width="3/4" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={showNavigation ? "min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6" : ""}>
      <div className={showNavigation ? "max-w-7xl mx-auto" : ""}>        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-800 dark:text-gray-100 mb-4">
                💬 Gestión de Mensajes
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Administra toda la comunicación con clientes y mantén un registro de conversaciones importantes
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAllData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={exportMessages}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowComposeModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Mensaje
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="gradient" className="text-center group hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {totalMessages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Mensajes</div>
          </Card>

          <Card variant="gradient" className="text-center group hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {unreadMessages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sin Leer</div>
          </Card>

          <Card variant="gradient" className="text-center group hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {repliedMessages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Respondidos</div>
          </Card>

          <Card variant="gradient" className="text-center group hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {pendingMessages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card variant="gradient" className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por asunto, remitente o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos ({totalMessages})
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Sin Leer ({unreadMessages})
              </Button>
              <Button
                variant={filter === 'pending' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendientes ({pendingMessages})
              </Button>
              <Button
                variant={filter === 'replied' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('replied')}
              >
                Respondidos ({repliedMessages})
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Tipo:
            </span>
            <Button
              variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === 'consulta_pedido' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('consulta_pedido')}
            >
              Consultas Pedidos
            </Button>
            <Button
              variant={statusFilter === 'soporte' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('soporte')}
            >
              Soporte
            </Button>
            <Button
              variant={statusFilter === 'cotizacion' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('cotizacion')}
            >
              Cotizaciones
            </Button>
          </div>
        </Card>

        {/* Messages List */}
        <div className="grid gap-6">
          {filteredMessages.map((message) => (
            <Card key={message.id} variant="gradient" hover className={`group border-l-4 ${getPriorityColor(message.prioridad)} ${message.estado === 'no_leido' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      <MessageSquare className="w-5 h-5 inline mr-2" />
                      {message.asunto}
                    </h3>
                    {message.estado === 'no_leido' && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                        Nuevo
                      </span>
                    )}
                    {message.respondido && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        Respondido
                      </span>
                    )}
                    {message.tipo && (
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(message.tipo)}`}>
                        {getTypeIcon(message.tipo)}
                        {message.tipo.replace('_', ' ')}
                      </span>
                    )}
                    {message.adjuntos.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        <Paperclip className="w-3 h-3" />
                        {message.adjuntos.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-500">De:</p>
                        <p className="font-medium">{message.remitente}</p>
                        <p className="text-sm text-gray-500">{message.remitente_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="font-medium">{formatDate(message.fecha_envio)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {message.mensaje}
                    </p>
                  </div>

                  {message.pedido_relacionado && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Pedido relacionado: #{message.pedido_relacionado}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      message.prioridad?.toLowerCase() === 'alta' ? 'bg-red-100 text-red-800' :
                      message.prioridad?.toLowerCase() === 'normal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Prioridad: {message.prioridad}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:w-48">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      setSelectedMessage(message);
                      setShowModal(true);
                      if (message.estado === 'no_leido') {
                        handleMarkAsRead(message.id);
                      }
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    Ver Completo
                  </Button>
                  
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="w-4 h-4" />
                    Responder
                  </Button>
                  
                  {message.estado === 'no_leido' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar Leído
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <Card variant="gradient" className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay mensajes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No se han recibido mensajes aún' : `No hay mensajes ${filter}`}
            </p>
          </Card>
        )}

        {/* Message Details Modal */}
        {showModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedMessage.asunto}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        De: {selectedMessage.remitente}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedMessage.remitente_email}</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedMessage.fecha_envio)}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedMessage.tipo && (
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedMessage.tipo)}`}>
                          {getTypeIcon(selectedMessage.tipo)}
                          {selectedMessage.tipo.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {selectedMessage.mensaje}
                    </p>
                  </div>

                  {selectedMessage.adjuntos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Adjuntos:</h4>
                      <div className="flex gap-2">
                        {selectedMessage.adjuntos.map((adjunto, index) => (
                          <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-300 rounded">
                            <Paperclip className="w-4 h-4" />
                            {adjunto}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="primary" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        handleReply(selectedMessage);
                        setShowModal(false);
                      }}
                    >
                      <Reply className="w-4 h-4" />
                      Responder
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Funcionalidad de reenvío
                        setNewMessage({
                          destinatario: '',
                          asunto: `Fwd: ${selectedMessage.asunto}`,
                          mensaje: `\n\n--- Mensaje reenviado ---\nDe: ${selectedMessage.remitente}\nFecha: ${formatDate(selectedMessage.fecha_envio)}\nAsunto: ${selectedMessage.asunto}\n\n${selectedMessage.mensaje}`,
                          prioridad: selectedMessage.prioridad
                        });
                        setShowComposeModal(true);
                        setShowModal(false);
                      }}
                    >
                      <Forward className="w-4 h-4" />
                      Reenviar
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowModal(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compose Message Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Nuevo Mensaje
                  </h2>
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Para:
                    </label>
                    <input
                      type="email"
                      value={newMessage.destinatario}
                      onChange={(e) => setNewMessage({...newMessage, destinatario: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="email@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Asunto:
                    </label>
                    <input
                      type="text"
                      value={newMessage.asunto}
                      onChange={(e) => setNewMessage({...newMessage, asunto: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Asunto del mensaje"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prioridad:
                    </label>
                    <select
                      value={newMessage.prioridad}
                      onChange={(e) => setNewMessage({...newMessage, prioridad: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="baja">Baja</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mensaje:
                    </label>
                    <textarea
                      value={newMessage.mensaje}
                      onChange={(e) => setNewMessage({...newMessage, mensaje: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="primary" 
                      className="flex items-center gap-2"
                      onClick={handleSendMessage}
                      disabled={!newMessage.destinatario || !newMessage.asunto || !newMessage.mensaje}
                    >
                      <Send className="w-4 h-4" />
                      Enviar Mensaje
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowComposeModal(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CommunicationMessagesPage.propTypes = {
  showNavigation: PropTypes.bool
};

export default CommunicationMessagesPage;