const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GPSLocation = sequelize.define('GPSLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  entityType: {
    type: DataTypes.ENUM('DRIVER', 'VEHICLE', 'PICKUP_REQUEST', 'DUMP_SITE'),
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  altitude: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  accuracy: {
    type: DataTypes.DECIMAL(5, 2), // in meters
    allowNull: true
  },
  speed: {
    type: DataTypes.DECIMAL(8, 2), // in km/h
    allowNull: true
  },
  heading: {
    type: DataTypes.DECIMAL(5, 2), // in degrees
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  locationType: {
    type: DataTypes.ENUM('PICKUP', 'DROPOFF', 'IN_TRANSIT', 'IDLE', 'OFFLINE'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  routeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  tripId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  batteryLevel: {
    type: DataTypes.INTEGER, // percentage
    allowNull: true
  },
  signalStrength: {
    type: DataTypes.INTEGER, // percentage
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional GPS data
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'gps_locations',
  indexes: [
    {
      fields: ['entityId', 'entityType']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

module.exports = GPSLocation; 