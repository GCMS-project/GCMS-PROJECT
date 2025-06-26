const { query } = require('../config/database');
const { hashPassword, comparePassword, generateToken, createUserPayload } = require('../utils/auth');
const { validateUserRegistration, validateUserUpdate } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const registerUser = async (req, res) => {
  try {
    const { error, value } = validateUserRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { email, phone, password, first_name, last_name, role = 'customer', address } = value;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, phone, password_hash, first_name, last_name, role, address, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, phone, first_name, last_name, role, is_verified, created_at`,
      [email, phone, passwordHash, first_name, last_name, role, address, req.user?.id]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(createUserPayload(user));

    logger.info('User registered successfully', { userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE deleted_at IS NULL';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get users
    const usersResult = await query(
      `SELECT id, email, phone, first_name, last_name, role, is_active, is_verified, 
              address, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, email, phone, first_name, last_name, role, is_active, is_verified,
              address, latitude, longitude, profile_image_url, created_at, updated_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateUserUpdate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(value[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP, updated_by = $${paramCount}`);
    params.push(req.user.id);
    paramCount++;
    params.push(id);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    logger.info('User updated successfully', { userId: id, updatedBy: req.user.id });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete user (soft delete)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete
    await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE id = $2',
      [req.user.id, id]
    );

    logger.info('User deleted successfully', { userId: id, deletedBy: req.user.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get user statistics
 */
const getStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_count,
        COUNT(CASE WHEN role = 'picker' THEN 1 END) as picker_count,
        COUNT(CASE WHEN role = 'dumpsite_officer' THEN 1 END) as dumpsite_officer_count,
        COUNT(CASE WHEN role = 'tender_officer' THEN 1 END) as tender_officer_count
      FROM users 
      WHERE deleted_at IS NULL
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get roles and permissions
 */
const getRoles = async (req, res) => {
  try {
    const result = await query(
      'SELECT name, description, permissions FROM roles ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getStats,
  getRoles
}; 