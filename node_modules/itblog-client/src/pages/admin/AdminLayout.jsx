import { useQuery } from '@tanstack/react-query';
import { Link, Outlet } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-bg flex">
      <aside className="w-64 bg-bg-surface border-r border-bg-border flex flex-col">
        <div className="p-6 border-b border-bg-border">
          <Link to="/" className="font-display text-xl font-bold text-txt-primary">
            IT<span className="text-accent">Blog</span>
            <span className="text-txt-muted text-sm ml-2">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/posts">Posts</NavLink>
          <NavLink to="/admin/posts/new">New Post</NavLink>
          <NavLink to="/admin/comments">Comments</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>

        <div className="p-4 border-t border-bg-border">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <p className="text-txt-primary font-medium">{user?.displayName}</p>
              <p className="text-txt-muted text-xs">{user?.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/" className="block btn-secondary text-center text-sm">
              View Site
            </Link>
            <button onClick={handleLogout} className="w-full btn text-sm text-txt-muted hover:text-status-danger">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-bg-hover transition-colors"
    >
      {children}
    </Link>
  );
}
