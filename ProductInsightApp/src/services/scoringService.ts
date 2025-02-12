import {findIngredientRowCombined} from './ingredientLookup';
import {scaleInput} from './scaler';
import {runInference} from './inference';

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

    for (const col of requiredFeatures) {
      const val = row[col] as number;
      totalNutrients[col] += val || 0;
    }

    // Optional: Calculate individual ingredient score using the model
    const rawFeatures = requiredFeatures.map(col => row[col] as number);
    const scaled = Array.from(scaleInput(rawFeatures));
    const ingScore = await runInference(scaled);

    ingredientScores.push({name: ingName, score: ingScore});

    if (isCarcinogenic) {
      harmfulFlags.carcinogenic.push(ingName);
    }
    if (isPreservative) {
      harmfulFlags.preservative.push(ingName);
    }
  }

  const rawFeatures = requiredFeatures.map(col => totalNutrients[col]);

  console.log('Total nutrients before scaling:', totalNutrients);

  // Convert Float32Array to number[]
  const scaled = Array.from(scaleInput(rawFeatures));
  const tflitePrediction = await runInference(scaled);

  console.log('TFLite raw prediction:', tflitePrediction);

  let overallHealthScore = tflitePrediction;

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
