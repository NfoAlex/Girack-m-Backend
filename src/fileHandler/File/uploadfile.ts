import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");

import type IRequestSender from "../../type/requestSender";

/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default async function uploadfile(req:any, res:any) {
  try {

    console.log("/uploadfile :: ファイルが書き込まれました");
    // 補足データ（metadata）を取得し、JSONとしてパース
    console.log("/uploadfile :: これからの処理に使うreq.body.metadata->", req.body.metadata);

    //送信者情報取り出し
    const RequestSender:IRequestSender = JSON.parse(req.body.metadata);

    db.serialize(() => {

      //この人用のファイルインデックス用テーブル作成
      db.run(
        `
        create table if not exists FILE` + RequestSender.userId + `(
          id TEXT PRIMARY KEY,
          userId TEXT DEFAULT ` + RequestSender.userId + `,
          name TEXT NOT NULL,
          isPublic BOOLEAN NOT NULL DEFAULT 0,
          size NUMBER NOT NULL,
          uploadedDate TEXT NOT NULL
        )
        `,
        (err:Error) => {
          if (err) {
            res.status(500).send("ERROR_DB_THING");
            return;
          }
        }
      );

      //ファイルId生成
      const fileIdGenerated = () => {
        let id = "";
        for (let i=0; i<10; i++) {
          id += Math.floor(Math.random()*9).toString();
        }
        return RequestSender.userId + id;
      }
      //アップロード日時追加用
      const uploadedDate = new Date().toJSON();

      //ファイルデータ書き込み
      db.run(
        `
        INSERT INTO FILE` + RequestSender.userId + ` (
          id, name, size, uploadedDate
        )
        VALUES (?, ?, ?, ?)
        `,
        [fileIdGenerated(), req.file.originalname, req.file.size, uploadedDate],
        (err:Error) => {
          if (err) {
            console.log("uploadfile :: エラー->", err);
            res.status(500).send("ERROR_DB_THING");
            return;
          } else {
            res.status(200).send("SUCCESS");
            return;
          }
        }
      )

    });

  } catch (e) {

    console.log("/uploadfile :: エラー!->", e);
    res.status(500).send("ERROR_INTERNAL_THING");
  
  }
}