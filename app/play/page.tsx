"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PlayPage() {
  const [question, setQuestion] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  const [genre, setGenre] = useState("すべて");
  const [difficulty, setDifficulty] = useState("すべて");

  // 🔥 進捗カウンター
  const [count, setCount] = useState(0);

  const fetchQuestion = async () => {
    setSelected(null);
    setResult(null);

    let query = supabase.from("questions").select("*");

    if (genre !== "すべて") query = query.eq("genre", genre);
    if (difficulty !== "すべて") query = query.eq("difficulty", Number(difficulty));

    const { data } = await query.order("random()").limit(1);

    setQuestion(data?.[0] ?? null);
  };

  useEffect(() => {
    fetchQuestion();
  }, [genre, difficulty]);

  const handleSelect = async (index: number) => {
    if (!question) return;

    setSelected(index);

    if (index === question.correct_index) {
      setResult("correct");
    } else {
      setResult("wrong");

      await supabase
        .from("questions")
        .update({ bad_count: question.bad_count + 1 })
        .eq("id", question.id);
    }
  };

  const next = () => {
    setCount(count + 1); // 🔥 進捗 +1
    fetchQuestion();
  };

  if (!question)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">クイズに挑戦</h1>
        <p className="mt-4">問題がありません。</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">クイズに挑戦</h1>

      {/* 🔥 進捗表示 */}
      <p className="text-lg font-bold">今日の挑戦：{count}問目</p>

      {/* フィルタ */}
      <div className="flex gap-4">
        <div>
          <label className="block font-bold">ジャンル</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="すべて">すべて</option>
            <option value="自然科学">自然科学</option>
            <option value="社会">社会</option>
            <option value="スポーツ">スポーツ</option>
            <option value="雑学">雑学</option>
            <option value="歴史">歴史</option>
          </select>
        </div>

        <div>
          <label className="block font-bold">難易度</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="すべて">すべて</option>
            <option value="1">★☆☆</option>
            <option value="2">★★☆</option>
            <option value="3">★★★</option>
          </select>
        </div>
      </div>

      {/* 問題 */}
      <div className="border p-4 rounded space-y-4">
        <h2 className="font-bold">{question.question}</h2>

        <ul className="space-y-3">
          {[question.choice1, question.choice2, question.choice3, question.choice4].map(
            (choice, i) => {
              const index = i + 1;
              const isSelected = selected === index;
              const isCorrect = question.correct_index === index;

              let color = "bg-white";
              if (result) {
                if (isCorrect) color = "bg-green-300";
                if (isSelected && !isCorrect) color = "bg-red-300";
              }

              return (
                <li key={i}>
                  <button
                    onClick={() => handleSelect(index)}
                    disabled={!!result}
                    className={`
                      w-full text-left px-4 py-3 border rounded transition 
                      ${color}
                      ${isSelected ? "scale-105" : "scale-100"}
                    `}
                  >
                    {choice}
                  </button>
                </li>
              );
            }
          )}
        </ul>

        {result && (
          <button
            onClick={next}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            次の問題へ
          </button>
        )}
      </div>
    </div>
  );
}



