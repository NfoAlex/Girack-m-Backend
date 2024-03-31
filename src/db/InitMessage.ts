import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

db.serialize(() => {
  //randomチャンネル用のテーブル作成
  db.run(
  `create table if not exists 0001(
    messageId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    reaction TEXT NOT NULL
  )`);

  console.log("InitMessage :: メッセージ用DB作成完了");
});

db.close();
