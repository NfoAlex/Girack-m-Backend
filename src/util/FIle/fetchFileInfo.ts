import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import type { IFile } from "../../type/File";

/**
 * ファイル情報を取得する
 * @param _fileId 
 * @returns 
 */
export default function fetchFileInfo(_fileId: string):IFile|null {
  try {
    
    //ファイルIdからアップロード主を抜き出す
    const userId = _fileId.slice(0,8);

    //ファイル情報を取得
    const fileInfo = db.prepare(
      `SELECT * FROM FILE${userId} WHERE id=?`
    ).get(_fileId) as IFile | undefined;
    //undefinedならnullを返す
    if (fileInfo === undefined) return null;

    return fileInfo;

  } catch(e) {

    console.log("fetchFileInfo :: エラー->", e);
    return null;

  }
}