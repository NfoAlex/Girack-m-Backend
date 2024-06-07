//SQLiteからのメッセージの生データ
export interface IMessageBeforeParsing {
  messageId: string,
  channelId: string,
  userId: string,
  content: string,
  linkData: string,
  time: string,
  reaction: string
}

//メッセージ用interface
export interface IMessage {
  messageId: string,
  channelId: string,
  userId: string,
  content: string,
  linkData: {
    [key: string]:
      {
        contentType: "text/html",
        mediaType: string,
        url: string,
        siteName: string,
        title: string,
        description: string,
        favicon: string,
        images: string[]
      }
        |
      {
        mediaType: "image"|"video",
        url: string,
        contentType?: string,
        favicons?: string[]
      }
  }|{},
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
