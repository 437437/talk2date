export const metadata = { title: "プライバシーポリシー | Talk2Date" };

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <p>本ポリシーは、Talk2Date（以下「本サービス」）が提供するLINEボットおよび関連Webサービスに適用されます。</p>

      <h2 className="text-xl font-semibold">1. 事業者情報</h2>
      <ul className="list-disc pl-6">
        <li>運営者名：Yuri Saito（個人）</li>
        <li>連絡先：<a className="underline" href="justiceroot3@gmail.com">justiceroot3@gmail.com</a></li>
      </ul>

      <h2 className="text-xl font-semibold">2. 取得する情報</h2>
      <ul className="list-disc pl-6">
        <li>LINEユーザーID、表示名、プロフィール画像URL（友だち追加時）</li>
        <li>ユーザーがBotに送信するテキスト等のメッセージ内容</li>
        <li>利用ログ（タイムスタンプ、処理結果、エラー情報）</li>
      </ul>

      <h2 className="text-xl font-semibold">3. 利用目的</h2>
      <ul className="list-disc pl-6">
        <li>会話文に基づく返信候補の提示（LLM等による生成）</li>
        <li>飲食店情報の検索・提案（ぐるなびAPI/ホットペッパーAPIの利用）</li>
        <li>品質向上・不正利用対策・障害対応</li>
      </ul>

      <h2 className="text-xl font-semibold">4. 第三者提供・外部送信</h2>
      <p>以下の外部サービスに対し、利用目的の範囲でデータを送信する場合があります。</p>
      <ul className="list-disc pl-6">
        <li>OpenAI等のAI推論API（会話内容の要約・返信候補生成のため）</li>
        <li>ぐるなびAPI/ホットペッパーAPI（店舗検索のため／位置情報やキーワード）</li>
        <li>ホスティング/ログ（Vercel等）</li>
      </ul>

      <h2 className="text-xl font-semibold">5. 保存期間</h2>
      <p>メッセージ本文は原則として最小限の期間のみ保持し、その後は匿名化または削除します。保持期間は運用上必要な範囲で見直します。</p>

      <h2 className="text-xl font-semibold">6. ユーザーの権利</h2>
      <p>開示・訂正・削除・利用停止のご希望は上記連絡先にご連絡ください。ご本人確認のうえ、法令に基づき対応します。</p>

      <h2 className="text-xl font-semibold">7. 安全管理</h2>
      <p>アクセス制御、通信の暗号化、ログ監査等、合理的な安全管理措置を講じます。</p>

      <h2 className="text-xl font-semibold">8. 未成年の利用</h2>
      <p>18歳未満の方は保護者の同意のうえご利用ください。</p>

      <h2 className="text-xl font-semibold">9. 変更</h2>
      <p>本ポリシーの内容は予告なく変更する場合があります。重要な変更はWebやLINE上で告知します。</p>

      <p className="text-sm text-gray-500">最終更新日：2025-09-07</p>
    </main>
  );
}
