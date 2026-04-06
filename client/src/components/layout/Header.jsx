import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-bg-border bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-xl font-bold text-txt-primary">
            IT<span className="text-accent">Blog</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-txt-secondary hover:text-txt-primary transition-colors text-sm font-medium">
              Home
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.displayName} size="sm" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-txt-primary">{user.displayName}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-txt-muted hover:text-status-danger transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-txt-secondary hover:text-txt-primary transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
