import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function LikeButton({ postId, initialCount, onLoginRequired }) {
  const { user, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [liked, setLiked] = useLocalStorage(`liked-${postId}`, false);
  const [count, setCount] = useState(initialCount);

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/likes/${postId}/like`).then((res) => res.data),
    onSuccess: (data) => {
      setLiked(data.liked);
      setCount(data.likeCount);
      qc.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  const handleClick = () => {
    if (!user || !accessToken) {
      onLoginRequired?.();
      return;
    }
    mutate();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
        ${liked
          ? 'bg-accent text-white border-accent shadow-glow-sm'
          : 'border-bg-border text-txt-secondary hover:border-accent hover:text-accent'
        }`}
    >
      <span className={`transition-transform ${liked ? 'scale-125' : ''}`}>
        {liked ? '♥' : '♡'}
      </span>
      <span className="text-sm font-medium">{count}</span>
    </button>
  );
}

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

import { useState } from 'react';
