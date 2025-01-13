import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HomeIcon, TableIcon, AnalyticsIcon, SettingsIcon } from './Icons';
import TopNavBar from './TopNavBar';
import { useStrava } from '../contexts/StravaContext';

export default function Layout() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const { isStravaConnected, checkStravaConnection } = useStrava();

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md ${isSidebarMinimized ? 'w-16' : 'w-64'} transition-width duration-300`}>
        <div className="h-16 flex items-center justify-between border-b px-4">
          {!isSidebarMinimized && <h2 className="text-lg font-bold">Navigation</h2>}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="p-2 text-gray-700 hover:bg-gray-200 rounded-md"
          >
            {isSidebarMinimized ? '>' : '<'}
          </button>
        </div>
        <ul className="space-y-2 p-4">
          <li>
            <a href="/home" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded-md">
              <HomeIcon className="w-6 h-6" />
              {!isSidebarMinimized && <span className="ml-3">Home</span>}
            </a>
          </li>
          <li>
            <a href="/data" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded-md">
              <TableIcon className="w-6 h-6" />
              {!isSidebarMinimized && <span className="ml-3">Data</span>}
            </a>
          </li>
          <li>
            <a href="/analytics" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded-md">
              <AnalyticsIcon className="w-6 h-6" />
              {!isSidebarMinimized && <span className="ml-3">Analytics</span>}
            </a>
          </li>
          <li>
            <a href="/settings" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded-md">
              <SettingsIcon className="w-6 h-6" />
              {!isSidebarMinimized && <span className="ml-3">Settings</span>}
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <TopNavBar
          isStravaConnected={isStravaConnected}
          onRefresh={checkStravaConnection}
          onConnect={() => console.log('Connect to Strava')}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
