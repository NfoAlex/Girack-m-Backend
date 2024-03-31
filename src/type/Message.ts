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
