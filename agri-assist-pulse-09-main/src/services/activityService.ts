import { FarmerActivity } from '@/types';

const ACTIVITIES_KEY = 'agri_activities';

class ActivityService {
  private getActivities(): Record<string, FarmerActivity> {
    return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '{}');
  }

  private saveActivities(activities: Record<string, FarmerActivity>) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }

  getFarmerActivity(farmerId: string): FarmerActivity {
    const activities = this.getActivities();
    return activities[farmerId] || {
      farmerId,
      marketForecasts: [],
      pestDetections: [],
      irrigationHistory: [],
      carbonHistory: [],
      yieldEstimates: [],
    };
  }

  addMarketForecast(farmerId: string, data: { crop: string; price: number }) {
    const activities = this.getActivities();
    if (!activities[farmerId]) {
      activities[farmerId] = this.getFarmerActivity(farmerId);
    }
    
    activities[farmerId].marketForecasts.unshift({
      ...data,
      date: new Date().toISOString(),
    });
    
    // Keep only last 100 entries
    if (activities[farmerId].marketForecasts.length > 100) {
      activities[farmerId].marketForecasts = activities[farmerId].marketForecasts.slice(0, 100);
    }
    
    this.saveActivities(activities);
  }

  addPestDetection(farmerId: string, data: { crop: string; disease: string; confidence: number }) {
    const activities = this.getActivities();
    if (!activities[farmerId]) {
      activities[farmerId] = this.getFarmerActivity(farmerId);
    }
    
    activities[farmerId].pestDetections.unshift({
      ...data,
      date: new Date().toISOString(),
    });
    
    if (activities[farmerId].pestDetections.length > 100) {
      activities[farmerId].pestDetections = activities[farmerId].pestDetections.slice(0, 100);
    }
    
    this.saveActivities(activities);
  }

  addIrrigationHistory(farmerId: string, data: { crop: string; decision: boolean; soilMoisture: number }) {
    const activities = this.getActivities();
    if (!activities[farmerId]) {
      activities[farmerId] = this.getFarmerActivity(farmerId);
    }
    
    activities[farmerId].irrigationHistory.unshift({
      ...data,
      date: new Date().toISOString(),
    });
    
    if (activities[farmerId].irrigationHistory.length > 100) {
      activities[farmerId].irrigationHistory = activities[farmerId].irrigationHistory.slice(0, 100);
    }
    
    this.saveActivities(activities);
  }

  addCarbonHistory(farmerId: string, data: { total: number; level: string }) {
    const activities = this.getActivities();
    if (!activities[farmerId]) {
      activities[farmerId] = this.getFarmerActivity(farmerId);
    }
    
    activities[farmerId].carbonHistory.unshift({
      ...data,
      date: new Date().toISOString(),
    });
    
    if (activities[farmerId].carbonHistory.length > 50) {
      activities[farmerId].carbonHistory = activities[farmerId].carbonHistory.slice(0, 50);
    }
    
    this.saveActivities(activities);
  }

  addYieldEstimate(farmerId: string, data: { crop: string; area: number; estimatedYield: number }) {
    const activities = this.getActivities();
    if (!activities[farmerId]) {
      activities[farmerId] = this.getFarmerActivity(farmerId);
    }
    
    activities[farmerId].yieldEstimates.unshift({
      ...data,
      date: new Date().toISOString(),
    });
    
    if (activities[farmerId].yieldEstimates.length > 50) {
      activities[farmerId].yieldEstimates = activities[farmerId].yieldEstimates.slice(0, 50);
    }
    
    this.saveActivities(activities);
  }

  clearFarmerData(farmerId: string) {
    const activities = this.getActivities();
    delete activities[farmerId];
    this.saveActivities(activities);
  }

  // NEW: Get activity statistics
  getActivityStats(farmerId: string) {
    const activity = this.getFarmerActivity(farmerId);
    
    const totalActivities = 
      activity.marketForecasts.length +
      activity.pestDetections.length +
      activity.irrigationHistory.length +
      activity.carbonHistory.length +
      activity.yieldEstimates.length;

    // Get most used feature
    const featureUsage = {
      market: activity.marketForecasts.length,
      pest: activity.pestDetections.length,
      irrigation: activity.irrigationHistory.length,
      carbon: activity.carbonHistory.length,
      yield: activity.yieldEstimates.length,
    };

    const mostUsedFeature = Object.entries(featureUsage).reduce((a, b) => 
      featureUsage[a[0]] > featureUsage[b[0]] ? a : b
    )[0];

    // Get recent activity dates
    const allDates = [
      ...activity.marketForecasts.map(a => a.date),
      ...activity.pestDetections.map(a => a.date),
      ...activity.irrigationHistory.map(a => a.date),
      ...activity.carbonHistory.map(a => a.date),
      ...activity.yieldEstimates.map(a => a.date),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const lastActivity = allDates[0] ? new Date(allDates[0]) : null;
    const firstActivity = allDates[allDates.length - 1] ? new Date(allDates[allDates.length - 1]) : null;

    return {
      totalActivities,
      featureUsage,
      mostUsedFeature,
      lastActivity,
      firstActivity,
    };
  }

  // NEW: Clear specific activity type
  clearActivityType(farmerId: string, type: 'market' | 'pest' | 'irrigation' | 'carbon' | 'yield') {
    const activities = this.getActivities();
    if (!activities[farmerId]) return;

    switch (type) {
      case 'market':
        activities[farmerId].marketForecasts = [];
        break;
      case 'pest':
        activities[farmerId].pestDetections = [];
        break;
      case 'irrigation':
        activities[farmerId].irrigationHistory = [];
        break;
      case 'carbon':
        activities[farmerId].carbonHistory = [];
        break;
      case 'yield':
        activities[farmerId].yieldEstimates = [];
        break;
    }

    this.saveActivities(activities);
  }
}

export const activityService = new ActivityService();
