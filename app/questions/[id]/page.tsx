import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function QuestionDetailPage({ params }: Props) {
  const { id } = params;

  const { data: question } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (!question) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">問題が見つかりません</h1>
      </div>
    );
  }

  // 🔥 Server Action（正しい書き方）
  async function deleteQuestion() {
    "use server";

    await supabase.from("questions").delete().eq("id", id);

    redirect("/questions");
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">

        {/* 問題文 */}
        <h1 className="text-xl font-bold">{question.question}</h1>

        {/* 選択肢 */}
        <ul className="space-y-1">
          <li>① {question.choice1}</li>
          <li>② {question.choice2}</li>
          <li>③ {question.choice3}</li>
          <li>④ {question.choice4}</li>
        </ul>

        {/* 正解 */}
        <p className="text-sm text-gray-700">
          正解：{question.correct_index}番
        </p>

        {/* バッジ */}
        <div className="flex gap-2 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            {question.genre}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
            難易度: {question.difficulty}
          </span>
        </div>

        {/* 間違えられた回数 */}
        <p className="text-sm text-gray-600">
          間違えられた回数: {question.bad_count}
        </p>

        {/* 作成日 */}
        <p className="text-xs text-gray-400">
          作成日: {new Date(question.created_at).toLocaleString()}
        </p>

        {/* ボタン群 */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/questions/${id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            編集する
          </Link>

          <form action={deleteQuestion}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              削除する
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}



