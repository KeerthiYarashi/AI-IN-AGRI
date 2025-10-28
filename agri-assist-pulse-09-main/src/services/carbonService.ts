import { CarbonFootprint, EmissionFactors } from '@/types';
import { EMISSION_FACTORS, CARBON_THRESHOLDS, CARBON_TIPS } from '@/utils/constants';

interface CarbonInputs {
  fertilizerUrea: number;      // kg
  fertilizerDAP: number;       // kg
  tractorHours: number;        // hours
  pumpHours: number;           // hours
  farmArea?: number;           // hectares (optional for per-hectare calculations)
  fuelUsed?: number;           // liters (optional)
  electricityUsed?: number;    // kWh (optional)
}

class CarbonService {
  
  calculateCarbonFootprint(inputs: CarbonInputs): CarbonFootprint {
    try {
      // Calculate emissions from different sources
      const fertilizerEmissions = this.calculateFertilizerEmissions(inputs);
      const machineryEmissions = this.calculateMachineryEmissions(inputs);
      const otherEmissions = this.calculateOtherEmissions(inputs);

      const total = fertilizerEmissions + machineryEmissions + otherEmissions;
      
      // Determine emission level
      const level = this.getEmissionLevel(total);
      
      // Get relevant tips
      const tips = this.getTipsForLevel(level);

      return {
        fertilizer: Math.round(fertilizerEmissions * 100) / 100,
        machinery: Math.round(machineryEmissions * 100) / 100,
        other: Math.round(otherEmissions * 100) / 100,
        total: Math.round(total * 100) / 100,
        level,
        tips
      };
    } catch (error) {
      console.error('❌ Carbon footprint calculation error:', error);
      
      // Return fallback calculation
      return {
        fertilizer: 0,
        machinery: 0,
        other: 0,
        total: 0,
        level: 'low',
        tips: CARBON_TIPS.LOW
      };
    }
  }

  private calculateFertilizerEmissions(inputs: CarbonInputs): number {
    const ureaEmissions = inputs.fertilizerUrea * EMISSION_FACTORS.urea;
    const dapEmissions = inputs.fertilizerDAP * EMISSION_FACTORS.dap;
    
    return ureaEmissions + dapEmissions;
  }

  private calculateMachineryEmissions(inputs: CarbonInputs): number {
    const tractorEmissions = inputs.tractorHours * EMISSION_FACTORS.tractor;
    const pumpEmissions = inputs.pumpHours * EMISSION_FACTORS.pump;
    
    return tractorEmissions + pumpEmissions;
  }

  private calculateOtherEmissions(inputs: CarbonInputs): number {
    let otherEmissions = 0;

    // Fuel emissions (if provided)
    if (inputs.fuelUsed) {
      otherEmissions += inputs.fuelUsed * 2.31; // kg CO2e per liter of diesel
    }

    // Electricity emissions (if provided)
    if (inputs.electricityUsed) {
      otherEmissions += inputs.electricityUsed * 0.82; // kg CO2e per kWh (India average)
    }

    return otherEmissions;
  }

  private getEmissionLevel(totalEmissions: number): 'low' | 'medium' | 'high' {
    if (totalEmissions <= CARBON_THRESHOLDS.LOW) return 'low';
    if (totalEmissions <= CARBON_THRESHOLDS.MEDIUM) return 'medium';
    return 'high';
  }

  private getTipsForLevel(level: 'low' | 'medium' | 'high'): string[] {
    switch (level) {
      case 'high': return CARBON_TIPS.HIGH;
      case 'medium': return CARBON_TIPS.MEDIUM;
      case 'low': return CARBON_TIPS.LOW;
      default: return CARBON_TIPS.LOW;
    }
  }

  // Calculate per-hectare emissions
  calculatePerHectareEmissions(inputs: CarbonInputs): CarbonFootprint | null {
    if (!inputs.farmArea || inputs.farmArea <= 0) {
      return null;
    }

    const totalFootprint = this.calculateCarbonFootprint(inputs);
    
    return {
      fertilizer: Math.round((totalFootprint.fertilizer / inputs.farmArea) * 100) / 100,
      machinery: Math.round((totalFootprint.machinery / inputs.farmArea) * 100) / 100,
      other: Math.round((totalFootprint.other / inputs.farmArea) * 100) / 100,
      total: Math.round((totalFootprint.total / inputs.farmArea) * 100) / 100,
      level: totalFootprint.level,
      tips: totalFootprint.tips
    };
  }

  // Compare with benchmarks
  compareToBenchmark(totalEmissions: number, cropType: string): {
    benchmark: number;
    comparison: 'better' | 'average' | 'worse';
    percentageDiff: number;
  } {
    // Typical carbon footprint benchmarks (kg CO2e per hectare per season)
    const benchmarks: Record<string, number> = {
      tomato: 2500,
      onion: 1800,
      potato: 3200,
      wheat: 1200,
      rice: 4500,
      sugarcane: 2800
    };

    const benchmark = benchmarks[cropType] || 2000;
    const percentageDiff = ((totalEmissions - benchmark) / benchmark) * 100;
    
    let comparison: 'better' | 'average' | 'worse';
    if (percentageDiff < -10) comparison = 'better';
    else if (percentageDiff > 10) comparison = 'worse';
    else comparison = 'average';

    return {
      benchmark,
      comparison,
      percentageDiff: Math.round(percentageDiff)
    };
  }

  // Generate carbon reduction plan
  generateReductionPlan(inputs: CarbonInputs, targetReduction: number = 20): {
    currentEmissions: number;
    targetEmissions: number;
    recommendations: Array<{
      category: string;
      action: string;
      potentialReduction: number;
      implementationDifficulty: 'easy' | 'medium' | 'hard';
    }>;
  } {
    const current = this.calculateCarbonFootprint(inputs);
    const targetEmissions = current.total * (1 - targetReduction / 100);

    const recommendations = [
      {
        category: 'Fertilizer',
        action: 'Switch to organic compost (50% replacement)',
        potentialReduction: current.fertilizer * 0.3,
        implementationDifficulty: 'medium' as const
      },
      {
        category: 'Fertilizer',
        action: 'Use precision application to reduce usage by 15%',
        potentialReduction: current.fertilizer * 0.15,
        implementationDifficulty: 'easy' as const
      },
      {
        category: 'Machinery',
        action: 'Optimize machinery usage and maintenance',
        potentialReduction: current.machinery * 0.20,
        implementationDifficulty: 'easy' as const
      },
      {
        category: 'Energy',
        action: 'Install solar panels for irrigation pumps',
        potentialReduction: current.other * 0.60,
        implementationDifficulty: 'hard' as const
      },
      {
        category: 'Soil',
        action: 'Implement cover cropping to improve soil health',
        potentialReduction: current.total * 0.10,
        implementationDifficulty: 'medium' as const
      }
    ];

    return {
      currentEmissions: current.total,
      targetEmissions: Math.round(targetEmissions * 100) / 100,
      recommendations: recommendations.sort((a, b) => b.potentialReduction - a.potentialReduction)
    };
  }

  // Calculate carbon sequestration potential
  calculateSequestrationPotential(farmArea: number, practices: string[]): {
    annualSequestration: number;
    practicesImpact: Array<{
      practice: string;
      sequestrationRate: number; // kg CO2e per hectare per year
    }>;
  } {
    const sequestrationRates: Record<string, number> = {
      'cover_cropping': 400,      // kg CO2e/ha/year
      'agroforestry': 800,        // kg CO2e/ha/year
      'composting': 300,          // kg CO2e/ha/year
      'reduced_tillage': 200,     // kg CO2e/ha/year
      'crop_rotation': 250,       // kg CO2e/ha/year
      'organic_farming': 350      // kg CO2e/ha/year
    };

    const practicesImpact = practices.map(practice => ({
      practice: practice.replace('_', ' ').toUpperCase(),
      sequestrationRate: sequestrationRates[practice] || 0
    }));

    const totalSequestrationRate = practicesImpact.reduce(
      (sum, practice) => sum + practice.sequestrationRate, 0
    );

    const annualSequestration = totalSequestrationRate * farmArea;

    return {
      annualSequestration: Math.round(annualSequestration),
      practicesImpact
    };
  }

  // Get carbon footprint insights
  getInsights(footprint: CarbonFootprint): string[] {
    const insights = [];

    // Fertilizer insights
    if (footprint.fertilizer > footprint.total * 0.6) {
      insights.push('🌱 Fertilizers contribute over 60% of your emissions. Consider organic alternatives.');
    }

    // Machinery insights
    if (footprint.machinery > footprint.total * 0.4) {
      insights.push('🚜 Machinery emissions are high. Consider optimizing usage and maintenance.');
    }

    // Level-specific insights
    switch (footprint.level) {
      case 'low':
        insights.push('✅ Great job! Your carbon footprint is below average for similar farms.');
        break;
      case 'medium':
        insights.push('⚡ Your emissions are moderate. Small changes can make a big difference.');
        break;
      case 'high':
        insights.push('⚠️ High emissions detected. Implementing reduction strategies is recommended.');
        break;
    }

    return insights;
  }
}

export const carbonService = new CarbonService();