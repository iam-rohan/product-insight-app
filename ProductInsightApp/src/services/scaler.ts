export const MEANS = [
  0.540231, // water_g
  0.251841, // energ_kcal
  0.283135, // protein_g
  0.130083, // lipid_tot_g
  0.242574, // carbohydrt_g
  0.094791, // fiber_td_g
  0.107183, // sugar_tot_g
  0.046784, // calcium_mg
  0.149719, // iron_mg
  0.064459, // magnesium_mg
  0.129456, // potassium_mg
  0.135911, // sodium_mg
  0.18356, // zinc_mg
  0.051164, // copper_mg
  0.041505, // vit_c_mg
  0.1242, // vit_b6_mg
  0.098355, // vit_b12_ug
  0.049541, // vit_a_iu
  0.038166, // vit_e_mg
  0.109792, // vit_d_ug
  0.112457, // cholestrl_mg
  0.000646, // is_carcinogenic
  0.001363, // is_harmful_preservative
];

export const SCALES = [
  0.30769, // water_g
  0.189228, // energ_kcal
  0.250197, // protein_g
  0.181585, // lipid_tot_g
  0.301201, // carbohydrt_g
  0.169502, // fiber_td_g
  0.213167, // sugar_tot_g
  0.103439, // calcium_mg
  0.204116, // iron_mg
  0.106005, // magnesium_mg
  0.129589, // potassium_mg
  0.180454, // sodium_mg
  0.230526, // zinc_mg
  0.10127, // copper_mg
  0.118171, // vit_c_mg
  0.17328, // vit_b6_mg
  0.184447, // vit_b12_ug
  0.14984, // vit_a_iu
  0.122351, // vit_e_mg
  0.278485, // vit_d_ug
  0.171398, // cholestrl_mg
  0.025399, // is_carcinogenic
  0.036891, // is_harmful_preservative
];

export function scaleInput(rawFeatures: number[]): Float32Array {
  if (rawFeatures.length !== MEANS.length) {
    throw new Error(
      `Expected ${MEANS.length} features, but received ${rawFeatures.length}.`,
    );
  }

  const scaled = rawFeatures.map((val, i) => (val - MEANS[i]) / SCALES[i]);

  return new Float32Array(scaled);
}
