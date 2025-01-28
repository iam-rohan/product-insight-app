import jsonData from '../assets/food_nutrition.json';

export interface IngredientRow {
  shrt_desc: string;
  health_score: number;
  is_carcinogenic: string;
  is_harmful_preservative: string;
  [key: string]: string | number;
}

/**
 * Tokenizes a string into keywords for flexible matching.
 */
function tokenize(text: string): string[] {
  return text
    .trim()
    .toLowerCase()
    .split(/[\s,;:-]+/) // Split by common delimiters
    .filter(word => word.length > 0); // Remove empty tokens
}

/**
 * Finds an ingredient row from the JSON data using flexible matching.
 * @param ingredientName The name of the ingredient to find.
 * @returns The matched ingredient row or null if not found.
 */
export async function findIngredientRowCombined(
  ingredientName: string,
): Promise<IngredientRow | null> {
  const normalizedIngredient = ingredientName.trim().toLowerCase();
  console.log(`Looking up ingredient: "${normalizedIngredient}"`);

  const data = jsonData as IngredientRow[];
  console.log('Loaded ingredient data (first 5 rows):', data.slice(0, 5));

  // Attempt exact match
  const exactMatch = data.find((row: IngredientRow) => {
    const rowNormalized = row.shrt_desc.trim().toLowerCase();
    return rowNormalized === normalizedIngredient;
  });

  if (exactMatch) {
    console.log(
      `Exact match found for "${ingredientName}" -> "${exactMatch.shrt_desc}"`,
    );
    return exactMatch;
  }

  // Attempt partial match (substring match)
  const partialMatch = data.find((row: IngredientRow) => {
    const rowNormalized = row.shrt_desc.trim().toLowerCase();
    return (
      rowNormalized.includes(normalizedIngredient) ||
      normalizedIngredient.includes(rowNormalized)
    );
  });

  if (partialMatch) {
    console.log(
      `Partial match found for "${ingredientName}" -> "${partialMatch.shrt_desc}"`,
    );
    return partialMatch;
  }

  // Attempt keyword-based match
  const ingredientTokens = tokenize(ingredientName);
  const keywordMatch = data.find((row: IngredientRow) => {
    const rowTokens = tokenize(row.shrt_desc);
    return ingredientTokens.some(token => rowTokens.includes(token));
  });

  if (keywordMatch) {
    console.log(
      `Keyword match found for "${ingredientName}" -> "${keywordMatch.shrt_desc}"`,
    );
    return keywordMatch;
  }

  console.warn(`No match found for ingredient: "${ingredientName}"`);
  return null;
}
