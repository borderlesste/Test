import { useMemo } from 'react';
import useOptimizedQuery from './useOptimizedQuery';
import { getAdminStats, getChartsData, getFinancialSummary } from '../api/axios';

// Custom hook for dashboard statistics with optimized caching
export const useDashboardStats = (options = {}) => {
  const { enabled = true, refetchInterval = 30000 } = options;

  // Admin stats query
  const statsQuery = useOptimizedQuery(
    'admin-stats',
    async ({ signal }) => {
      const response = await getAdminStats();
      return response.data.success ? response.data.data : null;
    },
    {
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 2
    }
  );

  // Charts data query
  const chartsQuery = useOptimizedQuery(
    'charts-data',
    async ({ signal }) => {
      const response = await getChartsData();
      return response.data.success ? response.data.data : null;
    },
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2
    }
  );

  // Financial summary query
  const financialQuery = useOptimizedQuery(
    'financial-summary',
    async ({ signal }) => {
      const response = await getFinancialSummary();
      return response.data.success ? response.data.data : null;
    },
    {
      enabled,
      staleTime: 3 * 60 * 1000, // 3 minutes
      cacheTime: 8 * 60 * 1000, // 8 minutes
      retry: 2
    }
  );

  // Memoized combined result
  const result = useMemo(() => ({
    stats: statsQuery.data,
    charts: chartsQuery.data,
    financial: financialQuery.data,
    isLoading: statsQuery.isLoading || chartsQuery.isLoading || financialQuery.isLoading,
    isError: statsQuery.isError || chartsQuery.isError || financialQuery.isError,
    error: statsQuery.error || chartsQuery.error || financialQuery.error,
    isSuccess: statsQuery.isSuccess && chartsQuery.isSuccess && financialQuery.isSuccess,
    refetch: () => {
      statsQuery.refetch();
      chartsQuery.refetch();
      financialQuery.refetch();
    },
    invalidate: () => {
      statsQuery.invalidate();
      chartsQuery.invalidate();
      financialQuery.invalidate();
    }
  }), [statsQuery, chartsQuery, financialQuery]);

  return result;
};

// Hook for specific entity stats (clients, quotations, invoices)
export const useEntityStats = (entity, entityId = null, options = {}) => {
  const { enabled = true } = options;

  const queryKey = entityId ? `${entity}-stats-${entityId}` : `${entity}-stats`;

  return useOptimizedQuery(
    queryKey,
    async ({ signal }) => {
      let apiCall;
      switch (entity) {
        case 'clients':
          const { getClientStats } = await import('../api/axios');
          apiCall = getClientStats;
          break;
        case 'quotations':
          const { getQuotationStats } = await import('../api/axios');
          apiCall = getQuotationStats;
          break;
        case 'invoices':
          const { getInvoiceStats } = await import('../api/axios');
          apiCall = getInvoiceStats;
          break;
        default:
          throw new Error(`Unknown entity: ${entity}`);
      }

      const response = await apiCall();
      return response.data.success ? response.data.data : null;
    },
    {
      enabled,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      ...options
    }
  );
};

export default useDashboardStats;