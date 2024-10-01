import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

// Create a database variable
let database: SQLiteDatabase;

// Initialize the database
export const initDatabase = async () => {
  database = await SQLite.openDatabase({
    name: 'productInsight.db',
    location: 'default',
  });
  console.log('Database initialized');
};

// Function to store photos
export const storePhotos = async (coverPhoto: string, ocrPhoto: string) => {
  return new Promise<void>((resolve, reject) => {
    database.transaction(tx => {
      // Create the Photos table if it doesn't exist
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Photos (id INTEGER PRIMARY KEY AUTOINCREMENT, coverPhoto TEXT, ocrPhoto TEXT)',
        [],
        () => {
          console.log('Table created successfully');
        },
        (_, error) => {
          console.error('Error creating table:', error);
          reject(error);
          return true; // Return true to indicate that the error is handled
        },
      );

      // Insert the photos into the Photos table
      tx.executeSql(
        'INSERT INTO Photos (coverPhoto, ocrPhoto) VALUES (?, ?)',
        [coverPhoto, ocrPhoto],
        (_, result) => {
          console.log('Photos stored successfully:', result);
          resolve();
        },
        (_, error) => {
          console.error('Error storing photos:', error);
          reject(error);
          return true; // Return true to indicate that the error is handled
        },
      );
    });
  });
};

// Function to get cover photo
export const getCoverPhoto = async (): Promise<string | null> => {
  return new Promise<string | null>((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT coverPhoto FROM Photos ORDER BY id DESC LIMIT 1',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0).coverPhoto);
          } else {
            resolve(null); // No cover photo found
          }
        },
        (_, error) => {
          console.error('Error retrieving cover photo:', error);
          reject(error);
          return true; // Return true to indicate that the error is handled
        },
      );
    });
  });
};
