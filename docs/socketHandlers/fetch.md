## fetch系ハンドラ

<details>
  <summary>
    fetchServerInfoFull
  </summary>
  
* 概要 - 招待コードを含むインスタンス情報、設定を返す
* 必要パラメータ
  - RequestSenser: `IRequestSender`
 
* 返り値の型
```
{
  result: "SUCCESS"|"FAIL_MISSINGROLE",
  data: IServerInfo
}
```
</details>

<details>
  <summary>
    fetchServerInfoLimited
  </summary>
  
* 概要 - 招待コードを除くインスタンス情報、設定を返す
* 必要パラメータ
  - (無し)
 
* 返り値の型
```
{
  result: "SUCCESS",
  data: IServerInfo
}
```
</details>
