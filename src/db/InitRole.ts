import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./records/ROLE.db");

db.serialize(() => {
  //ロール情報を保存するROLESテーブルを無ければ作成
  db.run(
  `create table if not exists ROLES(
    roleId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'ffffff',
    ServerManage BOOLEAN NOT NULL DEFAULT '0',
    RoleManage BOOLEAN NOT NULL DEFAULT '0',
    ChannelRename BOOLEAN NOT NULL DEFAULT '0',
    ChannelViewPrivate BOOLEAN NOT NULL DEFAULT '0',
    ChannelCreateAndDelete BOOLEAN NOT NULL DEFAULT '0',
    UserManage BOOLEAN NOT NULL DEFAULT '0',
    MessageDelete BOOLEAN NOT NULL DEFAULT '0',
    MessageAttatchFile BOOLEAN NOT NULL DEFAULT '0'
  )`);

  //無かったらMEMBERロールを挿入する
  db.run(`
    INSERT INTO ROLES (
      roleId,
      name,
      color
    )
    VALUES (?, ?, ?)
    ON CONFLICT(roleId) DO NOTHING;
    `,
    "MEMBER",
    "Member",
    "ffffff"
  );

  //無かったらMEMBERロールを挿入する
  db.run(`
    INSERT INTO ROLES (
      roleId,
      name,
      color,
      ServerManage,
      RoleManage,
      ChannelRename,
      ChannelViewPrivate,
      ChannelCreateAndDelete,
      UserManage,
      MessageDelete,
      MessageAttatchFile
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(roleId) DO NOTHING;
    `,
    "HOST",
    "Host",
    "7E097E",
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true
  );

  console.log("InitRole :: ロールDB作成完了");
});


db.close();
