import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import type { IFolder } from "../../type/File";

/**
 * フォルダ情報を取得
 * @param _userId 
 * @param _folderId 
 * @returns 
 */
export default function fetchFolderInfo(_userId:string, _folderId:string):IFolder|null {
  try {

    //フォルダ情報取得
    const folderInfo = db.prepare(
      "SELECT * FROM FOLDERS WHERE userId=? AND id=?"
    ).get(_userId, _folderId) as IFolder|undefined;
    //undefinedならnull
    if (folderInfo === undefined) return null;

    return folderInfo;

  } catch(e) {

    console.log("folderInfo :: エラー->", e);
    return null;

  }
}