const { query } = require('../config/database');
const { ApiError } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

class VerificationService {
  /**
   * Create a dump verification
   */
  async createVerification(verificationData, verifierId) {
    const {
      pickup_request_id,
      verification_level,
      is_verified,
      verification_notes,
      verification_photos
    } = verificationData;

    // Verify pickup request exists and is completed
    const pickupResult = await query(
      'SELECT id, status FROM pickup_requests WHERE id = $1 AND deleted_at IS NULL',
      [pickup_request_id]
    );

    if (pickupResult.rows.length === 0) {
      throw new ApiError(404, 'Pickup request not found', 'PICKUP_NOT_FOUND');
    }

    const pickup = pickupResult.rows[0];
    if (pickup.status !== 'completed') {
      throw new ApiError(400, 'Pickup must be completed before verification', 'INVALID_PICKUP_STATUS');
    }

    // Check if verification already exists for this level
    const existingVerification = await query(
      'SELECT id FROM dump_verifications WHERE pickup_request_id = $1 AND verification_level = $2',
      [pickup_request_id, verification_level]
    );

    if (existingVerification.rows.length > 0) {
      throw new ApiError(409, 'Verification already exists for this level', 'VERIFICATION_EXISTS');
    }

    // Create verification
    const result = await query(
      `INSERT INTO dump_verifications (
        pickup_request_id, verifier_id, verification_level, 
        is_verified, verification_notes, verification_photos, 
        verified_at, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        pickup_request_id, verifierId, verification_level,
        is_verified, verification_notes, verification_photos || [],
        is_verified ? new Date().toISOString() : null, verifierId
      ]
    );

    const verification = result.rows[0];

    // If verification is successful, check if all levels are verified
    if (is_verified) {
      await this.checkAllVerificationsComplete(pickup_request_id);
    }

    logger.info('Dump verification created', {
      verificationId: verification.id,
      pickupRequestId: pickup_request_id,
      verifierId,
      verificationLevel: verification_level,
      isVerified: is_verified
    });

    return verification;
  }

  /**
   * Get verification by ID
   */
  async getVerificationById(verificationId) {
    const result = await query(
      `SELECT 
        dv.*,
        u.first_name as verifier_first_name,
        u.last_name as verifier_last_name,
        u.email as verifier_email,
        pr.waste_type,
        pr.waste_quantity_kg,
        pr.pickup_location_address
       FROM dump_verifications dv
       LEFT JOIN users u ON dv.verifier_id = u.id
       LEFT JOIN pickup_requests pr ON dv.pickup_request_id = pr.id
       WHERE dv.id = $1`,
      [verificationId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Verification not found', 'VERIFICATION_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Get verifications by pickup request ID
   */
  async getVerificationsByPickup(pickupRequestId) {
    const result = await query(
      `SELECT 
        dv.*,
        u.first_name as verifier_first_name,
        u.last_name as verifier_last_name,
        u.email as verifier_email
       FROM dump_verifications dv
       LEFT JOIN users u ON dv.verifier_id = u.id
       WHERE dv.pickup_request_id = $1
       ORDER BY dv.verification_level, dv.created_at`,
      [pickupRequestId]
    );

    return result.rows;
  }

  /**
   * Update verification
   */
  async updateVerification(verificationId, updateData, userId) {
    const {
      is_verified,
      verification_notes,
      verification_photos
    } = updateData;

    const result = await query(
      `UPDATE dump_verifications 
       SET is_verified = COALESCE($1, is_verified),
           verification_notes = COALESCE($2, verification_notes),
           verification_photos = COALESCE($3, verification_photos),
           verified_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE verified_at END,
           updated_at = CURRENT_TIMESTAMP,
           updated_by = $4
       WHERE id = $5
       RETURNING *`,
      [is_verified, verification_notes, verification_photos, userId, verificationId]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'Verification not found', 'VERIFICATION_NOT_FOUND');
    }

    const verification = result.rows[0];

    // If verification status changed to true, check if all levels are complete
    if (is_verified === true) {
      await this.checkAllVerificationsComplete(verification.pickup_request_id);
    }

    logger.info('Verification updated', {
      verificationId,
      userId,
      isVerified: is_verified
    });

    return verification;
  }

  /**
   * Check if all verification levels are complete for a pickup
   */
  async checkAllVerificationsComplete(pickupRequestId) {
    const result = await query(
      `SELECT verification_level, is_verified 
       FROM dump_verifications 
       WHERE pickup_request_id = $1`,
      [pickupRequestId]
    );

    const verifications = result.rows;
    const requiredLevels = ['requester', 'picker', 'dumpsite_officer'];
    const completedLevels = verifications.filter(v => v.is_verified).map(v => v.verification_level);

    // Check if all required levels are verified
    const allComplete = requiredLevels.every(level => completedLevels.includes(level));

    if (allComplete) {
      // Update pickup status to verified
      await query(
        'UPDATE pickup_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['verified', pickupRequestId]
      );

      logger.info('All verifications complete, pickup marked as verified', {
        pickupRequestId,
        completedLevels
      });
    }
  }

  /**
   * Get pending verifications for a user
   */
  async getPendingVerifications(userId, userRole) {
    let queryText = `
      SELECT 
        dv.*,
        pr.waste_type,
        pr.waste_quantity_kg,
        pr.pickup_location_address,
        pr.pickup_latitude,
        pr.pickup_longitude,
        u.first_name as requester_first_name,
        u.last_name as requester_last_name
      FROM dump_verifications dv
      JOIN pickup_requests pr ON dv.pickup_request_id = pr.id
      JOIN users u ON pr.requester_id = u.id
      WHERE dv.is_verified = false
    `;

    const queryParams = [];

    // Filter by verification level based on user role
    if (userRole === 'customer') {
      queryText += ' AND dv.verification_level = $1';
      queryParams.push('requester');
    } else if (userRole === 'picker') {
      queryText += ' AND dv.verification_level = $1';
      queryParams.push('picker');
    } else if (userRole === 'dumpsite_officer') {
      queryText += ' AND dv.verification_level = $1';
      queryParams.push('dumpsite_officer');
    }

    queryText += ' ORDER BY dv.created_at DESC';

    const result = await query(queryText, queryParams);
    return result.rows;
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats() {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_verifications,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
        COUNT(CASE WHEN is_verified = false THEN 1 END) as pending_count,
        COUNT(CASE WHEN verification_level = 'requester' THEN 1 END) as requester_verifications,
        COUNT(CASE WHEN verification_level = 'picker' THEN 1 END) as picker_verifications,
        COUNT(CASE WHEN verification_level = 'dumpsite_officer' THEN 1 END) as dumpsite_verifications,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_verifications_30_days
      FROM dump_verifications
    `);

    return statsResult.rows[0];
  }
}

module.exports = new VerificationService(); 