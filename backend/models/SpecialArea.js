const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialArea = sequelize.define('SpecialArea', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  areaId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('MARKET', 'MALL', 'COMPOUND', 'HIGH_VOLUME_LOCATION'),
    allowNull: false
  },
  subCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON, // GPS coordinates
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dailyWasteGeneration: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: false
  },
  peakPeriodVolume: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: true
  },
  seasonalVariations: {
    type: DataTypes.JSON, // Monthly/seasonal volume data
    defaultValue: {}
  },
  specialEventVolume: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: true
  },
  pickupFrequency: {
    type: DataTypes.ENUM('DAILY', 'TWICE_DAILY', 'WEEKLY', 'CUSTOM'),
    allowNull: false
  },
  preferredVehicleType: {
    type: DataTypes.ENUM('SMALL', 'MEDIUM', 'LARGE', 'FLEXIBLE'),
    allowNull: false
  },
  specialHandlingNeeds: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  environmentalRequirements: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  operatingHours: {
    type: DataTypes.JSON, // Operating hours for each day
    allowNull: false
  },
  accessRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  securityRequirements: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  emergencyContacts: {
    type: DataTypes.JSON, // Array of emergency contacts
    defaultValue: []
  },
  pricingStructure: {
    type: DataTypes.JSON, // Pricing details
    defaultValue: {}
  },
  paymentTerms: {
    type: DataTypes.JSON, // Payment terms and conditions
    defaultValue: {}
  },
  volumeDiscounts: {
    type: DataTypes.JSON, // Volume-based pricing
    defaultValue: {}
  },
  penaltyClauses: {
    type: DataTypes.JSON, // Penalty terms
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  automaticTenderEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tenderThreshold: {
    type: DataTypes.DECIMAL(10, 2), // Volume threshold for tender generation
    allowNull: false
  },
  lastTenderGenerated: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextTenderDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  performanceMetrics: {
    type: DataTypes.JSON, // Performance tracking data
    defaultValue: {}
  },
  complianceStatus: {
    type: DataTypes.JSON, // Compliance tracking
    defaultValue: {}
  },
  registeredBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'special_areas'
});

module.exports = SpecialArea; 