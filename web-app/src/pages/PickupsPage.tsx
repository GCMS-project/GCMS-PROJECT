import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import type { PickupRequest } from '../types';

const PickupsPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    waste_type: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchPickups();
  }, [filters]);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
      
      const response = await apiService.get<{ data: PickupRequest[] }>(`/pickups?${queryParams.toString()}`);
      setPickups(response.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch pickups');
      console.error('Error fetching pickups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      verified: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getWasteTypeColor = (type: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      recyclable: 'bg-green-100 text-green-800',
      hazardous: 'bg-red-100 text-red-800',
      organic: 'bg-brown-100 text-brown-800',
      construction: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = async (pickupId: string, newStatus: string) => {
    try {
      await apiService.put(`/pickups/${pickupId}`, { status: newStatus });
      toast.success('Pickup status updated successfully');
      fetchPickups();
    } catch (error: any) {
      toast.error('Failed to update pickup status');
    }
  };

  const handleAssignPickup = async (pickupId: string) => {
    try {
      await apiService.post(`/pickups/${pickupId}/assign`, { picker_id: user?.id });
      toast.success('Pickup assigned successfully');
      fetchPickups();
    } catch (error: any) {
      toast.error('Failed to assign pickup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pickup Management</h1>
              <p className="text-gray-600 mt-1">Manage and track pickup requests</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/pickups/new')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-300"
              >
                + New Pickup
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.waste_type}
              onChange={(e) => setFilters({ ...filters, waste_type: e.target.value })}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="">All Waste Types</option>
              <option value="general">General</option>
              <option value="recyclable">Recyclable</option>
              <option value="hazardous">Hazardous</option>
              <option value="organic">Organic</option>
              <option value="construction">Construction</option>
            </select>
          </div>
        </div>

        {/* Pickups List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading pickups...</div>
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No pickups found</div>
              <button
                onClick={() => navigate('/pickups/new')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Pickup
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Address</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Waste Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.map((pickup) => (
                    <tr key={pickup.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {pickup.id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pickup.address}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWasteTypeColor(pickup.waste_type)}`}>
                          {pickup.waste_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {pickup.quantity} kg
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(pickup.status)}`}>
                          {pickup.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(pickup.scheduled_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/pickups/${pickup.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          
                          {hasRole(['admin', 'tender_officer']) && pickup.status === 'pending' && (
                            <button
                              onClick={() => handleAssignPickup(pickup.id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Assign
                            </button>
                          )}
                          
                          {hasRole('picker') && pickup.status === 'assigned' && (
                            <button
                              onClick={() => handleStatusUpdate(pickup.id, 'in_progress')}
                              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                            >
                              Start
                            </button>
                          )}
                          
                          {hasRole('picker') && pickup.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(pickup.id, 'completed')}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupsPage; 