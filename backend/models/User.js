const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer', 'picker', 'dumpsite_officer', 'tender_officer'),
    allowNull: false,
    defaultValue: 'customer'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profile_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['phone']
    },
    {
      fields: ['role']
    }
  ]
});

// Instance methods
User.prototype.getFullName = function() {
  return `${this.first_name} ${this.last_name}`;
};

User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.isPicker = function() {
  return this.role === 'picker';
};

User.prototype.isCustomer = function() {
  return this.role === 'customer';
};

User.prototype.isDumpSiteOfficer = function() {
  return this.role === 'dumpsite_officer';
};

User.prototype.isTenderOfficer = function() {
  return this.role === 'tender_officer';
};

// Class methods
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findByPhone = function(phone) {
  return this.findOne({ where: { phone } });
};

User.findActiveUsers = function() {
  return this.findAll({ where: { is_active: true } });
};

User.findByRole = function(role) {
  return this.findAll({ where: { role, is_active: true } });
};

module.exports = User; 