import RNFS from 'react-native-fs';
import Papa from 'papaparse';

interface NutritionalInfo {
  [key: string]: number;
}

const datasetFileName = 'nutrient_lookup.csv';

// Function to copy dataset from assets to Document Directory
export const initializeDataset = async () => {
  const assetFilePath = `${RNFS.MainBundlePath}/assets/data/${datasetFileName}`;
  const destinationFilePath = `${RNFS.DocumentDirectoryPath}/${datasetFileName}`;

  // Check if the dataset already exists in Document Directory
  const fileExists = await RNFS.exists(destinationFilePath);
  if (!fileExists) {
    // Copy the file from assets to Document Directory
    await RNFS.copyFile(assetFilePath, destinationFilePath);
  }
};

// Function to load nutrient lookup data
export const loadNutrientLookup = async (): Promise<
  Map<string, NutritionalInfo>
> => {
  const csvFilePath = `${RNFS.DocumentDirectoryPath}/${datasetFileName}`;
  const csvFileContents = await RNFS.readFile(csvFilePath, 'utf8');

  return new Promise<Map<string, NutritionalInfo>>((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvFileContents, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<Record<string, string>>) => {
        const lookupTable = new Map<string, NutritionalInfo>();
        result.data.forEach((row: Record<string, string>) => {
          const ingredient = row.shrt_desc.toLowerCase();
          lookupTable.set(ingredient, {
            water_g: parseFloat(row.water_g),
            energ_kcal: parseFloat(row.energ_kcal),
            protein_g: parseFloat(row.protein_g),
            lipid_tot_g: parseFloat(row.lipid_tot_g),
            carbohydrt_g: parseFloat(row.carbohydrt_g),
            fiber_td_g: parseFloat(row.fiber_td_g),
            sugar_tot_g: parseFloat(row.sugar_tot_g),
            calcium_mg: parseFloat(row.calcium_mg),
            iron_mg: parseFloat(row.iron_mg),
            magnesium_mg: parseFloat(row.magnesium_mg),
            potassium_mg: parseFloat(row.potassium_mg),
            sodium_mg: parseFloat(row.sodium_mg),
            zinc_mg: parseFloat(row.zinc_mg),
            copper_mg: parseFloat(row.copper_mg),
            vit_c_mg: parseFloat(row.vit_c_mg),
            vit_b6_mg: parseFloat(row.vit_b6_mg),
            vit_b12_ug: parseFloat(row.vit_b12_ug),
            vit_a_iu: parseFloat(row.vit_a_iu),
            vit_e_mg: parseFloat(row.vit_e_mg),
            vit_d_ug: parseFloat(row.vit_d_ug),
            cholestrl_mg: parseFloat(row.cholestrl_mg),
          });
        });
        resolve(lookupTable);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};
