import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Briefcase } from 'lucide-react';
import { authAPI } from '@/utils/api';
import { setToken, setRefreshToken } from '@/utils/auth';
import { useToastContext } from '@/components/ToastContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    general?: string;
  }>({});

  const navigate = useNavigate();
  const { addToast } = useToastContext();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email, password);
      } else {
        response = await authAPI.register({ email, password, name });
      }

      const { token, refreshToken } = response.data;
      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      addToast({
        type: 'success',
        title: isLogin ? 'Welcome back!' : 'Account created!',
        message: 'Redirecting to jobs...',
      });

      navigate('/jobs');
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Authentication failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen split-layout">
      {/* Background Effects */}
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Left Panel - Hero */}
      <div className="split-left relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-96 h-96 opacity-20"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(250, 90%, 65%)" />
                <stop offset="50%" stopColor="hsl(200, 80%, 60%)" />
                <stop offset="100%" stopColor="hsl(280, 70%, 60%)" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="150" fill="none" stroke="url(#heroGradient)" strokeWidth="2" opacity="0.5">
              <animate attributeName="r" values="150;160;150" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="200" r="100" fill="none" stroke="url(#heroGradient)" strokeWidth="2" opacity="0.3">
              <animate attributeName="r" values="100;110;100" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="200" r="50" fill="url(#heroGradient)" opacity="0.2">
              <animate attributeName="r" values="50;55;50" dur="2s" repeatCount="indefinite" />
            </circle>
            <path
              d="M200 120 L200 280 M120 200 L280 200"
              stroke="url(#heroGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-[hsl(var(--primary-foreground))]" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Find Your Dream Job
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Connect with top companies and discover opportunities that match your
            skills and ambitions.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="split-right">
        <div className="w-full max-w-md">
          <div className="card-glass animate-fade-in">
            {/* Toggle */}
            <div className="flex rounded-lg overflow-hidden mb-8 border border-[hsl(var(--border))]">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrors({});
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrors({});
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-[hsl(var(--foreground))]">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-secondary w-full flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[hsl(var(--border))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                or with email
              </span>
              <div className="flex-1 h-px bg-[hsl(var(--border))]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Sign Up only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={`input-glass ${errors.name ? 'input-error' : ''}`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p id="name-error" className="form-error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`input-glass pl-12 ${errors.email ? 'input-error' : ''}`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="form-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input-glass pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    disabled={isLoading}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="form-error" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div
                  className="p-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.3)]"
                  role="alert"
                >
                  <p className="text-sm text-[hsl(var(--destructive))]">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="link font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="link">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
