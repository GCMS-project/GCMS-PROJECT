// Core Models
const User = require('./User');
const Tender = require('./Tender');
const SpecialArea = require('./SpecialArea');
const Notification = require('./Notification');
const Payment = require('./Payment');
const GPSLocation = require('./GPSLocation');
const Route = require('./Route');

// Existing Models (if they exist)
let Pickup, DumpSite;
try {
  Pickup = require('./Pickup');
} catch (error) {
  console.log('Pickup model not found, will create later');
}

try {
  DumpSite = require('./DumpSite');
} catch (error) {
  console.log('DumpSite model not found, will create later');
}

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Tender, { as: 'createdTenders', foreignKey: 'createdBy' });
  User.hasMany(SpecialArea, { as: 'registeredAreas', foreignKey: 'registeredBy' });
  User.hasMany(Notification, { as: 'notifications', foreignKey: 'recipientId' });
  User.hasMany(Payment, { as: 'payments', foreignKey: 'payerId' });
  User.hasMany(GPSLocation, { as: 'gpsLocations', foreignKey: 'entityId' });
  User.hasMany(Route, { as: 'assignedRoutes', foreignKey: 'driverId' });
  User.hasMany(Route, { as: 'createdRoutes', foreignKey: 'createdBy' });

  // Tender associations
  Tender.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
  Tender.belongsTo(User, { as: 'awardedToUser', foreignKey: 'awardedTo' });
  Tender.belongsTo(SpecialArea, { as: 'specialArea', foreignKey: 'specialAreaId' });
  Tender.hasMany(Route, { as: 'routes', foreignKey: 'tenderId' });

  // SpecialArea associations
  SpecialArea.belongsTo(User, { as: 'registrar', foreignKey: 'registeredBy' });
  SpecialArea.hasMany(Tender, { as: 'tenders', foreignKey: 'specialAreaId' });

  // Notification associations
  Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

  // Payment associations
  Payment.belongsTo(User, { as: 'payer', foreignKey: 'payerId' });
  Payment.belongsTo(User, { as: 'payee', foreignKey: 'payeeId' });

  // GPSLocation associations
  GPSLocation.belongsTo(User, { as: 'entity', foreignKey: 'entityId' });
  GPSLocation.belongsTo(Route, { as: 'route', foreignKey: 'routeId' });

  // Route associations
  Route.belongsTo(User, { as: 'driver', foreignKey: 'driverId' });
  Route.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
  Route.belongsTo(User, { as: 'assigner', foreignKey: 'assignedBy' });
  Route.belongsTo(Tender, { as: 'tender', foreignKey: 'tenderId' });
  Route.hasMany(GPSLocation, { as: 'gpsLocations', foreignKey: 'routeId' });

  // If existing models exist, add their associations
  if (Pickup) {
    Pickup.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
    Pickup.belongsTo(Route, { as: 'route', foreignKey: 'routeId' });
    Pickup.hasMany(Payment, { as: 'payments', foreignKey: 'relatedEntityId' });
  }

  if (DumpSite) {
    DumpSite.hasMany(Route, { as: 'routes', foreignKey: 'dumpSiteId' });
  }
};

module.exports = {
  User,
  Tender,
  SpecialArea,
  Notification,
  Payment,
  GPSLocation,
  Route,
  Pickup,
  DumpSite,
  defineAssociations
}; 