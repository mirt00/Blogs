import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/analytics/overview').then((res) => res.data),
    refetchInterval: 60000,
  });
};

export const useVisitorStats = (days = 30) => {
  return useQuery({
    queryKey: ['analytics', 'visitors', days],
    queryFn: () => api.get('/analytics/visitors', { params: { days } }).then((res) => res.data),
  });
};

export const useDeviceStats = () => {
  return useQuery({
    queryKey: ['analytics', 'devices'],
    queryFn: () => api.get('/analytics/devices').then((res) => res.data),
  });
};
