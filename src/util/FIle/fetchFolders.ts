import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import type { IFolder } from "../../type/File";

export default async function fetchFolders(userId: string):Promise<IFolder|null> {
  try {
    
    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM FOLDER_LISTING WHERE userId=?
        `,
        userId,
        (err:Error, fileInfo:[IFolder]) => {
          if (err) {
            console.log("fetchFolders :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchFileInfo :: db : 結果->", fileInfo);
            resolve(fileInfo[0]);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("fetchFolders :: エラー->", e);
    return null;

  }
}