import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import migration20240603 from "./migration/Message/20240603";

db.serialize(() => {
  //migration
  migration20240603();

  //randomチャンネル用のテーブル作成
  db.run(
  `create table if not exists C0001(
    messageId TEXT PRIMARY KEY,
    channelId TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    linkData BLOB,
    time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    reaction TEXT NOT NULL
  )`);

  console.log("InitMessage :: db : メッセージ用DB作成完了");
});

db.close();
