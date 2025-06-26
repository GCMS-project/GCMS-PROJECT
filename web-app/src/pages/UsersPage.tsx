import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User, UserRole } from '../types';

const UsersPage: React.FC = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    email: '',
    phone: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'customer' as UserRole,
    address: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (selectedRole) params.append('role', selectedRole);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/users?${params}`);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/register', registrationForm);
      
      if (response.data.success) {
        setShowRegistrationForm(false);
        setRegistrationForm({
          email: '',
          phone: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'customer',
          address: ''
        });
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await api.delete(`/users/${userId}`);
      
      if (response.data.success) {
        fetchUsers();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'tender_officer': return 'bg-purple-100 text-purple-800';
      case 'dumpsite_officer': return 'bg-blue-100 text-blue-800';
      case 'picker': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Inactive</span>;
    }
    if (!user.is_verified) {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Unverified</span>;
    }
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>;
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage system users and their roles</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="tender_officer">Tender Officer</option>
                <option value="dumpsite_officer">Dump Site Officer</option>
                <option value="picker">Picker</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Add New User
          </button>
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register New User</h2>
            <form onSubmit={handleRegisterUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({...registrationForm, email: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({...registrationForm, phone: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    value={registrationForm.password}
                    onChange={(e) => setRegistrationForm({...registrationForm, password: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={registrationForm.first_name}
                      onChange={(e) => setRegistrationForm({...registrationForm, first_name: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={registrationForm.last_name}
                      onChange={(e) => setRegistrationForm({...registrationForm, last_name: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={registrationForm.role}
                    onChange={(e) => setRegistrationForm({...registrationForm, role: e.target.value as UserRole})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  >
                    <option value="customer">Customer</option>
                    <option value="picker">Picker</option>
                    <option value="dumpsite_officer">Dump Site Officer</option>
                    <option value="tender_officer">Tender Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={registrationForm.address}
                    onChange={(e) => setRegistrationForm({...registrationForm, address: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Register User
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegistrationForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {/* TODO: Edit user */}}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 