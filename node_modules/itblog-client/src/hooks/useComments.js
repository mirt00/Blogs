import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useComments = (slug) => {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: () => api.get(`/v1/comments/post/${slug}`).then((res) => res.data),
    enabled: !!slug,
  });
};

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, ...data }) => api.post(`/v1/comments/post/${slug}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.slug] });
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, slug }) => api.delete(`/v1/comments/${id}`).then((res) => res.data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['comments', variables.slug] });
    },
  });
};
