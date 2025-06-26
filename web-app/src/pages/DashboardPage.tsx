import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, {user?.first_name}. Here's what's happening today.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Pickups */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-600">Total Pickups</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">1,247</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">+12.5% vs last month</p>
              </div>
              <div className="bg-blue-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm ml-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">1,089</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">+8.2% vs last month</p>
              </div>
              <div className="bg-green-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm ml-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1 sm:mt-2">158</p>
                <p className="text-xs sm:text-sm text-red-600 mt-1 sm:mt-2">-3.1% vs last month</p>
              </div>
              <div className="bg-yellow-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm ml-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-600 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-emerald-600">Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1 sm:mt-2">$45,230</p>
                <p className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">+15.3% vs last month</p>
              </div>
              <div className="bg-emerald-500/20 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-sm ml-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-emerald-600 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Chart Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-white/50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-0">Monthly Pickup Summary</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs sm:text-sm bg-blue-100 text-blue-700 rounded-lg font-medium">
                    This Month
                  </button>
                  <button className="px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                    Last Month
                  </button>
                </div>
              </div>
              <div className="h-60 sm:h-80 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-300/30 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-sm"></div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 font-medium">Chart Component</p>
                  <p className="text-xs sm:text-sm text-gray-400">Monthly pickup data visualization</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-white/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Pickup completed</p>
                  <p className="text-xs sm:text-sm text-gray-500">Downtown Area</p>
                  <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">New pickup scheduled</p>
                  <p className="text-xs sm:text-sm text-gray-500">Westside District</p>
                  <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">Route optimized</p>
                  <p className="text-xs sm:text-sm text-gray-500">North Zone</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 sm:mt-6 py-2 px-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md">
              View All Activity
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-white/50 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button 
                onClick={() => window.location.href = '/pickups/new'}
                className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-sm"></div>
                  <span className="text-xs sm:text-sm font-medium text-blue-900">New Pickup</span>
                </div>
              </button>
              <button 
                onClick={() => window.location.href = '/pickups'}
                className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm"></div>
                  <span className="text-xs sm:text-sm font-medium text-green-900">Manage Pickups</span>
                </div>
              </button>
              <button className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded-sm"></div>
                  <span className="text-xs sm:text-sm font-medium text-purple-900">View Reports</span>
                </div>
              </button>
              <button className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-600 rounded-sm"></div>
                  <span className="text-xs sm:text-sm font-medium text-orange-900">Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
