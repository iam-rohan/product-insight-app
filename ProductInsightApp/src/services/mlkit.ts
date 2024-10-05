import TextRecognition from '@react-native-ml-kit/text-recognition';

// Function to recognize text from an image using ML Kit
export const recognizeTextFromImage = async (imageUri: string) => {
  try {
    const result = await TextRecognition.recognize(imageUri);

    const recognizedText = result.text; // Full recognized text
    console.log('Recognized full text:', recognizedText); // Log recognized text

    const lines = result.blocks
      .map(block => block.lines.map(line => line.text).join(' '))
      .join('\n');

    return lines;
  } catch (error) {
    console.error('Error recognizing text:', error);
    return null;
  }
};
