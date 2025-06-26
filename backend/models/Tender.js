const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tender = sequelize.define('Tender', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenderId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  tenderType: {
    type: DataTypes.ENUM('SMALL_TRUCK', 'MEDIUM_TRUCK', 'LARGE_TRUCK', 'SPECIAL_AREA'),
    allowNull: false
  },
  volumeRequired: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: false
  },
  smallSacksRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  largeSacksRequired: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  vehicleType: {
    type: DataTypes.ENUM('SMALL', 'MEDIUM', 'LARGE'),
    allowNull: false
  },
  vehicleCapacity: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: false
  },
  serviceArea: {
    type: DataTypes.JSON, // GPS coordinates and boundaries
    allowNull: false
  },
  geographicRadius: {
    type: DataTypes.DECIMAL(10, 2), // in km
    allowNull: false
  },
  pickupPoints: {
    type: DataTypes.JSON, // Array of pickup locations
    defaultValue: []
  },
  estimatedBudget: {
    type: DataTypes.DECIMAL(12, 2), // in TZS
    allowNull: false
  },
  biddingDeadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  serviceStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  serviceEndDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'BIDDING', 'AWARDED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'DRAFT'
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  triggerType: {
    type: DataTypes.ENUM('VOLUME_THRESHOLD', 'SPECIAL_AREA', 'MANUAL'),
    allowNull: false
  },
  specialAreaId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  environmentalRequirements: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  qualityStandards: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  awardedTo: {
    type: DataTypes.UUID,
    allowNull: true
  },
  awardedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  awardedAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'tenders'
});

module.exports = Tender; 