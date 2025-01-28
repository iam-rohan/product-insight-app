import {findIngredientRowCombined} from './ingredientLookup';
import {scaleInput} from './scaler';
import {runInference} from './inference';

/**
 * Computes the product health score by analyzing ingredient data.
 */
export async function computeProductHealthScore(
  ingredientNames: string[],
): Promise<{
  overallHealthScore: number;
  ingredientScores: Array<{name: string; score: number}>;
  harmfulFlags: {carcinogenic: string[]; preservative: string[]};
  unrecognizedIngredients: string[];
}> {
  const requiredFeatures = [
    'water_g',
    'energ_kcal',
    'protein_g',
    'lipid_tot_g',
    'carbohydrt_g',
    'fiber_td_g',
    'sugar_tot_g',
    'calcium_mg',
    'iron_mg',
    'magnesium_mg',
    'potassium_mg',
    'sodium_mg',
    'zinc_mg',
    'copper_mg',
    'vit_c_mg',
    'vit_b6_mg',
    'vit_b12_ug',
    'vit_a_iu',
    'vit_e_mg',
    'vit_d_ug',
    'cholestrl_mg',
  ];

  const totalNutrients: {[key: string]: number} = {};
  for (const col of requiredFeatures) {
    totalNutrients[col] = 0;
  }

  const ingredientScores: Array<{name: string; score: number}> = [];
  const harmfulFlags = {
    carcinogenic: [] as string[],
    preservative: [] as string[],
  };
  const unrecognizedIngredients: string[] = [];

  for (const ingName of ingredientNames) {
    console.log(`Processing ingredient: "${ingName}"`);
    const row = await findIngredientRowCombined(ingName);

    if (!row) {
      console.warn(`No match found for ingredient: "${ingName}"`);
      unrecognizedIngredients.push(ingName);
      continue;
    }

    const isCarcinogenic = row.is_carcinogenic === 'TRUE';
    const isPreservative = row.is_harmful_preservative === 'TRUE';

    let ingScore = row.health_score ?? 1.0;
    if (isCarcinogenic) {
      ingScore -= 1;
      harmfulFlags.carcinogenic.push(ingName);
    }
    if (isPreservative) {
      ingScore -= 1;
      harmfulFlags.preservative.push(ingName);
    }

    ingScore = Math.max(0, Math.min(1, ingScore));
    ingredientScores.push({name: ingName, score: ingScore});

    for (const col of requiredFeatures) {
      const val = row[col] as number;
      totalNutrients[col] += val || 0;
    }
  }

  const rawFeatures = requiredFeatures.map(col => totalNutrients[col]);

  console.log('Total nutrients before scaling:', totalNutrients);

  // Convert Float32Array to number[]
  const scaled = Array.from(scaleInput(rawFeatures));
  const tflitePrediction = await runInference(scaled);

  console.log('TFLite raw prediction:', tflitePrediction);

  let overallHealthScore = 0;
  if (ingredientScores.length > 0) {
    const sum = ingredientScores.reduce((acc, obj) => acc + obj.score, 0);
    overallHealthScore = sum / ingredientScores.length;
  }

  if (harmfulFlags.carcinogenic.length > 0) {
    overallHealthScore -= 0.5;
  }
  if (harmfulFlags.preservative.length > 0) {
    overallHealthScore -= 0.3;
  }

  overallHealthScore = Math.max(0, Math.min(1, overallHealthScore));

  return {
    overallHealthScore,
    ingredientScores,
    harmfulFlags,
    unrecognizedIngredients,
  };
}
