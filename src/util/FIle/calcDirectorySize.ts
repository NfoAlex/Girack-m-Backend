import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import type { IFile } from "../../type/File";

/**
 * 指定ディレクトリのサイズを計算
 */
export default function calcDirectorySize(
  _userId: string,
  _directoryId = ""
):number|null {
  try {

    //ディレクトリのトータル容量
    let totalSize = 0;
    //ルートディレクトリ（すべてのトータル容量）を計算するかどうか
      // "" = ルートディレクトリ
    const optionCalculatingRootDirectory:boolean = _directoryId==='';

    //この人用のファイルインデックス用テーブルが無ければここで作成
    db.exec(
      `
      create table if not exists FILE${_userId}(
        id TEXT PRIMARY KEY,
        userId TEXT DEFAULT ${_userId},
        name TEXT NOT NULL,
        actualName TEXT NOT NULL,
        isPublic BOOLEAN NOT NULL DEFAULT 0,
        type TEXT NOT NULL,
        size NUMBER NOT NULL,
        directory TEXT NOT NULL,
        uploadedDate TEXT NOT NULL
      )
      `
    );

    //ファイル情報を格納する変数
    let files:IFile[] = [];

    //すべてのファイル分容量計算をするかどうかでファイル取得のSQL構文を変える
    if (optionCalculatingRootDirectory) {
      files = db.prepare(
        `SELECT * FROM FILE${_userId}`
      ).all() as IFile[];
    } else {
      files = db.prepare(
        `SELECT * FROM FILE${_userId} WHERE directory=?`
      ).all(_directoryId) as IFile[];
    }

    //ループして総容量変数へ加算していく
    for (const f of files) {
      totalSize += f.size;
    }

    return totalSize;

  } catch(e) {

    console.log("calcDirectorySize :: エラー->", e);
    return null;

  }
}