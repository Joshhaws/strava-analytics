import React, { createContext, useContext, useState, useEffect } from 'react';

interface StravaContextProps {
  isStravaConnected: boolean;
  checkStravaConnection: () => Promise<void>;
}

const StravaContext = createContext<StravaContextProps | undefined>(undefined);

export const StravaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStravaConnected, setIsStravaConnected] = useState(() => {
    const saved = localStorage.getItem('isStravaConnected');

    // Validate and parse the saved value
    if (saved === null || saved === "undefined") {
      return false;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Invalid JSON in localStorage for isStravaConnected:', error);
      return false; // Default to false on error
    }
  });

  async function checkStravaConnection() {
    try {
      const response = await fetch('http://localhost:3001/api/strava/connection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && typeof data.connected === 'boolean') {
        setIsStravaConnected(data.connected);
        localStorage.setItem('isStravaConnected', JSON.stringify(data.connected));
      } else {
        console.error('Unexpected API response:', data);
      }
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
