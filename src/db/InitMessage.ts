import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/MESSAGE.db");

import migration20240603 from "./migration/Message/20240603";
import migrationMessage20240709 from "./migration/Message/20240709";
import migrationMessage20240714 from "./migration/Message/20240714";

db.serialize(() => {
  //migration
  migration20240603();
  migrationMessage20240709();
  migrationMessage20240714();

  //randomチャンネル用のテーブル作成
  db.run(
  `create table if not exists C0001(
    messageId TEXT PRIMARY KEY,
    channelId TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    isEdited BOOLEAN NOT NULL DEFAULT '0',
    linkData TEXT DEFAULT '{}',
    fileId TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    reaction TEXT NOT NULL
  )`);

  console.log("InitMessage :: db : メッセージ用DB作成完了");
});

db.close();
