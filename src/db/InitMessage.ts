import Database from 'better-sqlite3';
const db = new Database('./records/MESSAGE.db');
db.pragma('journal_mode = WAL');

import migrationMessage20240603 from "./migration/Message/20240603";
import migrationMessage20240709 from "./migration/Message/20240709";
import migrationMessage20240714 from "./migration/Message/20240714";
import migrationMessage20240822 from './migration/Message/20240822';

//migration
migrationMessage20240603();
migrationMessage20240709();
migrationMessage20240714();
migrationMessage20240822();

//randomチャンネル用のテーブル作成
db.exec(
  `create table if not exists C0001(
    messageId TEXT PRIMARY KEY,
    channelId TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    isEdited BOOLEAN NOT NULL DEFAULT '0',
    isSystemMessage BOOLEAN NOT NULL DEFAULT '0',
    linkData TEXT DEFAULT '{}',
    fileId TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    reaction TEXT NOT NULL
  )`
);

console.log("InitMessage :: db : メッセージ用DB作成完了");

db.close();
