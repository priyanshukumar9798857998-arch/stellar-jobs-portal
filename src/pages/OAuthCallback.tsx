import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { setToken } from '@/utils/auth';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get token from query params or hash
    let token = searchParams.get('token');

    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('token');
    }

    if (token) {
      setToken(token);
      navigate('/jobs', { replace: true });
    } else {
      const errorParam = searchParams.get('error');
      setError(errorParam || 'Authentication failed. No token received.');
    }
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="space-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="card-glass max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--destructive)/0.2)] flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[hsl(var(--destructive))]" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-[hsl(var(--foreground))]">
            Authentication Failed
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="space-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="card-glass text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--primary))] mx-auto mb-4" />
        <p className="text-[hsl(var(--muted-foreground))]">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
