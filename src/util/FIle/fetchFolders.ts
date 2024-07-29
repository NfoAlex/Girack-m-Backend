import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import type { IFolder } from "../../type/File";

export default async function fetchFolders(
  userId: string,
  positionedDirectoryId: string = ""
):Promise<IFolder[]|null> {
  try {
    
    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM FOLDERS
          WHERE userId=? AND positionedDirectoryId=?
        `,
        [userId, positionedDirectoryId],
        (err:Error, fileInfo:IFolder[]) => {
          if (err) {
            console.log("fetchFolders :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            console.log("fetchFolders :: db : 結果->", fileInfo);
            resolve(fileInfo);
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