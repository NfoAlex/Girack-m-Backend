# Interface定義

## ***📢注意*** 

すべての型名にはInterfaceということを示すために頭文字として`I`を含めて使います。

## 定義されている送信用の値とInterface

### RequestSender
<details>
  <summary>内容</summary>
  
* バックエンドへのほとんどのリクエストに必要なパラメータ。セッション認証やロール権限の確認のために使われる。
  - userid - 送信者のユーザーID。
  - sessionid - 認証する度にもらえるセッションID。
* Interface
```
{
  userid: string,
  sessionid: string
}
```
</details>

## 定義されている返り値とInterface

### ServerInfo
<details>
  <summary>内容</summary>

* インスタンス情報。インスタンスの設定や新規登録設定も含め、ログイン前でも受信できる。
  - 認証前の受信の場合inviteCodeが無い状態で返ってくる。
* Interface
```
{
  servername: string,
  registration: {
    available: boolean,
    invite: {
      inviteOnly: boolean,
      inviteCode: string|undefined,
    }
  },
  config: {
    PROFILE: {
      iconMaxSize: number,
      usernameMaxLength: number
    },
    CHANNEL: {
      channelIdAnnounceRegistration: string,
      defaultJoinOnRegister: string[],
    },
    MESSAGE: {
      TxtMaxLength: number,
      FileMaxSize: number
    }
  }
}
```
</details>
