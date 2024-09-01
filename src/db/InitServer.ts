import fs from "node:fs";
import type IServerInfo from "../type/Server";
import mergeDeeply from "../util/mergeDeeply";

import Database from 'better-sqlite3';
const db = new Database('./records/SERVER.db');
db.pragma('journal_mode = WAL');

//サーバー設定テンプレ
const ServerInfoTemplate:IServerInfo = JSON.parse(fs.readFileSync('./src/db/defaultValues/ServerInfo.json', 'utf-8'));

//サーバー設定適用用変数
let ServerInfoLoading:IServerInfo = {
  servername: '',
  registration: {
    available: false,
    invite: {
      inviteOnly: false,
      inviteCode: ''
    }
  },
  config: {
    PROFILE: {
      iconMaxSize: 0,
      usernameMaxLength: 0
    },
    CHANNEL: {
      channelIdAnnounceRegistration: '',
      defaultJoinOnRegister: []
    },
    MESSAGE: {
      TxtMaxLength: 0
    },
    STORAGE: {
      StorageSizeLimit: 0
    }
  }
};

try { //サーバー設定を読み込んでみる
  //serverデータを読み取り
  ServerInfoLoading = JSON.parse(fs.readFileSync('./records/server.json', 'utf-8')); //サーバー情報のJSON読み込み
  //テンプレに上書きする感じでサーバー情報を取り込む
  ServerInfoLoading = mergeDeeply(ServerInfoTemplate, ServerInfoLoading);
} catch(e) {
  //ユーザー登録用のパスワードを生成
  const invCodeLength = 24; //生成したい文字列の長さ
  const invCodeSource = "abcdefghijklmnopqrstuvwxyz0123456789"; //元になる文字
  let invCodeGenResult = "";

  //生成
  for(let i=0; i<invCodeLength; i++){
    invCodeGenResult += invCodeSource[Math.floor(Math.random() * invCodeSource.length)];
  }

  //JSONをコピーする
  ServerInfoLoading = ServerInfoTemplate;
  //招待コードを割り当て
  ServerInfoLoading.registration.invite.inviteCode = invCodeGenResult;
}

//サーバー情報変数を適用
export const ServerInfo = ServerInfoLoading;
//この時点で一度書き込み保存
fs.writeFileSync("./records/server.json", JSON.stringify(ServerInfo, null, 4));

//チャンネル情報を保存するCHANNELSテーブルを無ければ作成
db.exec(
  `
  create table if not exists CHANNELS(
    channelId TEXT PRIMARY KEY,
    channelName TEXT NOT NULL,
    description TEXT NOT NULL,
    createdBy TEXT NOT NULL,
    isPrivate BOOLEAN NOT NULL,
    speakableRole TEXT NOT NULL
  )
  `
);

//無かったらRandomチャンネルを最初に作成
db.prepare(
  `
  INSERT INTO CHANNELS (channelId, channelName, description, createdBy, isPrivate, speakableRole)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(channelId) DO NOTHING;
  `
).run(
  "0001",
  "Random",
  "雑談チャンネル。",
  "SYSTEM",
  0,
  "MEMBER"
);

//APIの利用情報を保存するREMOTEAPI_INFOテーブルを無ければ作成
db.exec(
  `
  create table if not exists API_CLIENTS(
    apiClientId TEXT PRIMARY KEY,
    apiKey TEXT NOT NULL,
    clientName TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    latestUsedTim TEXT NOT NULL DEFAULT '',
    createdBy TEXT NOT NULL,
    isEnabled BOOLEAN NOT NULL,
    approvedStatus TEXT NOT NULL DEFAULT 'WAITING'
  )
  `
);

console.log("InitServer :: サーバー情報認識");
db.close();