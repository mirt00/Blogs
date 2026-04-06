import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-txt-muted hover:text-txt-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-2xl font-bold text-txt-primary">Settings</h1>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h2 className="font-medium text-txt-primary mb-4">Profile Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <span className="text-txt-muted w-24">Name:</span>
              <span className="text-txt-primary">{user?.displayName}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-txt-muted w-24">Username:</span>
              <span className="text-txt-primary">{user?.username}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-txt-muted w-24">Role:</span>
              <span className="text-txt-primary capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <hr className="border-bg-border" />

        <div>
          <h2 className="font-medium text-txt-primary mb-4">Change Password</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success text-sm">
              {success}
            </div>
          )}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-txt-primary mb-2">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className="input"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-primary mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="input"
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-primary mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="input"
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
