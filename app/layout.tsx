import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "クイズアプリ",
  description: "AI画像クイズアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100">

        {/* 🔥 ヘッダー（全ページ共通） */}
        <header className="bg-white shadow mb-6">
          <nav className="max-w-3xl mx-auto px-4 py-3 flex gap-6 text-lg font-medium">
            <Link href="/" className="hover:text-blue-500">ホーム</Link>
            <Link href="/play" className="hover:text-blue-500">挑戦</Link>
            <Link href="/upload" className="hover:text-blue-500">投稿</Link>
            <Link href="/questions" className="hover:text-blue-500">一覧</Link>
            <Link href="/stats" className="hover:text-blue-500">統計</Link>
          </nav>
        </header>

        {/* ページ本体 */}
        <main className="max-w-3xl mx-auto px-4">
          {children}
        </main>

      </body>
    </html>
  );
}

