import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");

import { IFolder } from "../../type/File";

export default async function fetchFolderInfo(userId:string, folderId:string):Promise<IFolder|null> {
  try {

    return new Promise((resolve) => {
      db.all(
        `
        SELECT * FROM FOLDERS
          WHERE userId=? AND id=?
        `,
        [userId, folderId],
        (err:Error, folderInfo:[IFolder]) => {
          if (err) {
            console.log("fetchFolderInfo :: db : エラー->", err);
            resolve(null);
            return;
          } else {
            console.log("fetchFolderInfo :: db : 結果->", folderInfo);
            //もし最初のものが無いならnullを返す
            if (folderInfo[0] === undefined) {
              resolve(null);
            } else {
              resolve(folderInfo[0]);
            }
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("folderInfo :: エラー->", e);
    return null;

  }
}