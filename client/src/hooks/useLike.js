import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useLike = (postId) => {
  return useQuery({
    queryKey: ['like-status', postId],
    queryFn: () => api.get(`/likes/${postId}/like-status`).then((res) => res.data),
    enabled: !!postId,
  });
};

export const useToggleLike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId) => api.post(`/likes/${postId}/like`).then((res) => res.data),
    onSuccess: (data, postId) => {
      qc.invalidateQueries({ queryKey: ['like-status', postId] });
      qc.invalidateQueries({ queryKey: ['post'] });
    },
  });
};
