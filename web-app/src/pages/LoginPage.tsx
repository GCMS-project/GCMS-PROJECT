import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';

const schema = yup.object().shape({
  identifier: yup.string().required('Email or phone is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      await login(data);
      navigate('/');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl shadow-lg mb-4">
            <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            GCMS
          </h1>
          <p className="text-slate-600 mt-2">Garbage Collection Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{t('login')}</h2>
            <p className="text-slate-600 mt-1">Welcome back! Please sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('email')}/{t('phone')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
                <input 
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your email or phone"
                  {...register('identifier')} 
                />
              </div>
              {errors.identifier && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your password"
                  {...register('password')} 
                />
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  {t('login')}
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Contact administrator
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            © 2024 GCMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 