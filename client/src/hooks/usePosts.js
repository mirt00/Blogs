import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const usePosts = (params = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.get('/v1/posts', { params }).then((res) => res.data),
  });
};

export const useFeaturedPosts = () => {
  return useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: () => api.get('/v1/posts/featured').then((res) => res.data),
  });
};

export const usePost = (slug) => {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.get(`/v1/posts/${slug}`).then((res) => res.data),
    enabled: !!slug,
  });
};

export const useSearchPosts = (query) => {
  return useQuery({
    queryKey: ['posts', 'search', query],
    queryFn: () => api.get('/v1/posts/search', { params: { q: query } }).then((res) => res.data),
    enabled: query?.length > 2,
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/v1/posts', data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/v1/posts/${id}`, data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/v1/posts/${id}`).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};
