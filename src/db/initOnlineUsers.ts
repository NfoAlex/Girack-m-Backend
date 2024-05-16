import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ONLINEUSERS.db");

db.serialize(() => {
  //オンラインユーザー用のテーブル作成
  db.run(
  `create table if not exists ONLINE_USERS(
    socketId TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    sessionId TEXT NOT NULL
  )`);

  //テーブル内を初期化
  db.run(`delete from ONLINE_USERS`);

  console.log("initOnlineUsers :: db : オンラインユーザー用DB作成完了");
});

db.close();
