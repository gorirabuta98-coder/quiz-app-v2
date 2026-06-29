"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ImageUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("画像を選択してください");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ① Supabase Storage にアップロード
      const fileName = `quiz-${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("quiz-images")
        .upload(fileName, file);

      if (uploadError) throw new Error("画像アップロードに失敗しました");

      const {
        data: { publicUrl },
      } = supabase.storage.from("quiz-images").getPublicUrl(fileName);

      if (!publicUrl) throw new Error("画像URLの取得に失敗しました");

      // ② サーバー側 API に送る
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "APIエラー");

      const quiz = data.quiz;

      // ③ Supabase に保存
      const { error: insertError } = await supabase.from("questions").insert({
        question: quiz.question,
        choice1: quiz.choices[0],
        choice2: quiz.choices[1],
        choice3: quiz.choices[2],
        choice4: quiz.choices[3],
        correct_index: quiz.correct_index,
        genre: "image",
      });

      if (insertError) throw new Error("クイズの保存に失敗しました");

      setResult(quiz);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">画像からクイズ作成</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        生成する
      </button>

      {loading && <p className="mt-4">生成中…</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">生成されたクイズ</h2>
          <p className="mb-2">{result.question}</p>
          <ul className="list-disc ml-5">
            {result.choices.map((c: string, i: number) => (
              <li key={i}>
                {i + 1}. {c}
              </li>
            ))}
          </ul>
          <p className="mt-2">正解：選択肢 {result.correct_index}</p>
        </div>
      )}
    </main>
  );
}



