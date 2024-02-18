import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

db.serialize(() => {
  //ユーザー基本情報を保存するUSER_INFOテーブルを無ければ作成
  db.run(`create table if not exists USERS_INFO(
    userId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    channelJoined TEXT NOT NULL,
    loggedin BOOLEAN NOT NULL,
    banned BOOLEAN NOT NULL,
    password TEXT NOT NULL
  )`);
  //ユーザーのセッション状態を保存するUSER_SESSIONテーブルを無ければ作成
  db.run(`create table if not exists USERS_SESSION(
    userId TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    name TEXT NOT NULL,
    loggedinTime TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    loggedinTimeFirst TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`);
});

console.log("InitUser :: ユーザーDB作成完了");
db.close();
