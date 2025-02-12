export const MEANS = [
  54.053757746155604, // water_g
  226.08773238466836, // energ_kcal
  11.420110167546477, // protein_g
  10.588722171218729, // lipid_tot_g
  21.945500918062887, // carbohydrt_g
  2.0292919439981634, // fiber_td_g
  6.651211843011247, // sugar_tot_g
  73.27547624512279, // calcium_mg
  2.667798370438375, // iron_mg
  32.46212990589856, // magnesium_mg
  267.299116364471, // potassium_mg
  311.65630020656414, // sodium_mg
  1.9524753270599036, // zinc_mg
  0.16960408537984853, // copper_mg
  8.133268303878816, // vit_c_mg
  0.26251491852191866, // vit_b6_mg
  1.2119101445949048, // vit_b12_ug
  679.7416226761533, // vit_a_iu
  0.8779584576543493, // vit_e_mg
  7.519491622676153, // vit_d_ug
  39.15302960752812, // cholestrl_mg
];

/**
 * The scale (std dev) values for each of the 21 features,
 * in the same order as MEANS.
 */
export const SCALES = [
  30.759569578348096, // water_g
  169.69778738659332, // energ_kcal
  10.54138702801659, // protein_g
  15.835960524498052, // lipid_tot_g
  27.245864188832684, // carbohydrt_g
  4.289019642269225, // fiber_td_g
  13.654481280216425, // sugar_tot_g
  200.4847857697447, // calcium_mg
  5.690831010216478, // iron_mg
  55.92706589740922, // magnesium_mg
  374.17921648796687, // potassium_mg
  943.7747715647922, // sodium_mg
  3.3454106785452096, // zinc_mg
  0.5478877884205093, // copper_mg
  61.73455463423163, // vit_c_mg
  0.4729195819376695, // vit_b6_mg
  4.292765319636072, // vit_b12_ug
  3704.715286759799, // vit_a_iu
  3.8286083947282727, // vit_e_mg
  88.11305377797763, // vit_d_ug
  117.80246740212698, // cholestrl_mg
];

/**
 * Converts an array of 21 raw feature values into a scaled Float32Array
 * by applying (value - mean) / scale for each feature index.
 */

export function scaleInput(rawFeatures: number[]): Float32Array {
  if (rawFeatures.length !== MEANS.length) {
    throw new Error(
      `Expected ${MEANS.length} features, but received ${rawFeatures.length}.`,
    );
  }

  // Scale each feature
  const scaled = rawFeatures.map((val, i) => (val - MEANS[i]) / SCALES[i]);

  // Return as Float32Array for TFLite input
  return new Float32Array(scaled);
}
