import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StravaProvider } from './contexts/StravaContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Data from './pages/Data';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Show a loading indicator while checking auth
    return user ? <>{children}</> : <Navigate to="/login" />;
  }

  return (
    <StravaProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Outlet />
                  </Layout>
                </PrivateRoute>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="data" element={<Data />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </StravaProvider>
  );
}
