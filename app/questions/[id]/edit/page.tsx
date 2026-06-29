"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<any>(null);

  const [text, setText] = useState("");
  const [choice1, setChoice1] = useState("");
  const [choice2, setChoice2] = useState("");
  const [choice3, setChoice3] = useState("");
  const [choice4, setChoice4] = useState("");
  const [correct, setCorrect] = useState(1);
  const [genre, setGenre] = useState("自然科学");
  const [difficulty, setDifficulty] = useState(1);

  // 初期データ取得
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setQuestion(data);
        setText(data.question);
        setChoice1(data.choice1);
        setChoice2(data.choice2);
        setChoice3(data.choice3);
        setChoice4(data.choice4);
        setCorrect(data.correct_index);
        setGenre(data.genre);
        setDifficulty(data.difficulty);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 保存処理
  const handleSave = async () => {
    const { error } = await supabase
      .from("questions")
      .update({
        question: text,
        choice1,
        choice2,
        choice3,
        choice4,
        correct_index: correct,
        genre,
        difficulty,
      })
      .eq("id", id);

    if (error) {
      alert("保存に失敗しました");
    } else {
      alert("保存しました！");
      router.push(`/questions/${id}`);
    }
  };

  if (loading) return <p className="p-6">読み込み中…</p>;
  if (!question) return <p className="p-6">問題が見つかりません</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">問題を編集</h1>

      <div className="space-y-4">
        <div>
          <label className="font-bold">問題文</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="font-bold">選択肢</label>
          <input
            value={choice1}
            onChange={(e) => setChoice1(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="①"
          />
          <input
            value={choice2}
            onChange={(e) => setChoice2(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="②"
          />
          <input
            value={choice3}
            onChange={(e) => setChoice3(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="③"
          />
          <input
            value={choice4}
            onChange={(e) => setChoice4(e.target.value)}
            className="w-full border p-2 rounded mt-1"
            placeholder="④"
          />
        </div>

        <div>
          <label className="font-bold">正解番号</label>
          <select
            value={correct}
            onChange={(e) => setCorrect(Number(e.target.value))}
            className="border p-2 rounded mt-1"
          >
            <option value={1}>①</option>
            <option value={2}>②</option>
            <option value={3}>③</option>
            <option value={4}>④</option>
          </select>
        </div>

        <div>
          <label className="font-bold">ジャンル</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border p-2 rounded mt-1"
          >
            <option value="自然科学">自然科学</option>
            <option value="社会">社会</option>
            <option value="スポーツ">スポーツ</option>
            <option value="雑学">雑学</option>
            <option value="歴史">歴史</option>
          </select>
        </div>

        <div>
          <label className="font-bold">難易度</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="border p-2 rounded mt-1"
          >
            <option value={1}>★☆☆（かんたん）</option>
            <option value={2}>★★☆（ふつう）</option>
            <option value={3}>★★★（むずかしい）</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          保存する
        </button>
      </div>
    </div>
  );
}
