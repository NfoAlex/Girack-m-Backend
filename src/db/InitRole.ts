import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");

db.serialize(() => {
  //ロール情報を保存するROLESテーブルを無ければ作成
  db.run(
  `create table if not exists ROLES(
    roleId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ServerManage BOOLEAN NOT NULL,
    RoleManage BOOLEAN NOT NULL,
    ChannelRename BOOLEAN NOT NULL,
    ChannelCreateAndDelete BOOLEAN NOT NULL,
    UserManage BOOLEAN NOT NULL,
    MessageDelete BOOLEAN NOT NULL,
    MessageAttatchFile BOOLEAN NOT NULL
  )`);
});

console.log("InitRole :: ロールDB作成完了");
db.close();
