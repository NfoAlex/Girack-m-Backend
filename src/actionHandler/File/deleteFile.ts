import fs from "node:fs";
import fetchFileInfo from "../../util/FIle/fetchFileInfo";

import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

/**
 * ファイルを削除する
 * @param userId 
 * @param fileId 
 * @returns 
 */
export default function deleteFile(
  _userId: string,
  _fileId :string
):boolean {
  try {

    //ファイル情報を取得、無ければエラー
    const fileInfo = fetchFileInfo(_fileId);
    if (fileInfo === null) return false;

    //ファイルを削除する
    fs.unlink(`./STORAGE/USERFILE/${_userId}/${fileInfo.actualName}`, (err) => {
      if (err) {
        console.log(err);
        return false;
      }
    });

    //テーブルからもファイルデータを削除
    db.prepare(
      `DELETE FROM FILE${_userId} WHERE id=?`
    ).run(_fileId);

    return true;

  } catch(e) {

    console.log("deleteFile :: エラー->", e);
    return false;

  }
}