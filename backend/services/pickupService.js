const { query } = require('../config/database');
const { ApiError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

class PickupService {
  /**
   * Create a new pickup request
   */
  async createPickup(pickupData, requesterId) {
    const {
      dump_site_id,
      pickup_location_address,
      pickup_latitude,
      pickup_longitude,
      waste_type,
      waste_quantity_kg,
      estimated_pickup_time,
      priority,
      special_instructions
    } = pickupData;

    // Verify dump site exists and is active
    const dumpSiteResult = await query(
      'SELECT id, name FROM dump_sites WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
      [dump_site_id]
    );

    if (dumpSiteResult.rows.length === 0) {
      throw new ApiError(404, 'Dump site not found or inactive', 'DUMP_SITE_NOT_FOUND');
    }

    // Create pickup request
    const result = await query(
      `INSERT INTO pickup_requests (
        requester_id, dump_site_id, pickup_location_address, 
        pickup_latitude, pickup_longitude, waste_type, 
        waste_quantity_kg, estimated_pickup_time, priority, 
        special_instructions, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        requesterId, dump_site_id, pickup_location_address,
        pickup_latitude, pickup_longitude, waste_type,
        waste_quantity_kg, estimated_pickup_time, priority,
        special_instructions, requesterId
      ]
    );

    const pickup = result.rows[0];
    logger.info('Pickup request created', { 
      pickupId: pickup.id, 
      requesterId, 
      wasteType: waste_type,
      quantity: waste_quantity_kg 
    });

    return pickup;
  }

  /**
   * Get pickup request by ID with related data
   */
  async getPickupById(pickupId) {
    const result = await query(
      `SELECT 
        pr.*,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        u.email as requester_email,
        u.phone as requester_phone,
        p.first_name as picker_first_name,
        p.last_name as picker_last_name,
        p.email as picker_email,
        p.phone as picker_phone,
        ds.name as dump_site_name,
        ds.address as dump_site_address,
        ds.latitude as dump_site_latitude,
        ds.longitude as dump_site_longitude
       FROM pickup_requests pr
       LEFT JOIN users u ON pr.requester_id = u.id
       LEFT JOIN users p ON pr.assigned_picker_id = p.id
       LEFT JOIN dump_sites ds ON pr.dump_site_id = ds.id
       WHERE pr.id = $1 AND pr.deleted_at IS NULL`,
      [pickupId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Pickup request not found', 'PICKUP_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Get pickup requests with filters and pagination
   */
  async getPickups(filters = {}, pagination = {}) {
    const {
      status,
      requester_id,
      assigned_picker_id,
      waste_type,
      start_date,
      end_date
    } = filters;

    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc' } = pagination;

    let whereConditions = ['pr.deleted_at IS NULL'];
    let queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereConditions.push(`pr.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (requester_id) {
      paramCount++;
      whereConditions.push(`pr.requester_id = $${paramCount}`);
      queryParams.push(requester_id);
    }

    if (assigned_picker_id) {
      paramCount++;
      whereConditions.push(`pr.assigned_picker_id = $${paramCount}`);
      queryParams.push(assigned_picker_id);
    }

    if (waste_type) {
      paramCount++;
      whereConditions.push(`pr.waste_type ILIKE $${paramCount}`);
      queryParams.push(`%${waste_type}%`);
    }

    if (start_date) {
      paramCount++;
      whereConditions.push(`pr.created_at >= $${paramCount}`);
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereConditions.push(`pr.created_at <= $${paramCount}`);
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM pickup_requests pr WHERE ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total);

    // Get pickups
    const offset = (page - 1) * limit;
    const pickupsResult = await query(
      `SELECT 
        pr.*,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        u.email as requester_email,
        p.first_name as picker_first_name,
        p.last_name as picker_last_name,
        ds.name as dump_site_name
       FROM pickup_requests pr
       LEFT JOIN users u ON pr.requester_id = u.id
       LEFT JOIN users p ON pr.assigned_picker_id = p.id
       LEFT JOIN dump_sites ds ON pr.dump_site_id = ds.id
       WHERE ${whereClause}
       ORDER BY pr.${sort_by} ${sort_order}
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...queryParams, limit, offset]
    );

    return {
      pickups: pickupsResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update pickup request
   */
  async updatePickup(pickupId, updateData, userId) {
    const {
      assigned_picker_id,
      status,
      actual_pickup_time,
      photos
    } = updateData;

    // Validate status transition
    if (status) {
      const currentPickup = await this.getPickupById(pickupId);
      const validTransitions = this.getValidStatusTransitions(currentPickup.status);
      
      if (!validTransitions.includes(status)) {
        throw new ApiError(400, `Invalid status transition from ${currentPickup.status} to ${status}`, 'INVALID_STATUS_TRANSITION');
      }
    }

    // If assigning a picker, verify the picker exists and has the right role
    if (assigned_picker_id) {
      const pickerResult = await query(
        'SELECT id, role FROM users WHERE id = $1 AND role = $2 AND is_active = true AND deleted_at IS NULL',
        [assigned_picker_id, 'picker']
      );

      if (pickerResult.rows.length === 0) {
        throw new ApiError(404, 'Picker not found or invalid role', 'PICKER_NOT_FOUND');
      }
    }

    const result = await query(
      `UPDATE pickup_requests 
       SET assigned_picker_id = COALESCE($1, assigned_picker_id),
           status = COALESCE($2, status),
           actual_pickup_time = COALESCE($3, actual_pickup_time),
           photos = COALESCE($4, photos),
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $5
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [assigned_picker_id, status, actual_pickup_time, photos, userId, pickupId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Pickup request not found', 'PICKUP_NOT_FOUND');
    }

    const pickup = result.rows[0];
    logger.info('Pickup request updated', { 
      pickupId, 
      userId, 
      updatedFields: Object.keys(updateData),
      newStatus: status 
    });

    return pickup;
  }

  /**
   * Delete pickup request (soft delete)
   */
  async deletePickup(pickupId, userId) {
    const result = await query(
      'UPDATE pickup_requests SET deleted_at = CURRENT_TIMESTAMP, updated_by = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING id',
      [userId, pickupId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Pickup request not found', 'PICKUP_NOT_FOUND');
    }

    logger.info('Pickup request deleted', { pickupId, userId });

    return { message: 'Pickup request deleted successfully' };
  }

  /**
   * Get valid status transitions for a pickup
   */
  getValidStatusTransitions(currentStatus) {
    const transitions = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': ['verified'],
      'verified': [],
      'cancelled': []
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Get pickup statistics
   */
  async getPickupStats() {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_pickups,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_pickups,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned_pickups,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_pickups,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_pickups,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_pickups,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_pickups,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_pickups_30_days,
        SUM(waste_quantity_kg) as total_waste_kg,
        AVG(waste_quantity_kg) as avg_waste_kg
      FROM pickup_requests 
      WHERE deleted_at IS NULL
    `);

    return statsResult.rows[0];
  }

  /**
   * Get pickups by location (nearby pickups)
   */
  async getNearbyPickups(latitude, longitude, radiusKm = 10, limit = 20) {
    const result = await query(
      `SELECT 
        pr.*,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name,
        ds.name as dump_site_name,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(pr.pickup_latitude)) *
            cos(radians(pr.pickup_longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(pr.pickup_latitude))
          )
        ) AS distance_km
       FROM pickup_requests pr
       LEFT JOIN users u ON pr.requester_id = u.id
       LEFT JOIN dump_sites ds ON pr.dump_site_id = ds.id
       WHERE pr.deleted_at IS NULL 
         AND pr.status IN ('pending', 'assigned')
       HAVING (
         6371 * acos(
           cos(radians($1)) * cos(radians(pr.pickup_latitude)) *
           cos(radians(pr.pickup_longitude) - radians($2)) +
           sin(radians($1)) * sin(radians(pr.pickup_latitude))
         )
       ) <= $3
       ORDER BY distance_km ASC
       LIMIT $4`,
      [latitude, longitude, radiusKm, limit]
    );

    return result.rows;
  }
}

module.exports = new PickupService(); 