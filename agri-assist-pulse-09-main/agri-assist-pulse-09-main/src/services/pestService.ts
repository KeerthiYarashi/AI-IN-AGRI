import * as tf from '@tensorflow/tfjs';
import { PestDetectionResult } from '@/types';

class PestService {
  private model: tf.GraphModel | null = null;
  private labels: Record<string, string> = {};
  private isLoading = false;
  private readonly MODEL_URL = '/models/pest_tfjs_model/model.json';
  private readonly LABELS_URL = '/models/pest_tfjs_model/labels.json';

  async loadModel(): Promise<void> {
    if (this.model || this.isLoading) return;

    this.isLoading = true;
    try {
      console.log('🔄 Loading TensorFlow.js model...');
      
      // Try to load the model
      this.model = await tf.loadGraphModel(this.MODEL_URL);
      
      // Load labels
      const labelsResponse = await fetch(this.LABELS_URL);
      if (labelsResponse.ok) {
        this.labels = await labelsResponse.json();
      } else {
        // Default labels if file not found
        this.labels = {
          '0': 'healthy',
          '1': 'leaf_blight',
          '2': 'powdery_mildew',
          '3': 'bacterial_spot',
          '4': 'late_blight'
        };
      }

      console.log('✅ TensorFlow.js model loaded successfully');
      console.log('📋 Available classes:', Object.values(this.labels));
    } catch (error) {
      console.warn('⚠️ TensorFlow.js model not available:', error);
      this.model = null;
    } finally {
      this.isLoading = false;
    }
  }

  async detectPestFromImage(imageFile: File): Promise<PestDetectionResult> {
    try {
      // Try local model first
      if (this.model) {
        console.log('🔍 Using local TensorFlow.js model for detection');
        return await this.detectWithLocalModel(imageFile);
      }

      // Fallback to Plant.id API
      console.log('🌐 Falling back to Plant.id API');
      return await this.detectWithPlantIdAPI(imageFile);
    } catch (error) {
      console.error('❌ Pest detection failed:', error);
      
      // Return sample result for demo purposes
      return await this.getSampleResult();
    }
  }

  private async detectWithLocalModel(imageFile: File): Promise<PestDetectionResult> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    try {
      // Preprocess image
      const tensor = await this.preprocessImage(imageFile);
      
      // Run inference
      const predictions = this.model.predict(tensor) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Get the class with highest probability
      const maxIndex = predictionData.indexOf(Math.max(...Array.from(predictionData)));
      const confidence = predictionData[maxIndex];
      const diseaseKey = this.labels[maxIndex.toString()] || 'unknown';
      
      // Clean up tensors
      tensor.dispose();
      predictions.dispose();

      return this.formatResult(diseaseKey, confidence);
    } catch (error) {
      console.error('❌ Local model inference failed:', error);
      throw error;
    }
  }

  private async detectWithPlantIdAPI(imageFile: File): Promise<PestDetectionResult> {
    const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Plant.id API key not configured, using sample data');
      return await this.getSampleResult();
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch('https://api.plant.id/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          images: [base64Image],
          modifiers: ['crops_fast', 'similar_images'],
          disease_details: ['cause', 'common_names', 'treatment']
        }),
      });

      if (!response.ok) {
        throw new Error(`Plant.id API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePlantIdResponse(data);
    } catch (error) {
      console.error('❌ Plant.id API failed:', error);
      return await this.getSampleResult();
    }
  }

  private async preprocessImage(imageFile: File): Promise<tf.Tensor4D> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Resize to model input size (typically 224x224)
        canvas.width = 224;
        canvas.height = 224;
        
        ctx.drawImage(img, 0, 0, 224, 224);
        
        // Convert to tensor
        const tensor = tf.browser.fromPixels(canvas)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .div(255.0) // Normalize to [0, 1]
          .expandDims(0); // Add batch dimension
        
        resolve(tensor as tf.Tensor4D);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parsePlantIdResponse(data: any): PestDetectionResult {
    try {
      const isHealthy = data.is_healthy_probability > 0.7;
      
      if (isHealthy) {
        return this.formatResult('healthy', data.is_healthy_probability);
      }

      // Get the most likely disease
      const diseases = data.disease_suggestions || [];
      const topDisease = diseases[0];

      if (topDisease) {
        const confidence = topDisease.probability;
        const diseaseKey = topDisease.name.toLowerCase().replace(/\s+/g, '_');
        return this.formatResult(diseaseKey, confidence);
      }

      return this.formatResult('unknown', 0.5);
    } catch (error) {
      console.error('❌ Error parsing Plant.id response:', error);
      return this.formatResult('unknown', 0.5);
    }
  }

  private formatResult(diseaseKey: string, confidence: number): PestDetectionResult {
    const diseaseNames: Record<string, string> = {
      'healthy': 'Healthy Plant',
      'leaf_blight': 'Early Blight',
      'powdery_mildew': 'Powdery Mildew',
      'bacterial_spot': 'Bacterial Spot',
      'late_blight': 'Late Blight',
      'rust': 'Rust Disease',
      'unknown': 'Unknown Condition'
    };

    const remediesMap: Record<string, string[]> = {
      'healthy': [
        'Continue current care practices',
        'Maintain regular watering schedule',
        'Monitor for early signs of disease',
        'Apply organic compost regularly'
      ],
      'leaf_blight': [
        'Apply neem oil spray (organic pesticide)',
        'Remove affected leaves immediately',
        'Improve air circulation around plants',
        'Apply copper-based fungicide'
      ],
      'powdery_mildew': [
        'Spray baking soda solution (1 tsp per liter)',
        'Apply neem oil in early morning',
        'Ensure proper spacing between plants',
        'Use organic sulfur spray'
      ],
      'bacterial_spot': [
        'Remove infected plant parts',
        'Apply copper hydroxide spray',
        'Avoid overhead watering',
        'Use disease-resistant varieties'
      ],
      'late_blight': [
        'Apply copper-based fungicide immediately',
        'Remove and destroy affected plants',
        'Improve drainage and air circulation',
        'Avoid overhead watering'
      ],
      'rust': [
        'Apply sulfur-based fungicide',
        'Remove infected plant debris',
        'Plant rust-resistant varieties next season',
        'Ensure proper plant spacing'
      ]
    };

    const severity: 'low' | 'medium' | 'high' = 
      confidence > 0.8 ? 'high' :
      confidence > 0.6 ? 'medium' : 'low';

    return {
      diseaseName: diseaseNames[diseaseKey] || 'Unknown Condition',
      confidence: Math.round(confidence * 100) / 100,
      severity,
      remedies: remediesMap[diseaseKey] || remediesMap['healthy'],
      isHealthy: diseaseKey === 'healthy'
    };
  }

  private async getSampleResult(): Promise<PestDetectionResult> {
    // Load sample data for demo
    try {
      const response = await fetch('/data/pest_samples.json');
      const data = await response.json();
      const samples = data.samples;
      
      // Return random sample for demo
      const randomSample = samples[Math.floor(Math.random() * samples.length)];
      
      return {
        diseaseName: randomSample.diseaseName,
        confidence: randomSample.confidence,
        severity: randomSample.severity,
        remedies: randomSample.remedies,
        isHealthy: randomSample.isHealthy
      };
    } catch (error) {
      console.error('❌ Failed to load sample data:', error);
      
      // Hardcoded fallback
      return {
        diseaseName: 'Early Blight',
        confidence: 0.85,
        severity: 'medium',
        remedies: [
          'Apply neem oil spray (organic pesticide)',
          'Remove affected leaves immediately',
          'Improve air circulation around plants',
          'Apply copper-based fungicide'
        ],
        isHealthy: false
      };
    }
  }

  // Initialize the service
  async initialize(): Promise<void> {
    await this.loadModel();
  }

  // Check if model is available
  isModelLoaded(): boolean {
    return this.model !== null;
  }

  // Get model info
  getModelInfo(): { available: boolean; classes: string[] } {
    return {
      available: this.model !== null,
      classes: Object.values(this.labels)
    };
  }
}

export const pestService = new PestService();