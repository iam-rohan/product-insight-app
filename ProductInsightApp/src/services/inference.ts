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
    const inputBuffer = new Float32Array(scaledInput);
    const output = await model.run([inputBuffer]);

    console.log('Raw inference output:', output);

    if (Array.isArray(output) && output.length > 0) {
      const firstElement = output[0];
      return Array.isArray(firstElement)
        ? Number(firstElement[0])
        : Number(firstElement);
    }

    throw new Error('Unexpected output shape from TFLite model');
  } catch (error) {
    console.error('Error during inference:', error);
    throw error;
  }
}
