import { DashboardLayout } from '../components';
import ClientStatsPanel from '../components/dashboard/ClientStatsPanel';

const ClientPanel = () => {
  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <ClientStatsPanel formatCurrency={formatCurrency} />
      </div>
    </DashboardLayout>
  );
};

export default ClientPanel;
