/**
 * Parses OCR-recognized text to extract a list of ingredient names.
 * @param ocrText - The raw text recognized by the OCR system.
 * @returns An array of cleaned ingredient names.
 */
export function parseIngredients(ocrText: string): string[] {
  if (!ocrText) return [];

  // If "Ingredients" marker exists, extract text after it
  const ingredientsMatch = ocrText.match(/ingredients[:\s]*([\s\S]+)/i);
  const ingredientsText = ingredientsMatch ? ingredientsMatch[1] : ocrText;

  // Step 2: Splits ingredients by commas
  const rawIngredients = ingredientsText.split(',');

  // Step 3: Clean and normalize each ingredient
  const cleanedIngredients = rawIngredients.map(ingredient =>
    ingredient.trim().toLowerCase(),
  );

  // Step 4: Remove empty entries
  return cleanedIngredients.filter(ingredient => ingredient.length > 0);
}
