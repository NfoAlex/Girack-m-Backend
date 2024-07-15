import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import type { IFile } from "../../type/File";

export default async function fetchFileInfo(fileId: string):Promise<IFile|null> {
  try {
    
    //ファイルIdからアップロード主を抜き出す
    const userId = fileId.slice(0,8);

    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM FILE` + userId + ` WHERE id=?
        `,
        fileId,
        (err:Error, fileInfo:[IFile]) => {
          if (err) {
            console.log("fetchFileInfo :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            console.log("fetchFileInfo :: db : 結果->", fileInfo);
            resolve(fileInfo[0]);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("fetchFileInfo :: エラー->", e);
    return null;

  }
}