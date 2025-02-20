import {findIngredientRow, IngredientRow} from './ingredientLookup';
import {scaleInput} from './scaler';
import {runInference} from './inference';

export async function computeProductHealthScore(
  ingredientNames: string[],
): Promise<{
  overallHealthScore: number;
  ingredientScores: Array<{name: string; score: number}>;
  harmfulFlags: {carcinogenic: string[]; preservative: string[]};
  unrecognizedIngredients: string[];
  recognizedIngredients: string[]; // ✅ Added recognizedIngredients
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

  const totalNutrients: {[key: string]: number} = Object.fromEntries(
    requiredFeatures.map(col => [col, 0]),
  );

  const ingredientScores: Array<{name: string; score: number}> = [];
  const harmfulFlags = {
    carcinogenic: [] as string[],
    preservative: [] as string[],
  };
  const unrecognizedIngredients: string[] = [];
  const recognizedIngredients: string[] = []; // ✅ Store recognized ingredients

  const ingredientRows: IngredientRow[] = [];

  for (const ingName of ingredientNames) {
    console.log(`Processing ingredient: "${ingName}"`);
    const row = await findIngredientRow(ingName);

    if (!row) {
      console.warn(`No match found for ingredient: "${ingName}"`);
      unrecognizedIngredients.push(ingName);
      continue;
    }

    recognizedIngredients.push(row.shrt_desc); // ✅ Add recognized ingredient name
    ingredientRows.push(row);

    if (row.is_carcinogenic === 'TRUE') {
      harmfulFlags.carcinogenic.push(row.shrt_desc);
    }
    if (row.is_harmful_preservative === 'TRUE') {
      harmfulFlags.preservative.push(row.shrt_desc);
    }
  }

  if (ingredientRows.length === 0) {
    console.warn('No recognized ingredients found. Returning default values.');
    return {
      overallHealthScore: 0,
      ingredientScores: [],
      harmfulFlags,
      unrecognizedIngredients,
      recognizedIngredients,
    };
  }

  for (const row of ingredientRows) {
    for (const col of requiredFeatures) {
      totalNutrients[col] += (row[col] as number) || 0;
    }
  }

  console.log('Total nutrients before scaling:', totalNutrients);

  // **Batch Process Ingredient Scores**
  const rawIngredientFeatures = ingredientRows.map(row =>
    requiredFeatures.map(col => row[col] as number),
  );
  const scaledIngredientInputs = rawIngredientFeatures.map(scaleInput);
  const ingredientPredictions = await Promise.all(
    scaledIngredientInputs.map(input => runInference(Array.from(input))),
  );

  ingredientRows.forEach((row, index) => {
    ingredientScores.push({
      name: row.shrt_desc,
      score: ingredientPredictions[index],
    });
  });

  // **Compute Overall Product Score**
  const scaled = Array.from(
    scaleInput(requiredFeatures.map(col => totalNutrients[col])),
  );
  let overallHealthScore = await runInference(scaled);

  if (harmfulFlags.carcinogenic.length > 0) {
    overallHealthScore *= 0.1; // Reduce drastically if carcinogens are found
  }
  if (harmfulFlags.preservative.length > 0) {
    overallHealthScore *= 0.5; // Reduce moderately for preservatives
  }

  overallHealthScore = Math.max(0, Math.min(1, overallHealthScore));

  return {
    overallHealthScore,
    ingredientScores,
    harmfulFlags,
    unrecognizedIngredients,
    recognizedIngredients, // ✅ Return recognized ingredients
  };
}
