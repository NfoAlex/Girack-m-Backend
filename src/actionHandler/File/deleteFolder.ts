import fs from "node:fs";

import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import fetchFolders from "../../util/FIle/fetchFolders";
import fetchFileIndex from "./fetchFileIndex";

import type { IFolder } from "../../type/File";

/**
 * フォルダを削除する
 * @param _userId 
 * @param _folderId 
 * @returns 
 */
export default function deleteFolder(
  _userId: string,
  _folderId: string
):boolean {
  try {

    //削除するフォルダーに含まれるすべての下部フォルダId配列
    let folderIdArr:string[] = [_folderId];
    //下部フォルダId用配列の順番用変数
    let index = 0;

    //探索結果に配列がある限り追加を続ける
    while (folderIdArr[index] !== undefined) {
      //その中のフォルダを取得
      const foldersFetched:IFolder[]|null = fetchFolders(_userId, folderIdArr[index]);
      //もしフォルダ情報がとれたのなら探索結果配列へIdを追加
      if (foldersFetched !== null) {
        for (const folder of foldersFetched) {
          folderIdArr.push(folder.id);
        }
        //重複を省く
        folderIdArr = Array.from(new Set(folderIdArr));
      }

      //次のフォルダへ進める
      index++;
    }

    //フォルダId配列をループしそれぞれにあるファイルを全削除
    for (const folderId of folderIdArr) {

      //ファイルインデックス取得
      const fileIndex = fetchFileIndex(_userId, folderId);

      //もしファイルが存在するなら削除
      if (fileIndex !== null) {
        for (const file of fileIndex) {
          //ファイルを削除する
          fs.unlink(`./STORAGE/USERFILE/${_userId}/${file.actualName}`, (err) => {
            if (err) {
              console.log("deleteFolder :: ファイル削除 : このファイル削除ではエラー->", err);
            }
          });
          //ファイルインデックスを削除
          db.prepare(`DELETE FROM FILE${_userId} WHERE id=?`).run(file.id);
        }
      }

      //ファイルインデックスを削除
      db.prepare("DELETE FROM FOLDERS WHERE id=?").run(folderId);
    }

    return true;

  } catch(e) {

    console.log("deleteFolder :: エラー->", e);
    return false;

  }
}