// src/services/inference.ts

import {getTfliteModel} from './tfliteService';

/**
 * Runs inference on a scaled Float32Array (length 21),
 * assuming the model has a final Dense(1) layer.
 *
 * @param scaledFeatures A Float32Array of length 21 (already scaled).
 * @returns A Promise resolving to a single float (the predicted health score).
 */
export async function runInference(
  scaledFeatures: Float32Array,
): Promise<number> {
  // 1) Get the loaded TensorflowModel instance
  const model = getTfliteModel();
  if (!model) {
    throw new Error(
      'TFLite model not loaded! Make sure loadTfliteModel() was called.',
    );
  }

  // 2) Run inference. react-native-fast-tflite wants an array of input buffers,
  //    so we wrap scaledFeatures in an array: [scaledFeatures].
  const output = await model.run([scaledFeatures]);

  console.log('Raw inference output:', output);

  // 3) For a single Dense(1) output, we expect output to be something like [0.72].
  if (
    Array.isArray(output) &&
    output.length > 0 &&
    typeof output[0] === 'number'
  ) {
    return output[0];
  } else {
    throw new Error(
      'Unexpected output shape. Expected a single float from Dense(1).',
    );
  }
}
