export const metadata = { title: "利用規約 | Talk2Date" };

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">利用規約</h1>
      <p>Talk2Date（以下「本サービス」）の利用条件を定めます。本サービスを利用された時点で、本規約に同意したものとみなします。</p>

      <h2 className="text-xl font-semibold">1. 提供内容</h2>
      <p>マッチングアプリの会話補助（返信候補提示）と、飲食店提案機能を提供します。</p>

      <h2 className="text-xl font-semibold">2. 禁止事項</h2>
      <ul className="list-disc pl-6">
        <li>法令や公序良俗に反する行為</li>
        <li>他者の権利侵害、誹謗中傷、差別的表現</li>
        <li>不正アクセス、スパム、Botの誤用</li>
      </ul>

      <h2 className="text-xl font-semibold">3. 免責</h2>
      <p>生成内容の正確性・有用性・適法性は保証されません。提案は参考情報であり、最終判断は利用者の責任で行ってください。当方は利用によって生じた損害について、故意または重過失がある場合を除き、一切の責任を負いません。</p>

      <h2 className="text-xl font-semibold">4. 有償化・変更・停止</h2>
      <p>本サービスの内容の全部または一部を、事前告知のうえ変更・停止・終了する場合があります。将来的に有償化・サブスク化する可能性があります。</p>

      <h2 className="text-xl font-semibold">5. 知的財産</h2>
      <p>本サービスに関する著作権等の知的財産権は当方または権利者に帰属します。無断転載・リバースエンジニアリング等を禁じます。</p>

      <h2 className="text-xl font-semibold">6. 準拠法・裁判管轄</h2>
      <p>日本法を準拠法とし、紛争は運営者の住所地を管轄する裁判所を第一審の専属的合意管轄とします。</p>

      <p className="text-sm text-gray-500">最終更新日：2025-09-07</p>
    </main>
  );
}
