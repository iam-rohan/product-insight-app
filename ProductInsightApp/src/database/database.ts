import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

let database: SQLiteDatabase;

export const initDatabase = async () => {
  database = await SQLite.openDatabase({
    name: 'productInsight.db',
    location: 'default',
  });

  // Create the Photos table if it doesn't exist, including ingredientList and rank columns
  database.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coverPhoto TEXT,
        ocrPhoto TEXT,
        ingredientList TEXT,
        rank TEXT DEFAULT 'C'
      )`,
      [],
      () => {
        console.log('Photos table verified or created successfully');
      },
      (_, error) => {
        console.error(
          'Error creating Photos table during initialization:',
          error,
        );
        return true; // Handle the error gracefully
      },
    );
  });

  console.log('Database initialized');
};

export const storePhotos = async (
  coverPhoto: string,
  ocrPhoto: string,
  ingredientList: string[],
  rank: string,
) => {
  return new Promise<void>((resolve, reject) => {
    database.transaction(tx => {
      // Insert the photos, ingredientList, and rank into the Photos table
      tx.executeSql(
        'INSERT INTO Photos (coverPhoto, ocrPhoto, ingredientList, rank) VALUES (?, ?, ?, ?)',
        [coverPhoto, ocrPhoto, JSON.stringify(ingredientList), rank],
        (_, result) => {
          console.log(
            'Photos and ingredient list stored successfully:',
            result,
          );
          resolve();
        },
        (_, error) => {
          console.error('Error storing photos and ingredient list:', error);
          reject(error);
          return true;
        },
      );
    });
  });
};

// Function to get all stored photos
export const getPhotos = async (): Promise<
  {
    id: number;
    coverPhoto: string;
    ocrPhoto: string;
    ingredientList: string;
    rank: string;
  }[]
> => {
  return new Promise(resolve => {
    database.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM Photos ORDER BY id DESC',
          [],
          (_, result) => {
            const photos = [];
            for (let i = 0; i < result.rows.length; i++) {
              photos.push(result.rows.item(i));
            }
            resolve(photos);
          },
          (_, error) => {
            console.log('No photos found or database error:', error);
            resolve([]); // Return an empty array if an error occurs
            return true; // Handle the error gracefully
          },
        );
      },
      error => {
        console.error('Transaction error during getPhotos:', error);
        resolve([]);
      },
    );
  });
};

// Function to delete a photo by ID
export const deletePhoto = async (id: number) => {
  return new Promise<void>((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Photos WHERE id = ?',
        [id],
        (_, result) => {
          console.log('Photo deleted successfully:', result);
          resolve();
        },
        (_, error) => {
          console.error('Error deleting photo:', error);
          reject(error);
          return true;
        },
      );
    });
  });
};
