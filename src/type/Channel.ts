export interface IChannelbeforeParsing {
  channelId: string,
  channelName: string,
  description: string,
  createdBy: string,
  isPrivate: 0|1,
  speakableRole: string
}

export interface IChannel {
  channelId: string,
  channelName: string,
  description: string,
  createdBy: string,
  isPrivate: boolean,
  speakableRole: string[]
}

export interface IChannelOrder {
  channelId: string,
  isThread: boolean,
  isFolder: boolean,
  child?: []
}
