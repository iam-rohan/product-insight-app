// src/services/tfliteService.ts

import {loadTensorflowModel, TensorflowModel} from 'react-native-fast-tflite';

// This will hold our model instance after loading
let model: TensorflowModel | null = null;

/**
 * Loads the TFLite model using react-native-fast-tflite.
 */
export async function loadTfliteModel() {
  try {
    // Use require to load from src/assets
    model = await loadTensorflowModel(
      require('src/assets/health_score_model_v1.tflite'),
    );
    console.log('TFLite model loaded successfully!');
  } catch (error) {
    console.error('Error loading TFLite model:', error);
    throw error;
  }
}

/**
 * Returns the TFLite model reference if loaded, or null if not.
 */
export function getTfliteModel(): TensorflowModel | null {
  return model;
}
