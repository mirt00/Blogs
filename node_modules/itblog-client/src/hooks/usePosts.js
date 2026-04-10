import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const usePosts = (params = {}) => {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => api.get('/posts', { params }).then((res) => res.data),
  });
};

export const useFeaturedPosts = () => {
  return useQuery({
    queryKey: ['posts', 'featured'],
    queryFn: () => api.get('/posts/featured').then((res) => res.data),
  });
};

export const usePost = (slug) => {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => api.get(`/posts/${slug}`).then((res) => res.data),
    enabled: !!slug,
  });
};

export const useSearchPosts = (query) => {
  return useQuery({
    queryKey: ['posts', 'search', query],
    queryFn: () => api.get('/posts/search', { params: { q: query } }).then((res) => res.data),
    enabled: query?.length > 2,
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/posts', data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/posts/${id}`, data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};
