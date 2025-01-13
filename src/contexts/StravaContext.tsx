import React, { createContext, useContext, useState, useEffect } from 'react';

interface StravaContextProps {
  isStravaConnected: boolean;
  checkStravaConnection: () => Promise<void>;
}

const StravaContext = createContext<StravaContextProps | undefined>(undefined);

export const StravaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStravaConnected, setIsStravaConnected] = useState(() => {
    // Initialize from local storage
    const saved = localStorage.getItem('isStravaConnected');
    return saved ? JSON.parse(saved) : false;
  });

  async function checkStravaConnection() {
    try {
      const response = await fetch('http://localhost:3001/api/strava/connection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setIsStravaConnected(data.connected);
      // Persist the state
      localStorage.setItem('isStravaConnected', JSON.stringify(data.connected));
    } catch (error) {
      console.error('Error checking Strava connection:', error);
    }
  }

  useEffect(() => {
    checkStravaConnection();
  }, []);

  return (
    <StravaContext.Provider value={{ isStravaConnected, checkStravaConnection }}>
      {children}
    </StravaContext.Provider>
  );
};

export const useStrava = () => {
  const context = useContext(StravaContext);
  if (!context) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
};
