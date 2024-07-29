import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import type { IFile, IFolder } from "../../type/File";
import fetchFolders from "../../util/FIle/fetchFolders";

/**
 * フォルダーを作成する
 * @param userId 
 * @param folderName 
 * @param directory 
 */
export default async function createFolder(
  userId: string,
  folderName: string,
  directoryId: string = ""
):Promise<boolean> {
  try {

    //ファイルId生成
    const folderIdGenerated = () => {
      let id = "";
      for (let i=0; i<10; i++) {
        id += Math.floor(Math.random()*9).toString();
      }
      return id;
    }

    //ディレクトリデータを挿入
    return new Promise((resolve) => {
      db.run(
        `
        INSERT INTO FOLDERS (
          id, userId, name, positionedDirectoryId
        ) VALUES (?, ?, ?, ?)
        `,
        [folderIdGenerated(), userId, folderName, directoryId],
        (err:Error) => {
          if (err) {
            console.log("createFolder :: エラー->", err);
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("createFolder :: エラー->", e);
    return false;

  }
}