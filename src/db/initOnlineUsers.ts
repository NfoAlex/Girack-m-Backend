import Database from 'better-sqlite3';
const db = new Database('./records/ONLINEUSERS.db');
db.pragma('journal_mode = WAL');

db.exec(
  `
  create table if not exists ONLINE_USERS(
    socketId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    sessionId TEXT NOT NULL
  )
  `
);

//テーブル内を初期化
db.exec("delete from ONLINE_USERS");

console.log("initOnlineUsers :: db : オンラインユーザー用DB作成完了");

db.close();
