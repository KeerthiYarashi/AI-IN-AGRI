/**
 * Soil Sensor Service - Mock implementation with interface for future hardware integration
 * Supports Bluetooth, REST API, and mock modes
 */

export interface SoilSensorReading {
  moisture: number;
  temperature: number;
  pH?: number;
  timestamp: Date;
  source: 'bluetooth' | 'api' | 'mock';
}

export type SensorMode = 'bluetooth' | 'api' | 'mock';

class SoilSensorService {
  private mode: SensorMode = 'mock';
  private lastReading: SoilSensorReading | null = null;
  private apiEndpoint: string = '';

  /**
   * Configure sensor mode
   */
  setMode(mode: SensorMode, apiEndpoint?: string): void {
    this.mode = mode;
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    }
  }

  /**
   * Get current soil sensor reading
   */
  async getSensorReading(): Promise<SoilSensorReading> {
    switch (this.mode) {
      case 'bluetooth':
        return await this.readFromBluetooth();
      case 'api':
        return await this.readFromAPI();
      case 'mock':
      default:
        return this.getMockReading();
    }
  }

  /**
   * Read from Bluetooth sensor (future implementation)
   */
  private async readFromBluetooth(): Promise<SoilSensorReading> {
    try {
      // Check if Web Bluetooth is supported
      if (!('bluetooth' in navigator)) {
        console.warn('⚠️ Web Bluetooth not supported, falling back to mock');
        return this.getMockReading();
      }

      // TODO: Implement actual Bluetooth connection
      // const device = await (navigator as any).bluetooth.requestDevice({
      //   filters: [{ services: ['soil_sensor_service'] }]
      // });
      
      console.warn('⚠️ Bluetooth sensor not implemented yet, using mock data');
      return this.getMockReading();
    } catch (error) {
      console.error('❌ Bluetooth sensor error:', error);
      return this.getMockReading();
    }
  }

  /**
   * Read from REST API sensor
   */
  private async readFromAPI(): Promise<SoilSensorReading> {
    if (!this.apiEndpoint) {
      console.warn('⚠️ API endpoint not configured, using mock data');
      return this.getMockReading();
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const reading: SoilSensorReading = {
        moisture: data.moisture || 0,
        temperature: data.temperature || 0,
        pH: data.pH,
        timestamp: new Date(data.timestamp || Date.now()),
        source: 'api'
      };

      this.lastReading = reading;
      return reading;
    } catch (error) {
      console.error('❌ API sensor error:', error);
      return this.getMockReading();
    }
  }

  /**
   * Get mock sensor reading for testing
   */
  private getMockReading(): SoilSensorReading {
    // Generate realistic mock data with some variance
    const baseReading = this.lastReading?.moisture || 45;
    const variance = (Math.random() - 0.5) * 10; // ±5%
    
    const reading: SoilSensorReading = {
      moisture: Math.max(0, Math.min(100, baseReading + variance)),
      temperature: 22 + Math.random() * 8, // 22-30°C
      pH: 6.0 + Math.random() * 2, // 6.0-8.0
      timestamp: new Date(),
      source: 'mock'
    };

    this.lastReading = reading;
    return reading;
  }

  /**
   * Get last reading without fetching new data
   */
  getLastReading(): SoilSensorReading | null {
    return this.lastReading;
  }

  /**
   * Check if sensor is connected/available
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.getSensorReading();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get sensor information
   */
  getSensorInfo(): { mode: SensorMode; lastReading: SoilSensorReading | null } {
    return {
      mode: this.mode,
      lastReading: this.lastReading
    };
  }
}

export const soilSensorService = new SoilSensorService();
