import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import fetchFileInfo from "../../util/FIle/fetchFileInfo";

/**
 * ファイルの公開設定をトグル
 */
export default async function toggleFileIsPublic(userId:string, fileId:string)
:Promise<boolean> {
  try {

    //ファイル情報を取得して無ければ停止する
    const fileInfo = await fetchFileInfo(fileId);
    if (fileInfo === null) return false;

    return new Promise((resolve) => {
      db.run(
        `
        UPDATE FILE` + userId + ` SET
          isPublic=?
        WHERE id=?
        `,
        [!fileInfo.isPublic, fileId], //反対にするだけ
        (err:Error) => {
          if (err) {
            console.log("toggleFileIsPublic :: db : エラー->", err);
            resolve(false);
            return;
          } else {
            resolve(true);
            return;
          }
        }
      );
    });

  } catch(e) {

    console.log("toggleFileIsPublic :: エラー->", e);
    return false;

  }
}