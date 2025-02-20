import jsonData from '../assets/food_nutrition.json';

export interface IngredientRow {
  shrt_desc: string;
  health_score: number;
  is_carcinogenic: string;
  is_harmful_preservative: string;
  [key: string]: string | number;
}

/**
 * Preprocesses ingredient names by normalizing text.
 * Converts to lowercase, removes special characters, and splits into tokens.
 * @param {string} name - The ingredient name to preprocess.
 * @returns {string[]} - Processed tokens.
 */
function preprocessIngredientName(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .split(/\s+/); // Tokenize by whitespace
}

/**
 * Builds a fast lookup index for ingredient names.
 */
const ingredientIndex = new Map<string, IngredientRow>();

(jsonData as IngredientRow[]).forEach((row: IngredientRow) => {
  const processedName = preprocessIngredientName(row.shrt_desc).join(' '); // Join tokens as key
  if (!ingredientIndex.has(processedName)) {
    ingredientIndex.set(processedName, row);
  }
});

/**
 * Finds an ingredient row using optimized lookup.
 * - First tries exact match.
 * - Falls back to partial token-based match if necessary.
 * @param {string} ingredientName - The name of the ingredient to find.
 * @returns {IngredientRow | null} - The matched ingredient row or null if not found.
 */
export async function findIngredientRow(
  ingredientName: string,
): Promise<IngredientRow | null> {
  const processedName = preprocessIngredientName(ingredientName).join(' ');

  // **Exact Match**
  if (ingredientIndex.has(processedName)) {
    const match = ingredientIndex.get(processedName)!;
    console.log(
      `Exact match found for "${ingredientName}" -> "${match.shrt_desc}"`,
    );
    return match;
  }

  // **Partial Token Match** (Fallback)
  for (const [key, row] of ingredientIndex.entries()) {
    if (key.includes(processedName) || processedName.includes(key)) {
      console.log(
        `Partial match found for "${ingredientName}" -> "${row.shrt_desc}"`,
      );
      return row;
    }
  }

  console.warn(`No match found for ingredient: "${ingredientName}"`);
  return null;
}
