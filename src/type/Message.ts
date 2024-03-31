export interface IMessageBeforeParsing {
  userId: string,
  content: string,
  reaction: string
}

export interface IMessage {
  channelId: string,
  userId: string,
  content: string,
  reaction: {
    [key: string]: {
      [key: string]: number
    }
  }
}
