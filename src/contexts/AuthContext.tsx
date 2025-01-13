import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStrava } from './StravaContext'; // Import the Strava context

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  handleStravaCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Access Strava state and functions from StravaContext
  const { setIsStravaConnected, checkStravaConnection } = useStrava();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with the server
      fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Invalid token');
          }
          return response.json();
        })
        .then((data) => {
          setUser({ id: data.userId, email: data.email });

          // Check Strava connection on successful token verification
          checkStravaConnection();
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setIsStravaConnected(false); // Reset Strava state on invalid token
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // Set loading to false if no token is found
    }
  }, [checkStravaConnection, setIsStravaConnected]);

  const handleSignIn = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);

    // Check Strava connection after signing in
    await checkStravaConnection();
  };

  const handleSignUp = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);

    // Optionally check Strava connection after signing up
    await checkStravaConnection();
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).catch((err) => console.error('Logout error:', err));

    localStorage.removeItem('token');
    setUser(null);

    // Reset Strava state on logout
    setIsStravaConnected(false);

    window.location.href = '/login'; // Redirect to login page
  };

  const handleStravaCallback = async (code: string) => {
    // Handle Strava callback to exchange code for token
    const response = await fetch('http://localhost:3001/api/strava/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect with Strava');
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);

    // Refresh Strava connection state after callback
    await checkStravaConnection();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        handleStravaCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
