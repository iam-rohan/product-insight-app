// src/services/tfliteService.ts

import {loadTensorflowModel, TensorflowModel} from 'react-native-fast-tflite';

// This will hold our model instance after loading
let model: TensorflowModel | null = null;

/**
 * Loads the TFLite model using react-native-fast-tflite.
 */
export async function loadTfliteModel() {
  try {
    // Correct relative path for require
    const modelPath = require('../assets/health_score_model_v1.tflite');
    console.log('Resolved model path:', modelPath);

    // Load the model using react-native-fast-tflite
    model = await loadTensorflowModel(modelPath);
    console.log('TFLite model loaded successfully!');
  } catch (error) {
    console.error(
      'Error loading TFLite model. Ensure the path is correct:',
      error,
    );
    throw error;
  }
}

/**
 * Returns the TFLite model reference if loaded, or null if not.
 */
export function getTfliteModel(): TensorflowModel | null {
  return model;
}
