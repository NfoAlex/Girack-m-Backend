import calcRoleUser from "../Role/calcRoleUser";
import fetchMessage from "./fetchMessage";

export default async function deleteMessage(
  channelId: string,
  messageId: string,
  userIdBy: string,
) {
  try {

    //削除するメッセージを取得
    const messageDeleting = await fetchMessage(channelId, messageId);
    if (messageDeleting === null) return null;

    //削除する人の権限レベル
    const rolePower = await calcRoleUser(userIdBy);
    //削除される人の権限レベル
    const rolePowerAgainst = await calcRoleUser(messageDeleting.userId);

  } catch(e) {

    console.log("deleteMessage :: エラー->", e);
    return null;

  }
}
