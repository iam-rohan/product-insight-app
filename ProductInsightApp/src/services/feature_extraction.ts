import RNFS from 'react-native-fs';
import Papa from 'papaparse';
import {Platform} from 'react-native';

interface NutritionalInfo {
  [key: string]: number | boolean;
}

const datasetFileName = 'nutrient_lookup.csv';

export const printPaths = () => {
  console.log('RNFS.DocumentDirectoryPath:', RNFS.DocumentDirectoryPath);
  if (Platform.OS === 'android') {
    console.log('Android Asset Path:', `assets/${datasetFileName}`);
  } else if (Platform.OS === 'ios') {
    console.log(
      'iOS Bundle Path:',
      `${RNFS.MainBundlePath}/${datasetFileName}`,
    );
  }
};

printPaths();

// Function to load nutrient lookup data directly from the assets directory
export const loadNutrientLookup = async (): Promise<
  Map<string, NutritionalInfo>
> => {
  try {
    let csvFilePath = '';

    if (Platform.OS === 'android') {
      // Copy file from assets to Document Directory on Android
      const destinationFilePath = `${RNFS.DocumentDirectoryPath}/${datasetFileName}`;
      console.log('Attempting to copy CSV file for Android');

      try {
        await RNFS.copyFileAssets(datasetFileName, destinationFilePath);
        csvFilePath = destinationFilePath;
        console.log('File copied to Document Directory:', destinationFilePath);
      } catch (copyError) {
        console.error('Error copying file from assets:', copyError);
        throw copyError;
      }
    } else if (Platform.OS === 'ios') {
      // For iOS, read directly from the MainBundlePath
      csvFilePath = `${RNFS.MainBundlePath}/${datasetFileName}`;
      console.log('File path for iOS:', csvFilePath);
    }

    console.log(`Reading CSV file from: ${csvFilePath}`);
    const csvFileContents = await RNFS.readFile(csvFilePath, 'utf8');
    console.log('CSV File Loaded Successfully');

    return new Promise<Map<string, NutritionalInfo>>((resolve, reject) => {
      Papa.parse<Record<string, string>>(csvFileContents, {
        header: true,
        skipEmptyLines: true,
        complete: (result: Papa.ParseResult<Record<string, string>>) => {
          if (!result.data || result.errors.length > 0) {
            console.error('CSV Parsing Error:', result.errors);
            reject(new Error('CSV parsing failed.'));
            return;
          }

          const lookupTable = new Map<string, NutritionalInfo>();
          result.data.forEach((row: Record<string, string>) => {
            if (row.shrt_desc) {
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
                is_carcinogenic: row.is_carcinogenic.toLowerCase() === 'true',
                is_harmful_preservative:
                  row.is_harmful_preservative.toLowerCase() === 'true',
              });
            }
          });

          if (lookupTable.size === 0) {
            reject(new Error('Parsed lookup table is empty.'));
          } else {
            console.log('Parsed lookup table successfully');
            resolve(lookupTable);
          }
        },
        error: (error: Error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading nutrient lookup data:', error);
    throw error;
  }
};

// Function to analyze ingredients using the nutrient lookup data
export const analyzeIngredients = async (ingredientList: string[]) => {
  try {
    const lookupTable = await loadNutrientLookup();
    if (!lookupTable || lookupTable.size === 0) {
      throw new Error('Lookup table is empty or not loaded.');
    }

    const recognized: string[] = [];
    const unrecognized: string[] = [];
    const carcinogenic: string[] = [];
    const harmful: string[] = [];

    ingredientList.forEach(ingredient => {
      if (!ingredient) return; // Skip undefined or empty ingredients

      const lowerCaseIngredient = ingredient.toLowerCase();
      if (lookupTable.has(lowerCaseIngredient)) {
        recognized.push(ingredient);
        const nutritionalInfo = lookupTable.get(lowerCaseIngredient);
        if (nutritionalInfo) {
          if (nutritionalInfo.is_carcinogenic) {
            carcinogenic.push(ingredient);
          }
          if (nutritionalInfo.is_harmful_preservative) {
            harmful.push(ingredient);
          }
        }
      } else {
        unrecognized.push(ingredient);
      }
    });

    return {
      recognized,
      unrecognized,
      carcinogenic,
      harmful,
    };
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    throw error;
  }
};
