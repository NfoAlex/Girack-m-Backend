import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import fetchFileInfo from "../../util/FIle/fetchFileInfo";

/**
 * ファイルの公開設定をトグル
 * @param _userId 
 * @param _fileId 
 * @returns 
 */
export default function toggleFileIsPublic(_userId:string, _fileId:string)
:boolean {
  try {

    //ファイル情報を取得して無ければ停止する
    const fileInfo = fetchFileInfo(_fileId);
    if (fileInfo === null) return false;

    //ファイルの公開設定切り替えを記録
    db.prepare(
      `
      UPDATE FILE${_userId} SET
        isPublic=?
      WHERE id=?
      `
    ).run(!fileInfo.isPublic?1:0, _fileId);

    return true;

  } catch(e) {

    console.log("toggleFileIsPublic :: エラー->", e);
    return false;

  }
}