import fs from "fs";
import sqlite3 from "sqlite3";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";
const db = new sqlite3.Database("./records/FILEINDEX.db");

export default async function deleteFile(
  userId: string,
  fileId :string
):Promise<boolean> {
  try {

    //ファイル情報を取得、無ければエラー
    const fileInfo = await fetchFileInfo(fileId);
    if (fileInfo === null) return false;

    //ファイルを削除する
    fs.unlink('./STORAGE/USERFILE/' + userId + '/' + fileInfo.name, (err) => {
      if (err) {
        console.log(err);
        return false;
      }
    });

    //ファイルインデックスから削除する
    return new Promise((resolve) => {
      db.run(
        "DELETE FROM FILE" + userId + " WHERE id=?",
        fileId,
        (err) => {
        if (err) {
          resolve(false);
          return;
        } else {
          resolve(true);
          return;
        }
      });
    });

  } catch(e) {

    console.log("deleteFile :: エラー->", e);
    return false;

  }
}