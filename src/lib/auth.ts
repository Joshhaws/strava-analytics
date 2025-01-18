import pool from './db';

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('http://localhost:8000/api/auth/signin', {
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
  const data = await response.json()
  localStorage.setItem('token', data.token); 

  return data;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('http://localhost:8000/api/auth/signup', {
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

  return response.json();
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const response = await fetch('http://localhost:8000/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}