// User types
export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  profile_image_url?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'customer' | 'picker' | 'dumpsite_officer' | 'tender_officer';

// Authentication types
export interface LoginCredentials {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  last_login?: string;
}

// Pickup types
export interface PickupRequest {
  id: string;
  customer_id: string;
  customer: User;
  picker_id?: string;
  picker?: User;
  status: PickupStatus;
  waste_type: WasteType;
  quantity: number;
  unit: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  scheduled_date: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export type PickupStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type WasteType = 'general' | 'recyclable' | 'hazardous' | 'organic' | 'construction';

// Dump site types
export interface DumpSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_usage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Dashboard stats
export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_pickups: number;
  pending_pickups: number;
  completed_pickups: number;
  active_tenders: number;
  pending_verifications: number;
}

// i18n types
export interface Translation {
  [key: string]: string | Translation;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Navigation types
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: UserRole[];
  children?: MenuItem[];
} 