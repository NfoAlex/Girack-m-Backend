export interface IMessageBeforeParsing {
  userId: string,
  content: string,
  reaction: string
}

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
