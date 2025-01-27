// src/services/ingredientLookup.ts
import nutritionData from '../assets/food_nutrition.json';

// Define the row shape for each ingredient
export interface IngredientRow {
  shrt_desc: string;
  water_g: number;
  energ_kcal: number;
  protein_g: number;
  lipid_tot_g: number;
  carbohydrt_g: number;
  fiber_td_g: number;
  sugar_tot_g: number;
  calcium_mg: number;
  iron_mg: number;
  magnesium_mg: number;
  potassium_mg: number;
  sodium_mg: number;
  zinc_mg: number;
  copper_mg: number;
  vit_c_mg: number;
  vit_b6_mg: number;
  vit_b12_ug: number;
  vit_a_iu: number;
  vit_e_mg: number;
  vit_d_ug: number;
  cholestrl_mg: number;
  health_score: number;
  is_carcinogenic: string; // 'TRUE' or 'FALSE'
  is_harmful_preservative: string; // 'TRUE' or 'FALSE'
}

// Convert the JSON to an array
const dataArray = nutritionData as IngredientRow[];

/**
 * 1) Build a dictionary for fast exact lookups (key = lowercased 'shrt_desc').
 */
const dataDict: {[key: string]: IngredientRow} = {};
dataArray.forEach(item => {
  const key = item.shrt_desc.toLowerCase();
  dataDict[key] = item;
});

/**
 * Combined lookup:
 *  1) Attempt exact dictionary lookup
 *  2) If not found, do a partial substring search in the array
 */
export async function findIngredientRowCombined(
  ingredientName: string,
): Promise<IngredientRow | null> {
  const lowerSearch = ingredientName.toLowerCase();

  // 1) Exact match check
  if (dataDict[lowerSearch]) {
    return dataDict[lowerSearch];
  }

  // 2) Fallback to partial substring
  for (const row of dataArray) {
    if (row.shrt_desc.toLowerCase().includes(lowerSearch)) {
      return row;
    }
  }

  // If neither found anything
  return null;
}
