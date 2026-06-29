import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function QuestionsPage() {
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">保存されたクイズ一覧</h1>

      {!questions || questions.length === 0 ? (
        <p>まだクイズがありません。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition block"
            >
              <div className="space-y-3">
                {/* 問題文 */}
                <h2 className="font-bold text-lg line-clamp-2">
                  {q.question}
                </h2>

                {/* バッジ */}
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {q.genre}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    難易度: {q.difficulty}
                  </span>
                </div>

                {/* 間違えられた回数 */}
                <p className="text-sm text-gray-600">
                  間違えられた回数: {q.bad_count}
                </p>

                {/* 作成日 */}
                <p className="text-xs text-gray-400">
                  {new Date(q.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

