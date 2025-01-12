import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function StravaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleStravaCallback, loading } = useAuth();
  const code = searchParams.get('code');

  useEffect(() => {
    if (loading) return; // Wait for the loading state to be false

    if (!code) {
      navigate('/dashboard');
      return;
    }

    const authenticateStrava = async () => {
      try {
        await handleStravaCallback(code);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error with Strava authentication:', error);
        navigate('/dashboard');
      }
    };

    authenticateStrava();
  }, [code, loading, navigate, handleStravaCallback]);

  return <div>Loading...</div>;
}
