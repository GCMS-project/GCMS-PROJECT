const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Route = sequelize.define('Route', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  routeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  routeType: {
    type: DataTypes.ENUM('PICKUP_ROUTE', 'DUMP_ROUTE', 'OPTIMIZED_ROUTE', 'EMERGENCY_ROUTE'),
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  tenderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  startLocation: {
    type: DataTypes.JSON, // GPS coordinates
    allowNull: false
  },
  endLocation: {
    type: DataTypes.JSON, // GPS coordinates
    allowNull: false
  },
  waypoints: {
    type: DataTypes.JSON, // Array of GPS coordinates
    defaultValue: []
  },
  pickupPoints: {
    type: DataTypes.JSON, // Array of pickup locations
    defaultValue: []
  },
  dumpSite: {
    type: DataTypes.JSON, // Dump site location
    allowNull: true
  },
  totalDistance: {
    type: DataTypes.DECIMAL(10, 2), // in km
    allowNull: false
  },
  estimatedDuration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  actualDuration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  fuelConsumption: {
    type: DataTypes.DECIMAL(8, 2), // in liters
    allowNull: true
  },
  totalVolume: {
    type: DataTypes.DECIMAL(10, 2), // in tons
    allowNull: false
  },
  smallSacks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  largeSacks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DIVERTED'),
    defaultValue: 'PLANNED'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualStartTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualEndTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isOptimized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  optimizationAlgorithm: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trafficConditions: {
    type: DataTypes.JSON, // Traffic data
    defaultValue: {}
  },
  weatherConditions: {
    type: DataTypes.JSON, // Weather data
    defaultValue: {}
  },
  performanceMetrics: {
    type: DataTypes.JSON, // Route performance data
    defaultValue: {}
  },
  deviations: {
    type: DataTypes.JSON, // Route deviations
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional route data
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'routes'
});

module.exports = Route; 