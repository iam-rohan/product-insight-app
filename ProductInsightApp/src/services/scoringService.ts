import {findIngredientRowCombined} from './ingredientLookup';
import {scaleInput} from './scaler';
import {runInference} from './inference';

/**
 * Accumulates nutrition and flags for a list of ingredient names,
 * then computes the final product health score using the test logic form collab.
 */
export async function computeProductHealthScore(
  ingredientNames: string[],
): Promise<{
  overallHealthScore: number;
  ingredientScores: Array<{name: string; score: number}>;
  harmfulFlags: {carcinogenic: string[]; preservative: string[]};
}> {
  // 1) List of 21 features (matching your TFLite model's input)
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
  ] as const;
  // Note: 'as const' keeps them read-only, but it's optional.

  // 2) Prepare accumulators for these nutrients
  const totalNutrients: {[key: string]: number} = {};
  for (const col of requiredFeatures) {
    totalNutrients[col] = 0;
  }

  const ingredientScores: Array<{name: string; score: number}> = [];
  const harmfulFlags = {
    carcinogenic: [] as string[],
    preservative: [] as string[],
  };

  // 3) Lookup each ingredient, accumulate data
  for (const ingName of ingredientNames) {
    const row = await findIngredientRowCombined(ingName);
    if (!row) {
      console.log(`No match for ingredient: ${ingName}`);
      continue;
    }

    // Convert string flags on the fly
    const isCarcinogenic = row.is_carcinogenic === 'TRUE';
    const isPreservative = row.is_harmful_preservative === 'TRUE';

    // Start from row.health_score or default 1.0
    let ingScore = row.health_score ?? 1.0;

    // Subtract if flagged
    if (isCarcinogenic) {
      ingScore -= 1;
      harmfulFlags.carcinogenic.push(ingName);
    }
    if (isPreservative) {
      ingScore -= 1;
      harmfulFlags.preservative.push(ingName);
    }

    // Clamp to [0,1]
    ingScore = Math.max(0, Math.min(1, ingScore));
    ingredientScores.push({name: ingName, score: ingScore});

    // 4) Accumulate the 21 features
    for (const col of requiredFeatures) {
      // Cast `col` to a valid key of the IngredientRow interface
      const key = col as keyof typeof row;

      // row[key] is typed as `number | string | undefined`, so cast to number
      // (since these columns are numeric in your interface)
      const val = row[key] as number;
      totalNutrients[col] += val || 0;
    }
  }

  // 5) Convert totals to an array for scaling
  const rawFeatures = requiredFeatures.map(col => totalNutrients[col]);

  // 6) Scale + run TFLite
  const scaled = scaleInput(rawFeatures);
  const tflitePrediction = await runInference(scaled);
  console.log('TFLite raw prediction:', tflitePrediction);

  // 7) Combine ingredient-level scores into final product score
  let overallHealthScore = 0;
  if (ingredientScores.length > 0) {
    const sum = ingredientScores.reduce((acc, obj) => acc + obj.score, 0);
    overallHealthScore = sum / ingredientScores.length;
  }

  // 8) Additional final deductions for flags
  if (harmfulFlags.carcinogenic.length > 0) {
    overallHealthScore -= 0.5;
  }
  if (harmfulFlags.preservative.length > 0) {
    overallHealthScore -= 0.3;
  }

  // 9) Clamp final
  overallHealthScore = Math.max(0, Math.min(1, overallHealthScore));

  return {
    overallHealthScore,
    ingredientScores,
    harmfulFlags,
  };
}
