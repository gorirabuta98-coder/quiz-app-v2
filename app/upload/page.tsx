// app/upload/page.tsx

import Link from "next/link";

export default function UploadPage() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">クイズ投稿</h1>

      <div className="grid grid-cols-1 gap-4">

        {/* 画像から作成 */}
        <Link href="/upload/image">
          <div className="p-5 border rounded-xl shadow-sm hover:bg-gray-50 cursor-pointer transition">
            <h2 className="text-xl font-semibold mb-1">画像から作成</h2>
            <p className="text-gray-600 text-sm">
              画像をアップロードしてAIが自動でクイズを生成します
            </p>
          </div>
        </Link>

        {/* テキストで作成 */}
        <Link href="/upload/manual">
          <div className="p-5 border rounded-xl shadow-sm hover:bg-gray-50 cursor-pointer transition">
            <h2 className="text-xl font-semibold mb-1">テキストで作成</h2>
            <p className="text-gray-600 text-sm">
              問題文と選択肢を手入力してクイズを作成します
            </p>
          </div>
        </Link>

      </div>
    </main>
  );
}
