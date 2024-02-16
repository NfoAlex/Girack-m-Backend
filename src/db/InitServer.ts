import fs from 'fs';
import IServerInfo from "../type/Server";
import mergeDeeply from "../util/mergeDeeply";

//サーバー設定テンプレ
const ServerInfoTemplate:IServerInfo = {
  servername: "Girack(m)",
  registration: {
    available: true,
    invite: {
      inviteOnly: true,
      inviteCode: ""
    }
  },
  config: {
    PROFILE: {
      iconMaxSize: 1e7,
      usernameMaxLength: 12
    },
    CHANNEL: {
      channelIdAnnounceRegistration: "0001",
      defaultJoinOnRegister: ["0001"]
    },
    MESSAGE: {
      TxtMaxLength: 300,
      FileMaxSize: 3e7
    }
  }
};

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
      TxtMaxLength: 0,
      FileMaxSize: 0
    }
  }
};

try { //読み込んでみる
    //serverデータを読み取り
    ServerInfoLoading = JSON.parse(fs.readFileSync('./server.json', 'utf-8')); //サーバー情報のJSON読み込み
    //テンプレに上書きする感じでサーバー情報を取り込む
    ServerInfoLoading = mergeDeeply(ServerInfoTemplate, ServerInfoLoading);
} catch(e) {
    console.log("dbControl :: dataServerの読み込みエラー->", e);
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
const ServerInfo = ServerInfoLoading;
//この時点で一度書き込み保存
fs.writeFileSync("./server.json", JSON.stringify(ServerInfo, null, 4));


console.log("InitServer :: サーバー情報認識");