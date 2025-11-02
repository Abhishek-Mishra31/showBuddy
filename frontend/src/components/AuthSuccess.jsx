import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authenticateWithToken } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      (async () => {
        const result = await authenticateWithToken(token);
        if (result.success) {
          toast.success('Signed in with Google');
          navigate('/');
        } else {
          toast.error('Google sign-in failed');
          navigate('/');
        }
      })();
    } else {
      toast.error('Google sign-in failed: missing token');
      navigate('/');
    }
  }, [searchParams, authenticateWithToken, toast, navigate]);

  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Completing sign-in…</h2>
      <p>Please wait while we finalize your login.</p>
    </div>
  );
};

export default AuthSuccess;