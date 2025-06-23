const { z } = require('zod');

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[1-9]\d{1,14}$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// User validation schemas
const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(phonePattern, 'Invalid phone number format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordPattern, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(100),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const userLoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

const userUpdateSchema = z.object({
  first_name: z.string().min(2).max(100).optional(),
  last_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(phonePattern).optional(),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  profile_image_url: z.string().url().optional(),
});

// Pickup request validation schemas
const pickupRequestSchema = z.object({
  dump_site_id: z.string().uuid('Invalid dump site ID'),
  pickup_location_address: z.string().min(10, 'Address must be at least 10 characters'),
  pickup_latitude: z.number().min(-90).max(90),
  pickup_longitude: z.number().min(-180).max(180),
  waste_type: z.string().min(2, 'Waste type must be at least 2 characters').max(100),
  waste_quantity_kg: z.number().positive('Waste quantity must be positive').max(10000, 'Waste quantity cannot exceed 10,000 kg'),
  estimated_pickup_time: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).default(1),
  special_instructions: z.string().max(500).optional(),
});

const pickupUpdateSchema = z.object({
  assigned_picker_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'verified']).optional(),
  actual_pickup_time: z.string().datetime().optional(),
  photos: z.array(z.string().url()).optional(),
});

// Dump verification validation schemas
const dumpVerificationSchema = z.object({
  pickup_request_id: z.string().uuid('Invalid pickup request ID'),
  verification_level: z.enum(['requester', 'picker', 'dumpsite_officer']),
  is_verified: z.boolean(),
  verification_notes: z.string().max(1000).optional(),
  verification_photos: z.array(z.string().url()).optional(),
});

// Tender validation schemas
const tenderSchema = z.object({
  pickup_request_id: z.string().uuid('Invalid pickup request ID'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  base_price: z.number().positive('Base price must be positive'),
  max_price: z.number().positive('Max price must be positive').optional(),
  open_date: z.string().datetime(),
  close_date: z.string().datetime(),
}).refine((data) => new Date(data.close_date) > new Date(data.open_date), {
  message: 'Close date must be after open date',
  path: ['close_date'],
});

const tenderUpdateSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  base_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  status: z.enum(['open', 'closed', 'awarded', 'cancelled']).optional(),
  awarded_to: z.string().uuid().optional(),
});

// Bid validation schemas
const bidSchema = z.object({
  tender_id: z.string().uuid('Invalid tender ID'),
  bid_amount: z.number().positive('Bid amount must be positive'),
  bid_notes: z.string().max(500).optional(),
});

const bidUpdateSchema = z.object({
  bid_amount: z.number().positive().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'expired']).optional(),
  bid_notes: z.string().max(500).optional(),
});

// Payment validation schemas
const paymentSchema = z.object({
  pickup_request_id: z.string().uuid('Invalid pickup request ID'),
  payee_id: z.string().uuid('Invalid payee ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('TZS'),
  payment_method: z.string().max(50).optional(),
  transaction_id: z.string().max(255).optional(),
});

const paymentUpdateSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  payment_date: z.string().datetime().optional(),
  refund_amount: z.number().positive().optional(),
});

// Notification validation schemas
const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['pickup_request', 'bid_update', 'payment', 'verification', 'system']),
  data: z.record(z.any()).optional(),
});

// Query parameter validation schemas
const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

const pickupQuerySchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'verified']).optional(),
  requester_id: z.string().uuid().optional(),
  assigned_picker_id: z.string().uuid().optional(),
  waste_type: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
}).merge(paginationSchema);

// UUID validation schema
const uuidSchema = z.string().uuid('Invalid UUID format');

// Search validation schema
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
}).merge(paginationSchema);

module.exports = {
  // User schemas
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  
  // Pickup schemas
  pickupRequestSchema,
  pickupUpdateSchema,
  pickupQuerySchema,
  
  // Verification schemas
  dumpVerificationSchema,
  
  // Tender schemas
  tenderSchema,
  tenderUpdateSchema,
  
  // Bid schemas
  bidSchema,
  bidUpdateSchema,
  
  // Payment schemas
  paymentSchema,
  paymentUpdateSchema,
  
  // Notification schemas
  notificationSchema,
  
  // Common schemas
  paginationSchema,
  uuidSchema,
  searchSchema,
  
  // Validation patterns
  emailPattern,
  phonePattern,
  passwordPattern,
}; 