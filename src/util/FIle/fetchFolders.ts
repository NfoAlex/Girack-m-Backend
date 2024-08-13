import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import type { IFolder } from "../../type/File";

/**
 * 指定のフォルダに属するフォルダId群を取得する
 * @param _userId 
 * @param _positionedDirectoryId 
 * @returns 
 */
export default async function fetchFolders(
  _userId: string,
  _positionedDirectoryId = ""
):Promise<IFolder[]|null> {
  try {

    //フォルダId群を取得する
    const folders = db.prepare(
      `
      SELECT * FROM FOLDERS
        WHERE userId=? AND positionedDirectoryId=?
      `
    ).all(_userId, _positionedDirectoryId) as IFolder[] | undefined;
    //フォルダ情報がundefinedならnull
    if (folders === undefined) return null;

    return folders;

  } catch(e) {

    console.log("fetchFolders :: エラー->", e);
    return null;

  }
}