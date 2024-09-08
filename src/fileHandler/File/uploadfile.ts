import Database from 'better-sqlite3';
const db = new Database('./records/FILEINDEX.db');
db.pragma('journal_mode = WAL');

import fetchFolderInfo from "./fetchFolderInfo";

import type IRequestSender from "../../type/requestSender";

/**
 * ファイルのアップロード処理
 * @param req 
 * @param res 
 * @returns 
 */
export default function uploadfile(req:any, res:any) {
  try {

    //console.log("/uploadfile :: ファイルが書き込まれました");
    // 補足データ（metadata）を取得し、JSONとしてパース
    //console.log("/uploadfile :: これからの処理に使うreq.body.metadata->", req.body);

    //送信者情報とディレクトリ取り出し
    const metadata: {
      RequestSender: IRequestSender,
      directory: string,
      actualName: string
    } = JSON.parse(req.body.metadata);
    //バックエンド側で配置している実際のファイル名取り出し
    const actualName = req.body.actualName;

    //チャンネルフォルダを作成するかどうかフラグ
    let flagCreateChannelFolder = false;

    //もしディレクトリIdがチャンネルフォルダに該当するならディレクトリが作成されているかを確認
    //const regexChannelId = /^C\d{4}$/;
    const regexChannelId = /^C\d{4}_\d+$/;
    if (metadata.directory.match(regexChannelId) !== null) {
      //このチャンネル用のフォルダを取得
      const directoryForChannel = fetchFolderInfo(metadata.RequestSender.userId, metadata.directory);
      console.log("/uploadfile :: フォルダあるかどうか->", directoryForChannel);
      //フォルダが無いのなら作るようにフラグをたてる
      if (directoryForChannel === null) flagCreateChannelFolder = true;
    }

    //無いならファイルインデックス用テーブル作成
    db.exec(
      `
      create table if not exists FILE${metadata.RequestSender.userId}(
        id TEXT PRIMARY KEY,
        userId TEXT DEFAULT ${metadata.RequestSender.userId},
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

    //このチャンネル用フォルダを作るオプションが有効なら作成
    if (flagCreateChannelFolder) {
      db.prepare(
        `
        INSERT INTO FOLDERS (
          id, userId, name, positionedDirectoryId
        ) VALUES (?, ?, ?, ?)
        `
      ).run(
        metadata.directory,
        metadata.RequestSender.userId,
        metadata.directory,
        ""
      );
    }

    //ファイルId生成
    const fileIdGenerated = generateFileId(metadata.RequestSender.userId);
    //アップロード日時追加用
    const uploadedDate = new Date().toJSON();

    //ファイル情報をDBへ記録
    db.prepare(
      `
      INSERT INTO FILE${metadata.RequestSender.userId} (
        id, name, actualName, type, size, directory, uploadedDate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      fileIdGenerated,
      req.file.originalname,
      actualName,
      req.file.mimetype,
      req.file.size,
      metadata.directory,
      uploadedDate
    );

    res.status(200).send({ result:"SUCCESS", data:fileIdGenerated });
    return;

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