import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import type { IFile } from "../../type/File";

export default async function fetchFileIndex(
  userId: string,
  directory: string = "",
  searchQuery: string = ""
):Promise<IFile[]|null> {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM FILE` + userId + `
          WHERE directory=?
          AND
          name LIKE '%` + searchQuery + `%'
        `,
        directory,
        (err:Error, fileIndex:IFile[]) => {
          if (err) {
            console.log("fetchFileIndex :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            //console.log("fetchFileIndex :: db : 結果->", fileIndex);
            resolve(fileIndex);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("fetchFileIndex :: db : エラー->", e);
    return null;

  }
}