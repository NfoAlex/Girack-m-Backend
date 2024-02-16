import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

db.serialize(() => {
  //ユーザー基本情報を保存するUSER_INFOテーブルを無ければ作成
  db.run(`create table if not exists USERS_INFO(
    userId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    loggedin BOOLEAN NOT NULL,
    banned BOOLEAN NOT NULL,
    pw TEXT NOT NULL
  )`);
  //ユーザーのセッション状態を保存するUSER_SESSIONテーブルを無ければ作成
  db.run(`create table if not exists USERS_SESSION(
    userId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    loggedinTime TEXT NOT NULL,
    loggedinTimeFirst TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`);
  //ユーザーのチャンネル参加情報を保存するUSER_CHANNELテーブルを無ければ作成
  db.run(`create table if not exists USERS_CHANNEL(
    userId TEXT PRIMARY KEY,
    channelIds TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`);
});

console.log("InitUser :: ユーザーDB作成完了");
db.close();