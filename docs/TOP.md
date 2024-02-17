# Girack-m-Backend 仕様設計

## 通信に使用するライブラリ
- socket.io-client

## SocketHandler一覧
**auth** - 認証系、アカウント登録やログアウトなど
**fetch** - 情報取得系、チャンネルからインスタンス情報まで全部まとめ
**channel** - チャンネル操作、作成や設定の編集など
**user** - ユーザー操作、BANやプロフィール編集など
**Server** - インスタンス操作、全体設定やロール管理など
