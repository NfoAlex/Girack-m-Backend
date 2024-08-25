//SQLiteからのメッセージの生データ
export interface IMessageBeforeParsing {
  messageId: string,
  channelId: string,
  userId: string,
  content: string,
  isEdited: 1|0,
  isSystemMessage: 1|0,
  linkData: string,
  fileId: string,
  time: string,
  reaction: string
}

//メッセージ用interface
export interface IMessage {
  messageId: string,
  channelId: string,
  userId: string,
  isEdited: boolean,
  isSystemMessage: boolean,
  content: string,
  linkData: {
    [key: string]:
      {
        contentType: "text/html"|"video",
        mediaType: string,
        url: string,
        siteName?: string,
        title?: string,
        description?: string,
        favicon: string,
        images: {url:string, type:string}[]
      }
      |
      {
        contentType: "image",
        mediaType: "image",
        url: string
      }
  },
  fileId: string[],
  time: string,
  reaction: {
    [key: string]: {
      [key: string]: number
    }
  }
}

//最終既読メッセージの時間
export interface IMessageReadTime {
  [key: string]: string
}

