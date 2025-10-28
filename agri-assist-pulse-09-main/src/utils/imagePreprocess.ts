/**
 * Image preprocessing utilities for pest detection
 * Includes EXIF rotation, quality checks, and enhancement
 */

import * as tf from '@tensorflow/tfjs';

export interface ImageQuality {
  isValid: boolean;
  width: number;
  height: number;
  fileSize: number;
  issues: string[];
}

const MIN_IMAGE_SIZE = 100;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Check image quality and reject if too small or invalid
 */
export async function checkImageQuality(file: File): Promise<ImageQuality> {
  const issues: string[] = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    issues.push('File size exceeds 10MB');
  }

  if (file.size < 1024) {
    issues.push('File size too small (minimum 1KB)');
  }

  // Check image dimensions
  const dimensions = await getImageDimensions(file);
  
  if (dimensions.width < MIN_IMAGE_SIZE || dimensions.height < MIN_IMAGE_SIZE) {
    issues.push(`Image too small (minimum ${MIN_IMAGE_SIZE}x${MIN_IMAGE_SIZE}px)`);
  }

  return {
    isValid: issues.length === 0,
    width: dimensions.width,
    height: dimensions.height,
    fileSize: file.size,
    issues
  };
}

/**
 * Get image dimensions from file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Enhanced image preprocessing with EXIF rotation and contrast adjustment
 */
export async function preprocessImage(
  imageFile: File,
  targetSize: number = 224
): Promise<tf.Tensor4D> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = async () => {
      try {
        // Handle EXIF orientation
        const orientation = await getImageOrientation(imageFile);
        
        // Set canvas size
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Apply rotation if needed
        if (orientation > 1) {
          applyOrientation(ctx, img, orientation, targetSize);
        } else {
          // Center crop and resize
          const scale = Math.max(targetSize / img.width, targetSize / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (targetSize - scaledWidth) / 2;
          const y = (targetSize - scaledHeight) / 2;
          
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        }

        // Enhance contrast if image is too dark
        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const enhanced = enhanceContrast(imageData);
        ctx.putImageData(enhanced, 0, 0);

        // Convert to tensor
        const tensor = tf.browser.fromPixels(canvas)
          .resizeNearestNeighbor([targetSize, targetSize])
          .toFloat()
          .div(255.0) // Normalize to [0, 1]
          .expandDims(0); // Add batch dimension

        resolve(tensor as tf.Tensor4D);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Alias for model preprocessing (backward compatibility)
 */
export const preprocessImageForModel = preprocessImage;

/**
 * Get EXIF orientation from image file
 */
async function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1); // Not JPEG, no orientation
        return;
      }

      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) {
          resolve(1);
          return;
        }
        
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xFFE1) {
          const little = view.getUint16(offset + 8, false) === 0x4949;
          offset += view.getUint16(offset, false);
          const tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              const orientation = view.getUint16(offset + (i * 12) + 8, little);
              resolve(orientation);
              return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }

      resolve(1);
    };

    reader.onerror = () => resolve(1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB for EXIF
  });
}

/**
 * Apply EXIF orientation to canvas
 */
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  orientation: number,
  size: number
): void {
  const width = size;
  const height = size;

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
  }

  ctx.drawImage(img, 0, 0, width, height);
}

/**
 * Enhance image contrast if too dark
 */
function enhanceContrast(imageData: ImageData): ImageData {
  const data = imageData.data;
  let sum = 0;

  // Calculate average brightness
  for (let i = 0; i < data.length; i += 4) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  const avgBrightness = sum / (data.length / 4);

  // Only enhance if image is too dark
  if (avgBrightness < 100) {
    const factor = 1.3; // Contrast factor

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, ((data[i] - 128) * factor) + 128);
      data[i + 1] = Math.min(255, ((data[i + 1] - 128) * factor) + 128);
      data[i + 2] = Math.min(255, ((data[i + 2] - 128) * factor) + 128);
    }
  }

  return imageData;
}
