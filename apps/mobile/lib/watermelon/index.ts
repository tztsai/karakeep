import { Platform } from "react-native";
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

import Bookmark from "./models/Bookmark";
import ImportedFile from "./models/ImportedFile";
import schema from "./schema";

// import migrations from './migrations'; // We'll create this if we have migrations later

const adapter = new SQLiteAdapter({
  schema,
  // migrations, // We can add migrations in the future if needed
  jsi: Platform.OS === "ios", // JSI is recommended on iOS for performance
  // dbName: 'KarakeepWatermelonDB', // Optional: specify database name
  // onSetUpError: error => {
  //   // Database failed to load -- offer user to reset the app (the delete the database) or other recovery mode
  //   console.error("Failed to setup WatermelonDB:", error);
  // }
});

export const database = new Database({
  adapter,
  modelClasses: [Bookmark, ImportedFile],
});

// Optional: A helper function to clear the database for development/testing
// export async function resetDatabase() {
//   await database.write(async () => {
//     await database.unsafeResetDatabase();
//     console.log("Database reset");
//   });
// }
