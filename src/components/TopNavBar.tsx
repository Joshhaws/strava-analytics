import React from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopNavBarProps {
  isStravaConnected: boolean;
  onRefresh: () => void;
  onConnect: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ isStravaConnected, onRefresh, onConnect }) => {
  const { signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Strava Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            {!isStravaConnected && (
              <button
                onClick={onConnect}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Connect Strava
              </button>
            )}
            {isStravaConnected && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
