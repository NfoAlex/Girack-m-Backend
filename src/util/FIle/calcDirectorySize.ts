import sqlite3 from "sqlite3";
import { IFile } from "../../type/File";
const db = new sqlite3.Database("./records/FILEINDEX.db");

/**
 * 指定ディレクトリのサイズを計算
 */
export default function calcDirectorySize(
  userId: string,
  directoryId: string = ""
):Promise<number|null>|null {
  try {

    //ディレクトリのトータル容量
    let totalSize:number = 0;
    //ルートディレクトリ（すべてのトータル容量）を計算するかどうか
      // "" = ルートディレクトリ
    let optionCalculatingRootDirectory:boolean = directoryId==='';

    //容量計算
    return new Promise((resolve) => {
      //ルートディレクトリを計算するかどうかで処理を変える
      if (optionCalculatingRootDirectory) {

        db.all(
          `
          SELECT * FROM FILE` + userId + `
          `
          ,
          (err:Error, files:IFile[]) => {
            if (err) {
              console.log("calcDirectorySize :: db : エラー->", err);
              resolve(null);
              return;
            } else {
              console.log("calcDirectorySize :: db : 結果(filesの数)->", files.length);
              
              //ループして容量を加算
              for (let file of files) {
                totalSize += file.size;
              }
  
              console.log("calcDirectorySize :: db : 結果->", totalSize);
  
              resolve(totalSize);
              return;
            }
          }
        );

      } else {

        db.all(
          `
          SELECT * FROM FILE` + userId + `
            WHERE directory=?
          `
          ,
          [directoryId],
          (err:Error, files:IFile[]) => {
            if (err) {
              console.log("calcDirectorySize :: db : エラー->", err);
              resolve(null);
              return;
            } else {
              console.log("calcDirectorySize :: db : 結果(filesの数)->", files.length);
              
              //ループして容量を加算
              for (let file of files) {
                totalSize += file.size;
              }
  
              console.log("calcDirectorySize :: db : 結果->", totalSize);
  
              resolve(totalSize);
              return;
            }
          }
        );

      }
      
    });

  } catch(e) {

    console.log("calcDirectorySize :: エラー->", e);
    return null;

  }
}