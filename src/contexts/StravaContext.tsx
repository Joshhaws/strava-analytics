import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the Strava context interface
interface StravaContextProps {
  isStravaConnected: boolean;
  setIsStravaConnected: React.Dispatch<React.SetStateAction<boolean>>;
  checkStravaConnection: () => Promise<void>;
  resetStravaState: () => void;
  refreshStravaState: () => Promise<void>;
}

// Create the StravaContext
const StravaContext = createContext<StravaContextProps | undefined>(undefined);

// Provider for the Strava context
export const StravaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isStravaConnected, setIsStravaConnected] = useState(() => {
    const saved = localStorage.getItem('isStravaConnected');
    if (saved === null || saved === 'undefined') return false;

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Invalid JSON in localStorage for isStravaConnected:', error);
      return false; // Default to false on error
    }
  });

  // Check if the current user is connected to Strava
  const checkStravaConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/strava/connection', {
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
  };

  // Reset the Strava connection state
  const resetStravaState = () => {
    setIsStravaConnected(false);
    localStorage.removeItem('isStravaConnected');
  };

  // Refresh the Strava connection state
  const refreshStravaState = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/strava/connection', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Strava connection');
      }

      const data = await response.json();
      setIsStravaConnected(data.connected);
      localStorage.setItem('isStravaConnected', JSON.stringify(data.connected));
    } catch (error) {
      console.error('Error refreshing Strava connection:', error);
      resetStravaState(); // Reset on error
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkStravaConnection();
  }, []);

  return (
    <StravaContext.Provider
      value={{
        isStravaConnected,
        setIsStravaConnected,
        checkStravaConnection,
        resetStravaState,
        refreshStravaState,
      }}
    >
      {children}
    </StravaContext.Provider>
  );
};

// Hook to use the Strava context
export const useStrava = () => {
  const context = useContext(StravaContext);
  if (!context) {
    throw new Error('useStrava must be used within a StravaProvider');
  }
  return context;
};
