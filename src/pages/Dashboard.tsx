import React, { useEffect, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { initiateStravaAuth } from '../lib/strava';
import { LogOut, RefreshCw } from 'lucide-react';
import { StravaIcon } from '../components/StravaIcon';
import { useAuth } from '../contexts/AuthContext';

interface Activity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  average_speed: number;
  total_elevation_gain: number;
}

const columnHelper = createColumnHelper<Activity>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Activity',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('start_date', {
    header: 'Date',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('distance', {
    header: 'Distance (km)',
    cell: (info) => (info.getValue() / 1000).toFixed(2),
  }),
  columnHelper.accessor('moving_time', {
    header: 'Time',
    cell: (info) => {
      const minutes = Math.floor(info.getValue() / 60);
      const seconds = info.getValue() % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
  }),
  columnHelper.accessor('average_speed', {
    header: 'Avg Speed (km/h)',
    cell: (info) => (info.getValue() * 3.6).toFixed(2),
  }),
  columnHelper.accessor('total_elevation_gain', {
    header: 'Elevation (m)',
    cell: (info) => info.getValue().toFixed(0),
  }),
];

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const { user, signOut } = useAuth();

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (user) {
      checkStravaConnection();
      loadActivities();
    }
  }, [user]);

  async function checkStravaConnection() {
    try {
      const response = await fetch('http://localhost:3001/api/strava/connection', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setIsStravaConnected(data.connected);
    } catch (error) {
      console.error('Error checking Strava connection:', error);
    }
  }

  async function loadActivities() {
    try {
      const response = await fetch('http://localhost:3001/api/activities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Strava Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isStravaConnected && (
                <button
                  onClick={initiateStravaAuth}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  <StravaIcon className="w-5 h-5 mr-2" />
                  Connect Strava
                </button>
              )}
              {isStravaConnected && (
                <button
                  onClick={loadActivities}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}