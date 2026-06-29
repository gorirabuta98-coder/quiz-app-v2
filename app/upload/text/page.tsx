"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TextUploadPage() {
  const [question, setQuestion] = useState("");
  const [correct, setCorrect] = useState("");

  // AI が生成した誤答
  const [aiChoices, setAiChoices] = useState<string[]>([]);

  // 手動入力の誤答
  const [manualChoices, setManualChoices] = useState(["", "", ""]);

  const [loading, setLoading] = useState(false);

  const generateChoices = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-choices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, correct }),
    });

    const data = await res.json();
    setAiChoices(data.choices || []);
    setLoading(false);
  };

  const saveToSupabase = async () => {
    // AI or 手動のどちらかを使う
    const finalChoices =
      aiChoices.length === 3 ? aiChoices : manualChoices;

    const choices = [correct, ...finalChoices];
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

  const isReadyToSave =
    (aiChoices.length === 3) ||
    manualChoices.every((c) => c.trim().length > 0);

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

      {/* AI が生成した誤答 */}
      {aiChoices.length > 0 && (
        <div className="mt-6">
          <h2 className="font-bold mb-2">AI が生成した誤答</h2>
          {aiChoices.map((c, i) => (
            <div key={i} className="border p-2 mb-2">
              {c}
            </div>
          ))}
        </div>
      )}

      {/* 手動入力欄 */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">自分で誤答を作る</h2>
        {manualChoices.map((c, i) => (
          <input
            key={i}
            className="border p-2 w-full mb-2"
            placeholder={`誤答 ${i + 1}`}
            value={c}
            onChange={(e) => {
              const newChoices = [...manualChoices];
              newChoices[i] = e.target.value;
              setManualChoices(newChoices);
            }}
          />
        ))}
      </div>

      {/* 保存ボタン（誤答3つ揃うまで押せない） */}
      <button
        disabled={!isReadyToSave}
        onClick={saveToSupabase}
        className={`px-4 py-2 rounded mt-4 ${
          isReadyToSave
            ? "bg-green-500 text-white"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        クイズを登録する
      </button>
    </div>
  );
}


