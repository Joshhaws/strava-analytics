import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { StravaProvider } from './contexts/StravaContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Data from './pages/Data';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  const [isStravaConnected, setIsStravaConnected] = useState(false);

  useEffect(() => {
    checkStravaConnection();
  }, []); // Automatically runs once when the component mounts.

  async function checkStravaConnection() {
    try {
      const response = await fetch('http://localhost:3001/api/strava/connection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setIsStravaConnected(data.connected);
    } catch (error) {
      console.error('Error checking Strava connection:', error);
    }
  }

  async function refreshData() {
    console.log('Refresh data logic goes here');
  }

  async function connectStrava() {
    console.log('Connect Strava logic goes here');
  }

  return (
    <AuthProvider>
      <StravaProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />

            <Route
              path="/"
              element={
                <Layout
                  isStravaConnected={isStravaConnected}
                  onRefresh={refreshData}
                  onConnect={connectStrava}
                >
                  <Outlet />
                </Layout>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="data" element={<Data />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StravaProvider>
    </AuthProvider>
  );
}
