"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TextUploadPage() {
  const [question, setQuestion] = useState("");
  const [correct, setCorrect] = useState("");
  const [aiChoices, setAiChoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateChoices = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-choice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, correct }),
    });

    const data = await res.json();
    setAiChoices(data.choices || []);
    setLoading(false);
  };

  const saveToSupabase = async () => {
    const choices = [correct, ...aiChoices];
    const correct_index = 0;

    const { error } = await supabase.from("questions").insert({
      question,
      choice1: choices[0],
      choice2: choices[1],
      choice3: choices[2],
      choice4: choices[3],
      correct_index,
    });

    if (error) alert(error.message);
    else alert("保存しました！");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">テキストからクイズ作成</h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="問題文を入力"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        placeholder="正解を入力"
        value={correct}
        onChange={(e) => setCorrect(e.target.value)}
      />

      <button
        onClick={generateChoices}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "生成中..." : "AI に誤答を作らせる"}
      </button>

      {aiChoices.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">AI が生成した誤答</h2>
          {aiChoices.map((c, i) => (
            <div key={i} className="border p-2 mb-2">
              {c}
            </div>
          ))}

          <button
            onClick={saveToSupabase}
            className="bg-green-500 text-white px-4 py-2 rounded mt-4"
          >
            この4択で保存する
          </button>
        </div>
      )}
    </div>
  );
}

