"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ManualUpload() {
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const submit = async () => {
    const { error } = await supabase.from("questions").insert({
      question,
      choice1: choices[0],
      choice2: choices[1],
      choice3: choices[2],
      choice4: choices[3],
      correct_index: correctIndex + 1,
      genre: "manual",
    });

    alert(error ? "エラー" : "保存完了");
  };

  return (
    <div>
      <h1>テキストでクイズ作成</h1>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="問題文"
      />

      {choices.map((c, i) => (
        <input
          key={i}
          value={c}
          onChange={(e) => {
            const newC = [...choices];
            newC[i] = e.target.value;
            setChoices(newC);
          }}
          placeholder={`選択肢${i + 1}`}
        />
      ))}

      <select
        value={correctIndex}
        onChange={(e) => setCorrectIndex(Number(e.target.value))}
      >
        <option value={0}>選択肢1</option>
        <option value={1}>選択肢2</option>
        <option value={2}>選択肢3</option>
        <option value={3}>選択肢4</option>
      </select>

      <button onClick={submit}>保存</button>
    </div>
  );
}
