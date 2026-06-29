import { supabase } from "@/lib/supabaseClient";

export default async function StatsPage() {
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .order("bad_count", { ascending: false });

  const genres = ["自然科学", "社会", "スポーツ", "雑学", "歴史"];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">間違えられた問題ランキング</h1>

      {/* 全体ランキング */}
      <div>
        <h2 className="text-xl font-bold mb-2">全体ランキング TOP20</h2>

        {(questions ?? []).slice(0, 20).map((q, i) => (
          <div key={q.id} className="border p-4 rounded mb-3">
            <p className="font-bold">
              {i + 1}位：{q.question}
            </p>
            <p className="text-sm text-gray-600">
              間違えられた回数：{q.bad_count}
            </p>
            <p className="text-xs text-gray-500">
              {q.genre} / 難易度 {q.difficulty}
            </p>
          </div>
        ))}
      </div>

      {/* 🔥 ジャンル別ランキング */}
      <div className="space-y-8">
        {genres.map((g) => {
          // ★ ここが修正版：undefined を絶対に許さない
          const list =
            (questions?.filter((q) => q.genre === g) ?? []).slice(0, 5);

          return (
            <div key={g}>
              <h2 className="text-xl font-bold mb-2">{g} のTOP5</h2>

              {list.length === 0 ? (
                <p className="text-gray-500">データなし</p>
              ) : (
                list.map((q, i) => (
                  <div key={q.id} className="border p-4 rounded mb-3">
                    <p className="font-bold">
                      {i + 1}位：{q.question}
                    </p>
                    <p className="text-sm text-gray-600">
                      間違えられた回数：{q.bad_count}
                    </p>
                    <p className="text-xs text-gray-500">
                      難易度 {q.difficulty}
                    </p>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


