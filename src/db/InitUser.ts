import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/USER.db");

db.serialize(() => {
  //ユーザー基本情報を保存するUSER_INFOテーブルを無ければ作成
  db.run(`create table if not exists USERS_INFO(
    userId TEXT PRIMARY KEY,
    userName TEXT NOT NULL,
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
    sessionName TEXT NOT NULL,
    loggedinTime TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    loggedinTimeFirst TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`);
  //ユーザーの設定データを保存するUSER_CONFIGテーブルを無ければ作成
  db.run(`create table if not exists USERS_CONFIG(
    userId TEXT PRIMARY KEY,
    notification TEXT NOT NULL,
    theme TEXT NOT NULL,
    channel TEXT NOT NULL,
    sidebar TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES USERS_INFO(userId)
  )`);
});

console.log("InitUser :: ユーザーDB作成完了");
db.close();
