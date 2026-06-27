import Link from "next/link";

export default function HomePage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">クイズアプリ</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* クイズに挑戦 */}
        <Link
          href="/play"
          className="border p-6 rounded-lg shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-bold mb-2">クイズに挑戦</h2>
          <p>ランダム or フィルタでクイズを解ける</p>
        </Link>

        {/* クイズを投稿 */}
        <Link
          href="/upload"
          className="border p-6 rounded-lg shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-bold mb-2">クイズを投稿</h2>
          <p>画像からAIが自動でクイズを生成</p>
        </Link>

        {/* クイズ一覧 */}
        <Link
          href="/questions"
          className="border p-6 rounded-lg shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-bold mb-2">クイズ一覧</h2>
          <p>保存されたクイズを確認・編集・削除</p>
        </Link>

        {/* 統計ページ */}
        <Link
          href="/stats"
          className="border p-6 rounded-lg shadow hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-bold mb-2">統計を見る</h2>
          <p>間違えられた問題ランキング</p>
        </Link>
      </div>
    </div>
  );
}

