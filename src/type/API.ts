export interface IAPIClientInfo {
  apiClientId: string,
  clientName: string,
  description: string,
  createBy: string,
  status: boolean,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}

export interface IAPIClientInfoBeforeParsing {
  apiClientId: string,
  clientName: string,
  description: string,
  createBy: string,
  status: 1 | 0,
  approvedStatus: "WAITING" | "APPROVED" | "BANNED"
}