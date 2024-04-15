//SQLiteからのメッセージの生データ
export interface IMessageBeforeParsing {
  messageId: string,
  channelId: string,
  userId: string,
  content: string,
  time: string,
  reaction: string
}

//メッセージ用interface
export interface IMessage {
  messageId: string,
  channelId: string,
  userId: string,
  content: string,
  time: string,
  reaction: {
    [key: string]: {
      [key: string]: number
    }
  }
}

//最終既読メッセージのId
export interface IMessageReadId {
  [key: string]: string
}
