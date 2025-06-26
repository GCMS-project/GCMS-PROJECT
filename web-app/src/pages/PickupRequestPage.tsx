import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  pickup_location_address: yup.string().required('Pickup address is required'),
  pickup_latitude: yup.number().required('Latitude is required'),
  pickup_longitude: yup.number().required('Longitude is required'),
  waste_type: yup.string().required('Waste type is required'),
  waste_quantity_kg: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  estimated_pickup_time: yup.string().required('Estimated pickup time is required'),
  special_instructions: yup.string().optional(),
});

const wasteTypes = [
  { value: 'general', label: 'General Waste' },
  { value: 'recyclable', label: 'Recyclable' },
  { value: 'hazardous', label: 'Hazardous' },
  { value: 'organic', label: 'Organic' },
  { value: 'construction', label: 'Construction' },
];

const PickupRequestPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      waste_type: 'general',
      priority: 3,
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await apiService.post('/pickups', data);
      toast.success('Pickup request created successfully!');
      navigate('/pickups');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create pickup request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setValue('pickup_location_address', address);
    setValue('pickup_latitude', lat);
    setValue('pickup_longitude', lng);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Request Pickup</h1>
            <button
              onClick={() => navigate('/pickups')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Pickups
            </button>
          </div>
          <p className="text-gray-600">Create a new pickup request for waste collection</p>
        </div>

        {/* Pickup Request Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Location Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Address *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter pickup address"
                    {...register('pickup_location_address')}
                  />
                  {errors.pickup_location_address && (
                    <p className="text-red-600 text-sm mt-1">{errors.pickup_location_address.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                      placeholder="0.000000"
                      {...register('pickup_latitude')}
                    />
                    {errors.pickup_latitude && (
                      <p className="text-red-600 text-sm mt-1">{errors.pickup_latitude.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                      placeholder="0.000000"
                      {...register('pickup_longitude')}
                    />
                    {errors.pickup_longitude && (
                      <p className="text-red-600 text-sm mt-1">{errors.pickup_longitude.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Waste Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waste Type *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    {...register('waste_type')}
                  >
                    {wasteTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.waste_type && (
                    <p className="text-red-600 text-sm mt-1">{errors.waste_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter quantity in kilograms"
                    {...register('waste_quantity_kg')}
                  />
                  {errors.waste_quantity_kg && (
                    <p className="text-red-600 text-sm mt-1">{errors.waste_quantity_kg.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Pickup Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    {...register('estimated_pickup_time')}
                  />
                  {errors.estimated_pickup_time && (
                    <p className="text-red-600 text-sm mt-1">{errors.estimated_pickup_time.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    {...register('priority')}
                  >
                    <option value={1}>1 - Low Priority</option>
                    <option value={2}>2 - Normal Priority</option>
                    <option value={3}>3 - Medium Priority</option>
                    <option value={4}>4 - High Priority</option>
                    <option value={5}>5 - Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                placeholder="Any special instructions for the pickup..."
                {...register('special_instructions')}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/pickups')}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Request...' : 'Create Pickup Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PickupRequestPage; 