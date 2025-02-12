import {getTfliteModel} from './tfliteService';

/**
 * Runs inference using the loaded TFLite model.
 * @param scaledInput The scaled input data array.
 * @returns The inference output as a single number.
 */
export async function runInference(scaledInput: number[]): Promise<number> {
  const model = getTfliteModel();
  if (!model) {
    throw new Error('TFLite model is not loaded');
  }

  try {
    // Convert the input into Float32Array for TensorFlow Lite
    const inputBuffer = new Float32Array(scaledInput);

    // Run inference on the model
    const output = await model.run([inputBuffer]);

    console.log('Raw inference output:', output);

    // Safely extract the first value from the output
    if (Array.isArray(output) && output.length > 0) {
      const firstElement = output[0];
      if (Array.isArray(firstElement)) {
        return Number(firstElement[0]);
      } else if (
        firstElement instanceof Float32Array ||
        ArrayBuffer.isView(firstElement)
      ) {
        // TypedArray output
        return Number(firstElement[0]);
      } else {
        // Flat array output
        return Number(firstElement);
      }
    }

    throw new Error('Unexpected output shape from TFLite model');
  } catch (error) {
    console.error('Error during inference:', error);
    throw error;
  }
}
