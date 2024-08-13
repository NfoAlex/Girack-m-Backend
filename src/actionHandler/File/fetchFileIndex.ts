import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import type { IFile } from "../../type/File";

/**
 * 指定ユーザーのファイルインデックス取得
 * @param _userId 
 * @param _directory 
 * @param _searchQuery 
 * @returns 
 */
export default function fetchFileIndex(
  _userId: string,
  _directory = "",
  _searchQuery = ""
):IFile[]|null {
  try {

    //ファイルインデックスを取得
    const FileIndex = db.prepare(
      `
      SELECT * FROM FILE${_userId}
        WHERE directory=?
        AND
        name LIKE '%${_searchQuery}%'
      `
    ).all(_directory) as IFile[];

    return FileIndex;

  } catch(e) {

    console.log("fetchFileIndex :: db : エラー->", e);
    return null;

  }
}