import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';


let database: SQLiteDatabase;
type RankType = 'A' | 'B' | 'C' | 'D' | 'E';
type Photo = {
  id: number;
  coverPhoto: string;
  ocrPhoto: string;
  rank: RankType;
  timestamp: number;
};



export const initDatabase = async () => {
  database = await SQLite.openDatabase({
    name: 'productInsight.db',
    location: 'default',
  });

  // Create the Photos table if it doesn't exist
  database.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        coverPhoto TEXT, 
        ocrPhoto TEXT, 
        rank TEXT DEFAULT 'C', 
        timestamp INTEGER DEFAULT (CAST(strftime('%s', 'now') AS INTEGER))
      )`,
      [],
      () => console.log('Photos table verified or created successfully'),
      (_, error) => {
        console.error('Error creating Photos table:', error);
        return true;
      }
    );
  });


  console.log('Database initialized');
};


export const storePhotos = async (coverPhoto: string, ocrPhoto: string, rank: RankType = 'C') => {
  return new Promise<void>((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000); // Ensure correct timestamp format
    
    database.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Photos (coverPhoto, ocrPhoto, rank, timestamp) VALUES (?, ?, ?, ?)',
        [coverPhoto, ocrPhoto, rank, timestamp],
        () => {
          console.log('Photo stored successfully with rank:', rank);
          resolve();
        },
        (_, error) => {
          console.error('Error storing photo:', error);
          reject(error);
          return true;
        },
      );
    });
  });
};


// Function to get all stored photos
export const getPhotos = async (): Promise<Photo[]> => {
  return new Promise((resolve) => {
    database.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT id, coverPhoto, ocrPhoto, rank, timestamp FROM Photos ORDER BY id DESC',
          [],
          (_, result) => {
            const photos: Photo[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const item = result.rows.item(i);
              photos.push({
                id: item.id,
                coverPhoto: item.coverPhoto,
                ocrPhoto: item.ocrPhoto,
                rank: item.rank,
                timestamp: item.timestamp,
              });
            }
            resolve(photos);
          },
          (_, error) => {
            console.error('Error retrieving photos:', error);
            resolve([]);
            return true;
          }
        );
      },
      (error) => {
        console.error('Transaction error during getPhotos:', error);
        resolve([]);
      }
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
