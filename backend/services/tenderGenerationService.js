const { Tender, SpecialArea, User } = require('../models');
const { generateTenderId } = require('../utils/tenderUtils');
const notificationService = require('./notificationService');

class TenderGenerationService {
  constructor() {
    this.volumeThresholds = {
      SMALL_TRUCK: {
        minVolume: 0.5, // 0.5 tons
        maxVolume: 1.0, // 1 ton
        smallSacks: { min: 10, max: 20 },
        largeSacks: { min: 5, max: 10 },
        geographicRadius: 5, // km
        timeWindow: 24 // hours
      },
      MEDIUM_TRUCK: {
        minVolume: 4.0, // 4 tons
        maxVolume: 8.0, // 8 tons
        smallSacks: { min: 80, max: 160 },
        largeSacks: { min: 40, max: 80 },
        geographicRadius: 12, // km
        timeWindow: 48 // hours
      },
      LARGE_TRUCK: {
        minVolume: 8.0, // 8 tons
        maxVolume: 14.0, // 14 tons
        smallSacks: { min: 160, max: 280 },
        largeSacks: { min: 80, max: 140 },
        geographicRadius: 20, // km
        timeWindow: 72 // hours
      }
    };
  }

  /**
   * Monitor volume thresholds and generate tenders automatically
   */
  async monitorVolumeThresholds() {
    try {
      console.log('Monitoring volume thresholds for tender generation...');
      
      // Get pending pickup requests grouped by geographic area
      const pendingRequests = await this.getPendingRequests();
      
      // Group requests by geographic clusters
      const clusters = this.createGeographicClusters(pendingRequests);
      
      // Check each cluster for tender generation
      for (const cluster of clusters) {
        await this.checkClusterForTenderGeneration(cluster);
      }
      
      // Check special areas for tender generation
      await this.checkSpecialAreasForTenderGeneration();
      
    } catch (error) {
      console.error('Error monitoring volume thresholds:', error);
    }
  }

  /**
   * Get pending pickup requests
   */
  async getPendingRequests() {
    // This would query the pickup requests table
    // For now, return mock data
    return [
      {
        id: '1',
        latitude: -6.8235,
        longitude: 39.2695,
        smallSacks: 5,
        largeSacks: 2,
        totalVolume: 0.45, // tons
        createdAt: new Date()
      }
      // Add more mock requests
    ];
  }

  /**
   * Create geographic clusters from pickup requests
   */
  createGeographicClusters(requests) {
    const clusters = [];
    const processed = new Set();

    for (const request of requests) {
      if (processed.has(request.id)) continue;

      const cluster = {
        requests: [request],
        center: {
          latitude: request.latitude,
          longitude: request.longitude
        },
        totalVolume: request.totalVolume,
        totalSmallSacks: request.smallSacks,
        totalLargeSacks: request.largeSacks
      };

      // Find nearby requests
      for (const otherRequest of requests) {
        if (processed.has(otherRequest.id)) continue;

        const distance = this.calculateDistance(
          request.latitude, request.longitude,
          otherRequest.latitude, otherRequest.longitude
        );

        if (distance <= 5) { // 5km radius
          cluster.requests.push(otherRequest);
          cluster.totalVolume += otherRequest.totalVolume;
          cluster.totalSmallSacks += otherRequest.smallSacks;
          cluster.totalLargeSacks += otherRequest.largeSacks;
          processed.add(otherRequest.id);
        }
      }

      clusters.push(cluster);
      processed.add(request.id);
    }

    return clusters;
  }

  /**
   * Check if a cluster meets tender generation criteria
   */
  async checkClusterForTenderGeneration(cluster) {
    const { totalVolume, totalSmallSacks, totalLargeSacks } = cluster;

    // Determine truck type based on volume
    let truckType = null;
    let threshold = null;

    if (totalVolume >= 0.5 && totalVolume <= 1.0) {
      truckType = 'SMALL_TRUCK';
      threshold = this.volumeThresholds.SMALL_TRUCK;
    } else if (totalVolume >= 4.0 && totalVolume <= 8.0) {
      truckType = 'MEDIUM_TRUCK';
      threshold = this.volumeThresholds.MEDIUM_TRUCK;
    } else if (totalVolume >= 8.0 && totalVolume <= 14.0) {
      truckType = 'LARGE_TRUCK';
      threshold = this.volumeThresholds.LARGE_TRUCK;
    }

    if (truckType && threshold) {
      await this.generateTender({
        truckType,
        volume: totalVolume,
        smallSacks: totalSmallSacks,
        largeSacks: totalLargeSacks,
        geographicCenter: cluster.center,
        requests: cluster.requests,
        triggerType: 'VOLUME_THRESHOLD'
      });
    }
  }

  /**
   * Check special areas for tender generation
   */
  async checkSpecialAreasForTenderGeneration() {
    try {
      const specialAreas = await SpecialArea.findAll({
        where: {
          isActive: true,
          automaticTenderEnabled: true
        }
      });

      for (const area of specialAreas) {
        const shouldGenerateTender = await this.shouldGenerateSpecialAreaTender(area);
        
        if (shouldGenerateTender) {
          await this.generateSpecialAreaTender(area);
        }
      }
    } catch (error) {
      console.error('Error checking special areas:', error);
    }
  }

  /**
   * Determine if a special area should generate a tender
   */
  async shouldGenerateSpecialAreaTender(area) {
    const now = new Date();
    const lastTender = area.lastTenderGenerated;
    const nextTender = area.nextTenderDate;

    // Check if it's time for the next tender
    if (nextTender && now >= nextTender) {
      return true;
    }

    // Check if volume threshold is met
    const currentVolume = await this.getCurrentVolumeForArea(area.id);
    if (currentVolume >= area.tenderThreshold) {
      return true;
    }

    return false;
  }

  /**
   * Generate a tender for a special area
   */
  async generateSpecialAreaTender(area) {
    const currentVolume = await this.getCurrentVolumeForArea(area.id);
    
    await this.generateTender({
      truckType: this.determineTruckTypeForVolume(currentVolume),
      volume: currentVolume,
      geographicCenter: area.location,
      specialAreaId: area.id,
      triggerType: 'SPECIAL_AREA',
      areaName: area.name,
      areaCategory: area.category
    });

    // Update area with next tender date
    await area.update({
      lastTenderGenerated: new Date(),
      nextTenderDate: this.calculateNextTenderDate(area)
    });
  }

  /**
   * Generate a tender
   */
  async generateTender(tenderData) {
    try {
      const tenderId = generateTenderId();
      const now = new Date();

      const tender = await Tender.create({
        tenderId,
        title: this.generateTenderTitle(tenderData),
        description: this.generateTenderDescription(tenderData),
        tenderType: tenderData.truckType,
        volumeRequired: tenderData.volume,
        smallSacksRequired: tenderData.smallSacks || 0,
        largeSacksRequired: tenderData.largeSacks || 0,
        vehicleType: this.getVehicleType(tenderData.truckType),
        vehicleCapacity: this.getVehicleCapacity(tenderData.truckType),
        serviceArea: {
          center: tenderData.geographicCenter,
          radius: this.getGeographicRadius(tenderData.truckType)
        },
        geographicRadius: this.getGeographicRadius(tenderData.truckType),
        pickupPoints: tenderData.requests || [],
        estimatedBudget: this.calculateEstimatedBudget(tenderData),
        biddingDeadline: new Date(now.getTime() + (24 * 60 * 60 * 1000)), // 24 hours
        serviceStartDate: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 days
        serviceEndDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days
        status: 'PUBLISHED',
        isAutomated: true,
        triggerType: tenderData.triggerType,
        specialAreaId: tenderData.specialAreaId,
        createdBy: 'SYSTEM', // System-generated tender
        environmentalRequirements: this.getEnvironmentalRequirements(tenderData),
        qualityStandards: this.getQualityStandards(tenderData)
      });

      // Send notifications to service providers
      await this.notifyServiceProviders(tender);

      console.log(`Tender generated: ${tenderId}`);
      return tender;

    } catch (error) {
      console.error('Error generating tender:', error);
      throw error;
    }
  }

  /**
   * Generate tender title
   */
  generateTenderTitle(tenderData) {
    if (tenderData.specialAreaId) {
      return `Garbage Collection Tender - ${tenderData.areaName} (${tenderData.areaCategory})`;
    }
    return `Garbage Collection Tender - ${tenderData.volume} tons - ${tenderData.truckType}`;
  }

  /**
   * Generate tender description
   */
  generateTenderDescription(tenderData) {
    let description = `Automated tender for garbage collection service. `;
    description += `Volume required: ${tenderData.volume} tons. `;
    
    if (tenderData.smallSacks > 0) {
      description += `Small sacks: ${tenderData.smallSacks}. `;
    }
    if (tenderData.largeSacks > 0) {
      description += `Large sacks: ${tenderData.largeSacks}. `;
    }
    
    description += `Vehicle type: ${tenderData.truckType}. `;
    description += `Service area radius: ${this.getGeographicRadius(tenderData.truckType)}km.`;
    
    return description;
  }

  /**
   * Get vehicle type from truck type
   */
  getVehicleType(truckType) {
    const mapping = {
      'SMALL_TRUCK': 'SMALL',
      'MEDIUM_TRUCK': 'MEDIUM',
      'LARGE_TRUCK': 'LARGE'
    };
    return mapping[truckType] || 'MEDIUM';
  }

  /**
   * Get vehicle capacity from truck type
   */
  getVehicleCapacity(truckType) {
    const mapping = {
      'SMALL_TRUCK': 1.0,
      'MEDIUM_TRUCK': 6.0,
      'LARGE_TRUCK': 11.0
    };
    return mapping[truckType] || 6.0;
  }

  /**
   * Get geographic radius from truck type
   */
  getGeographicRadius(truckType) {
    const mapping = {
      'SMALL_TRUCK': 5,
      'MEDIUM_TRUCK': 12,
      'LARGE_TRUCK': 20
    };
    return mapping[truckType] || 12;
  }

  /**
   * Calculate estimated budget
   */
  calculateEstimatedBudget(tenderData) {
    const baseRatePerTon = 50000; // TZS per ton
    const volume = tenderData.volume;
    const radius = this.getGeographicRadius(tenderData.truckType);
    
    // Base cost + distance factor + volume factor
    let budget = volume * baseRatePerTon;
    budget += radius * 10000; // Distance factor
    budget += volume * 5000; // Volume factor
    
    return Math.round(budget);
  }

  /**
   * Get environmental requirements
   */
  getEnvironmentalRequirements(tenderData) {
    return {
      wasteSegregation: true,
      recyclingCompliance: true,
      environmentalImpact: 'MINIMAL',
      disposalMethod: 'APPROVED_DUMP_SITE'
    };
  }

  /**
   * Get quality standards
   */
  getQualityStandards(tenderData) {
    return {
      serviceQuality: 'HIGH',
      responseTime: 'WITHIN_24_HOURS',
      customerSatisfaction: '4_STARS_PLUS',
      completionRate: '95_PERCENT_PLUS'
    };
  }

  /**
   * Notify service providers about new tender
   */
  async notifyServiceProviders(tender) {
    try {
      // Get all service providers
      const serviceProviders = await User.findAll({
        where: {
          role: 'SERVICE_PROVIDER',
          isActive: true
        }
      });

      // Send notifications
      for (const provider of serviceProviders) {
        await notificationService.sendNotification({
          type: 'TENDER_CREATION',
          recipientId: provider.id,
          recipientType: 'SERVICE_PROVIDER',
          title: 'New Tender Available',
          message: `A new tender has been generated: ${tender.title}`,
          channels: ['email', 'sms', 'dashboard'],
          metadata: {
            tenderId: tender.tenderId,
            volume: tender.volumeRequired,
            vehicleType: tender.vehicleType,
            biddingDeadline: tender.biddingDeadline
          }
        });
      }
    } catch (error) {
      console.error('Error notifying service providers:', error);
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Get current volume for a special area
   */
  async getCurrentVolumeForArea(areaId) {
    // This would query the actual volume data
    // For now, return mock data
    return 2.5; // tons
  }

  /**
   * Determine truck type for volume
   */
  determineTruckTypeForVolume(volume) {
    if (volume >= 0.5 && volume <= 1.0) return 'SMALL_TRUCK';
    if (volume >= 4.0 && volume <= 8.0) return 'MEDIUM_TRUCK';
    if (volume >= 8.0 && volume <= 14.0) return 'LARGE_TRUCK';
    return 'MEDIUM_TRUCK';
  }

  /**
   * Calculate next tender date for special area
   */
  calculateNextTenderDate(area) {
    const now = new Date();
    const frequency = area.pickupFrequency;
    
    switch (frequency) {
      case 'DAILY':
        return new Date(now.getTime() + (24 * 60 * 60 * 1000));
      case 'TWICE_DAILY':
        return new Date(now.getTime() + (12 * 60 * 60 * 1000));
      case 'WEEKLY':
        return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      default:
        return new Date(now.getTime() + (24 * 60 * 60 * 1000));
    }
  }
}

module.exports = new TenderGenerationService(); 