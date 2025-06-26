import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, AuthResponse, LoginCredentials, RegisterData, User } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add JWT token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/auth/register', userData);
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data.data!;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await this.api.post<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<{ message: string; timestamp: string; environment: string; version: string }> {
    const response = await this.api.get<ApiResponse>('/health');
    return response.data.data!;
  }

  // Generic methods for other endpoints
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(endpoint);
    return response.data.data!;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(endpoint, data);
    return response.data.data!;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(endpoint, data);
    return response.data.data!;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(endpoint);
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService; 