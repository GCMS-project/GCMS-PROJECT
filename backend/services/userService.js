const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class UserService {
  async login(identifier, password) {
    const result = await query('SELECT id, email, phone, password_hash, first_name, last_name, role, is_active, is_verified FROM users WHERE (email = $1 OR phone = $1) AND deleted_at IS NULL', [identifier]);
    if (result.rows.length === 0) throw new Error('Invalid credentials');
    const user = result.rows[0];
    if (!user.is_active) throw new Error('Account is deactivated');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new Error('Invalid credentials');
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    return { user: { id: user.id, email: user.email, phone: user.phone, first_name: user.first_name, last_name: user.last_name, role: user.role, is_verified: user.is_verified }, token };
  }
}

module.exports = new UserService();
