const crypto = require('crypto');

/**
 * Generate unique tender ID
 */
function generateTenderId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `TDR-${timestamp.slice(-8)}-${random.toUpperCase()}`;
}

/**
 * Generate unique special area ID
 */
function generateSpecialAreaId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex');
  return `AREA-${timestamp.slice(-6)}-${random.toUpperCase()}`;
}

/**
 * Generate unique route ID
 */
function generateRouteId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(3).toString('hex');
  return `ROUTE-${timestamp.slice(-6)}-${random.toUpperCase()}`;
}

/**
 * Calculate volume from sacks
 */
function calculateVolumeFromSacks(smallSacks, largeSacks) {
  const smallSackWeight = 0.05; // 50kg = 0.05 tons
  const largeSackWeight = 0.1;  // 100kg = 0.1 tons
  
  return (smallSacks * smallSackWeight) + (largeSacks * largeSackWeight);
}

/**
 * Calculate sacks from volume
 */
function calculateSacksFromVolume(volume) {
  const smallSackWeight = 0.05; // 50kg = 0.05 tons
  const largeSackWeight = 0.1;  // 100kg = 0.1 tons
  
  // Optimize for large sacks first (more efficient)
  const largeSacks = Math.floor(volume / largeSackWeight);
  const remainingVolume = volume - (largeSacks * largeSackWeight);
  const smallSacks = Math.ceil(remainingVolume / smallSackWeight);
  
  return {
    smallSacks: Math.max(0, smallSacks),
    largeSacks: Math.max(0, largeSacks)
  };
}

/**
 * Determine truck type from volume
 */
function determineTruckType(volume) {
  if (volume >= 0.5 && volume <= 1.0) return 'SMALL_TRUCK';
  if (volume >= 4.0 && volume <= 8.0) return 'MEDIUM_TRUCK';
  if (volume >= 8.0 && volume <= 14.0) return 'LARGE_TRUCK';
  return 'MEDIUM_TRUCK';
}

/**
 * Calculate geographic radius for truck type
 */
function getGeographicRadius(truckType) {
  const radii = {
    'SMALL_TRUCK': 5,   // 5km
    'MEDIUM_TRUCK': 12, // 12km
    'LARGE_TRUCK': 20   // 20km
  };
  return radii[truckType] || 12;
}

/**
 * Calculate distance between two GPS coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * Validate GPS coordinates
 */
function validateGPS(latitude, longitude) {
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
}

/**
 * Calculate estimated budget for tender
 */
function calculateEstimatedBudget(volume, geographicRadius, truckType) {
  const baseRatePerTon = 50000; // TZS per ton
  const distanceFactor = 10000; // TZS per km
  const volumeFactor = 5000;    // TZS per ton
  
  let budget = volume * baseRatePerTon;
  budget += geographicRadius * distanceFactor;
  budget += volume * volumeFactor;
  
  // Add truck type factor
  const truckFactors = {
    'SMALL_TRUCK': 1.0,
    'MEDIUM_TRUCK': 1.2,
    'LARGE_TRUCK': 1.5
  };
  
  budget *= truckFactors[truckType] || 1.2;
  
  return Math.round(budget);
}

/**
 * Generate tender title
 */
function generateTenderTitle(volume, truckType, specialAreaName = null) {
  if (specialAreaName) {
    return `Garbage Collection Tender - ${specialAreaName} (${volume} tons)`;
  }
  return `Garbage Collection Tender - ${volume} tons - ${truckType}`;
}

/**
 * Generate tender description
 */
function generateTenderDescription(volume, smallSacks, largeSacks, truckType, geographicRadius) {
  let description = `Automated tender for garbage collection service. `;
  description += `Volume required: ${volume} tons. `;
  
  if (smallSacks > 0) {
    description += `Small sacks: ${smallSacks}. `;
  }
  if (largeSacks > 0) {
    description += `Large sacks: ${largeSacks}. `;
  }
  
  description += `Vehicle type: ${truckType}. `;
  description += `Service area radius: ${geographicRadius}km.`;
  
  return description;
}

/**
 * Validate tender data
 */
function validateTenderData(tenderData) {
  const errors = [];
  
  if (!tenderData.volumeRequired || tenderData.volumeRequired <= 0) {
    errors.push('Volume required must be greater than 0');
  }
  
  if (!tenderData.tenderType) {
    errors.push('Tender type is required');
  }
  
  if (!tenderData.serviceArea || !tenderData.serviceArea.center) {
    errors.push('Service area with center coordinates is required');
  }
  
  if (!validateGPS(
    tenderData.serviceArea.center.latitude,
    tenderData.serviceArea.center.longitude
  )) {
    errors.push('Invalid GPS coordinates');
  }
  
  return errors;
}

/**
 * Format tender for API response
 */
function formatTenderForResponse(tender) {
  return {
    id: tender.id,
    tenderId: tender.tenderId,
    title: tender.title,
    description: tender.description,
    tenderType: tender.tenderType,
    volumeRequired: tender.volumeRequired,
    smallSacksRequired: tender.smallSacksRequired,
    largeSacksRequired: tender.largeSacksRequired,
    vehicleType: tender.vehicleType,
    vehicleCapacity: tender.vehicleCapacity,
    serviceArea: tender.serviceArea,
    geographicRadius: tender.geographicRadius,
    estimatedBudget: tender.estimatedBudget,
    biddingDeadline: tender.biddingDeadline,
    serviceStartDate: tender.serviceStartDate,
    serviceEndDate: tender.serviceEndDate,
    status: tender.status,
    isAutomated: tender.isAutomated,
    triggerType: tender.triggerType,
    specialAreaId: tender.specialAreaId,
    environmentalRequirements: tender.environmentalRequirements,
    qualityStandards: tender.qualityStandards,
    createdAt: tender.createdAt,
    updatedAt: tender.updatedAt
  };
}

module.exports = {
  generateTenderId,
  generateSpecialAreaId,
  generateRouteId,
  calculateVolumeFromSacks,
  calculateSacksFromVolume,
  determineTruckType,
  getGeographicRadius,
  calculateDistance,
  validateGPS,
  calculateEstimatedBudget,
  generateTenderTitle,
  generateTenderDescription,
  validateTenderData,
  formatTenderForResponse
}; 