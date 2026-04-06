import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('token-sent');
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email');
      setStatus('error');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');

    try {
      await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-bold text-txt-primary">
            IT<span className="text-accent">Blog</span>
          </Link>
          <p className="text-txt-secondary mt-2">
            {status === 'success' ? 'Password Reset Complete' : 'Reset Your Password'}
          </p>
        </div>

        <div className="card p-8 space-y-6">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="text-status-success text-lg">Password reset successful!</div>
              <p className="text-txt-secondary text-sm">You can now login with your new password.</p>
              <Link to="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          ) : status === 'token-sent' && resetToken ? (
            <>
              <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success text-sm">
                <p className="font-medium mb-2">Reset Token Generated (Dev Mode)</p>
                <p className="break-all font-mono text-xs">{resetToken}</p>
              </div>
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-txt-primary mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-primary mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/20 text-status-danger text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-txt-primary mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-txt-muted text-sm mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
