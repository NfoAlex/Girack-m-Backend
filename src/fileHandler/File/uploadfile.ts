import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/FILEINDEX.db");
import fetchFolderInfo from "./fetchFolderInfo";

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
    //console.log("/uploadfile :: これからの処理に使うreq.body.metadata->", req.body);

    //送信者情報とディレクトリ取り出し
    const metadata: {
      RequestSender: IRequestSender,
      directory: string
    } = JSON.parse(req.body.metadata);

    //チャンネルフォルダを作成するかどうかフラグ
    let flagCreateChannelFolder:boolean = false;
    //もしディレクトリIdがチャンネルフォルダに該当するならディレクトリが作成されているかを確認
    const regexChannelId = /^C\d{4}$/;
    if (metadata.directory.match(regexChannelId) !== null) {
      //このチャンネル用のフォルダを取得
      const directoryForChannel = await fetchFolderInfo(metadata.RequestSender.userId, metadata.directory);
      console.log("/uploadfile :: フォルダあるかどうか->", directoryForChannel);
      //フォルダが無いのなら作るようにフラグをたてる
      if (directoryForChannel === null) flagCreateChannelFolder = true;
    }

    db.serialize(() => {

      //この人用のファイルインデックス用テーブル作成
      db.run(
        `
        create table if not exists FILE` + metadata.RequestSender.userId + `(
          id TEXT PRIMARY KEY,
          userId TEXT DEFAULT ` + metadata.RequestSender.userId + `,
          name TEXT NOT NULL,
          isPublic BOOLEAN NOT NULL DEFAULT 0,
          type TEXT NOT NULL,
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

      //チャンネル用フォルダを作るフラグが有効なら作成
      if (flagCreateChannelFolder) {
        db.run(
          `
          INSERT INTO FOLDERS (
            id, userId, name, positionedDirectoryId
          ) VALUES (?, ?, ?, ?)
          `,
          [metadata.directory, metadata.RequestSender.userId, metadata.directory, ""],
          (err:Error) => {
            if (err) {
              console.log("/uploadfile :: エラー->", err);
              res.status(500).send({ result:"ERROR_DB_THING" });
              return;
            }
          }
        );
      }

      //ファイルId生成
      const fileIdGenerated = generateFileId(metadata.RequestSender.userId);
      //アップロード日時追加用
      const uploadedDate = new Date().toJSON();

      //ファイルデータ書き込み
      db.run(
        `
        INSERT INTO FILE` + metadata.RequestSender.userId + ` (
          id, name, type, size, directory, uploadedDate
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          fileIdGenerated,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          metadata.directory,
          uploadedDate
        ],
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