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

    //送信者情報とディレクトリ取り出し
    const metadata: {
      RequestSender: IRequestSender,
      directory: string
    } = JSON.parse(req.body.metadata);

    db.serialize(() => {

      //この人用のファイルインデックス用テーブル作成
      db.run(
        `
        create table if not exists FILE` + metadata.RequestSender.userId + `(
          id TEXT PRIMARY KEY,
          userId TEXT DEFAULT ` + metadata.RequestSender.userId + `,
          name TEXT NOT NULL,
          isPublic BOOLEAN NOT NULL DEFAULT 0,
          size NUMBER NOT NULL,
          directory TEXT NOT NULL,
          uploadedDate TEXT NOT NULL
        )
        `,
        (err:Error) => {
          if (err) {
            res.status(500).send({ result:"ERROR_DB_THING" });
            return;
          }
        }
      );

      //ファイルId生成
      const fileIdGenerated = generateFileId(metadata.RequestSender.userId);
      //アップロード日時追加用
      const uploadedDate = new Date().toJSON();

      //ファイルデータ書き込み
      db.run(
        `
        INSERT INTO FILE` + metadata.RequestSender.userId + ` (
          id, name, size, directory, uploadedDate
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [fileIdGenerated, req.file.originalname, req.file.size, metadata.directory, uploadedDate],
        (err:Error) => {
          if (err) {
            console.log("uploadfile :: エラー->", err);
            res.status(500).send({ result:"ERROR_DB_THING" });
            return;
          } else {
            res.status(200).send({ result:"SUCCESS", data:fileIdGenerated });
            return;
          }
        }
      )

    });

  } catch (e) {

    console.log("/uploadfile :: エラー!->", e);
    res.status(500).send({ result:"ERROR_INTERNAL_THING" });
  
  }
}

/**
 * ファイルId用の文字列を生成するだけ
 */
const generateFileId = (userId: string):string => {
  //Id用変数
  let id = "";
  //乱数（１０桁）を追加していく
  for (let i=0; i<10; i++) {
    id += Math.floor(Math.random()*9).toString();
  }
  //ユーザーIdへ乱数を統合して返す
  const result:string = userId + id;
  return result;
}