import fs from "fs";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import fetchFolders from "../../util/FIle/fetchFolders";
import fetchFileIndex from "./fetchFileIndex";

import type { IFolder } from "../../type/File";

/**
 * フォルダを削除する
 * @param userId 
 * @param folderId 
 * @returns 
 */
export default async function deleteFolder(
  userId: string,
  folderId: string
) {
  try {

    //削除するフォルダーに含まれるすべての下部フォルダId配列
    let folderIdArr:string[] = [folderId];
    //下部フォルダId用配列の順番用変数
    let index = 0;

    //探索結果に配列がある限り追加を続ける
    while (folderIdArr[index] !== undefined) {
      //その中のフォルダを取得
      const foldersFetched:IFolder[]|null = await fetchFolders(userId, folderIdArr[index]);
      //もしフォルダ情報がとれたのなら探索結果配列へIdを追加
      if (foldersFetched !== null) {
        foldersFetched.forEach((folder:IFolder) => {
          folderIdArr.push(folder.id);
        });
        //重複を省く
        folderIdArr = Array.from(new Set(folderIdArr));
      }

      //次のフォルダへ進める
      index++;
    }

    //フォルダId配列をループしそれぞれにあるファイルを全削除
    for (let folderId of folderIdArr) {

      //ファイルインデックス取得
      const fileIndex = await fetchFileIndex(userId, folderId);

      //もしファイルが存在するなら削除
      if (fileIndex !== null) {
        for (let file of fileIndex) {
          //ファイルを削除する
          fs.unlink('./STORAGE/USERFILE/' + userId + '/' + file.name, (err) => {
            if (err) {
              console.log("deleteFolder :: ファイル削除 : このファイル削除ではエラー->", err);
            }
          });
          //ファイルインデックスを削除
          db.run(
            "DELETE FROM FILE" + userId + " WHERE id=?",
            file.id,
            (err) => {
            if (err) {
              console.log("deleteFolder :: DB(インデックス削除) : このファイルインデックス削除ではエラー->", err);
            }
          });
        }
      }

      //ファイルインデックスを削除
      db.run(
        "DELETE FROM FOLDERS WHERE id=?",
        folderId,
        (err) => {
        if (err) {
          console.log("deleteFolder :: DB(フォルダー削除) : このフォルダー削除ではエラー->", err);
        }
      });

    }

    return true;

  } catch(e) {

    console.log("deleteFolder :: エラー->", e);
    return false;

  }
}