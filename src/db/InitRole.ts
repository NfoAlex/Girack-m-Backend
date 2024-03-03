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
    ChannelViewPrivate BOOLEAN NOT NULL,
    ChannelCreateAndDelete BOOLEAN NOT NULL,
    UserManage BOOLEAN NOT NULL,
    MessageDelete BOOLEAN NOT NULL,
    MessageAttatchFile BOOLEAN NOT NULL
  )`);

  //無かったらMEMBERロールを挿入する
  db.run(`
    INSERT INTO ROLES (
      roleId,
      name,
      ServerManage,
      RoleManage,
      ChannelRename,
      ChannelViewPrivate,
      ChannelCreateAndDelete,
      UserManage,
      MessageDelete,
      MessageAttatchFile
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(roleId) DO NOTHING;
    `,
    "MEMBER",
    "Member",
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
  );
});

console.log("InitRole :: ロールDB作成完了");
db.close();
