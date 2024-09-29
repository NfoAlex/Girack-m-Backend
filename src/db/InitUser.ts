import Database from 'better-sqlite3';
const db = new Database('./records/USER.db');
db.pragma('journal_mode = WAL');

import migration20240612 from "./migration/User/20240612";
import migration20240618 from "./migration/User/20240618";
import migration20240929 from './migration/User/20240929';

//ユーザー基本情報を保存するUSERS_INFOテーブルを無ければ作成
db.exec(
  `
  create table if not exists USERS_INFO(
    userId TEXT PRIMARY KEY,
    userName TEXT NOT NULL,
    role TEXT NOT NULL,
    channelJoined TEXT NOT NULL,
    threadJoined TEXT NOT NULL,
    banned BOOLEAN NOT NULL
  )
  `
);

//ユーザーのパスワードを保存するUSERS_PASSWORDテーブルを無ければ作成
db.exec(
  `create table if not exists USERS_PASSWORD(
    userId TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`
);

//ユーザーのセッション状態を保存するUSERS_SESSIONテーブルを無ければ作成
db.exec(
  `
  create table if not exists USERS_SESSION(
    sessionId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    sessionName TEXT NOT NULL,
    loggedinTime TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    loggedinTimeFirst TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )
  `
);

//ユーザーの設定データを保存するUSERS_CONFIGテーブルを無ければ作成
db.exec(
  `
  create table if not exists USERS_CONFIG(
    userId TEXT PRIMARY KEY,
    notification TEXT NOT NULL,
    theme TEXT NOT NULL,
    channel TEXT NOT NULL,
    sidebar TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`
);

//ユーザーのその他保存するデータ用テーブル
db.exec(
  `
  create table if not exists USERS_SAVES(
    userId TEXT PRIMARY KEY,
    messageReadId TEXT DEFAULT '{}',
    channelOrder TEXT DEFAULT '{}',
    inbox TEXT DEFAULT '{ "mention": {}, "event": {} }',
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`
);

//migration
migration20240612(); //inboxカラム追加
migration20240618(); //messageReadIdからmessageReadTimeへ
migration20240929(); //threadJoinedカラム追加

console.log("InitUser :: ユーザーDB作成完了");
db.close();
