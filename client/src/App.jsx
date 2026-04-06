import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Home from './pages/public/Home';
import PostDetail from './pages/public/PostDetail';
import SearchPage from './pages/public/SearchPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/admin/Dashboard';
import Posts from './pages/admin/Posts';
import PostEditor from './pages/admin/PostEditor';
import EditPost from './pages/admin/EditPost';
import Settings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';

function AdminRoute() {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog/:slug" element={<PostDetail />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/posts" element={<Posts />} />
        <Route path="/admin/posts/new" element={<PostEditor />} />
        <Route path="/admin/posts/:id/edit" element={<EditPost />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
