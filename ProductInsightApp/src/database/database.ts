import SQLite, {
  SQLiteDatabase,
  Transaction,
  SQLError,
} from 'react-native-sqlite-storage';

// Open or create the SQLite database
const db: SQLiteDatabase = SQLite.openDatabase(
  {
    name: 'photos.db',
    location: 'default',
  },
  () => {
    console.log('Database opened successfully');
    initDatabase(); // Initialize the database and create the table after successful opening
  },
  (error: SQLError) => {
    console.error('Error opening database:', error);
  },
);

// Create the photos table if it doesn't exist
const createTable = () => {
  db.transaction((tx: Transaction) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS photos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uri TEXT NOT NULL
        );`,
      [],
      () => {
        console.log('Table created successfully');
      },
      (tx: Transaction, error: SQLError) => {
        console.error('Error creating table:', error);
      },
    );
  });
};

// Store a photo URI in the database
const storePhoto = (uri: string): Promise<void> => {
  console.log('Storing photo with URI:', uri); // Log the URI before storing
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: Transaction) => {
        tx.executeSql(
          `INSERT INTO photos (uri) VALUES (?);`,
          [uri],
          () => {
            console.log('Photo stored successfully:', uri);
            resolve(); // Resolve promise on success
          },
          (tx: Transaction, error: SQLError) => {
            console.error('Error storing photo:', error.message || error); // Improved error logging
            reject(error); // Reject promise on error
          },
        );
      },
      error => {
        console.error('Transaction error:', error.message || error); // Log transaction error if any
        reject(error); // Reject promise on transaction error
      },
    );
  });
};

// Retrieve all photo URIs from the database
const getPhotos = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: Transaction) => {
      tx.executeSql(
        `SELECT uri FROM photos;`,
        [],
        (tx: Transaction, results) => {
          const photos: string[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            photos.push(results.rows.item(i).uri);
          }
          console.log('Photos fetched successfully:', photos);
          resolve(photos); // Resolve with the fetched photo URIs
        },
        (tx: Transaction, error: SQLError) => {
          console.error('Error fetching photos:', error.message || error);
          reject(error); // Reject promise on error
        },
      );
    });
  });
};

// Initialize the database and create the photos table
const initDatabase = () => {
  console.log('Initializing database...');
  createTable(); // Ensure the table is created
};

// Initialize the database when the module is loaded
initDatabase();

export {storePhoto, getPhotos};
