"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

type QuizPayload = {
  question: string;
  choices: string[];
  correct_index: number;
};

export default function ImageUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<QuizPayload | null>(null);

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  });

  const handleGenerate = async () => {
    if (!file) {
      setError("画像を選択してください。");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const fileName = `quiz-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("quiz-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error("画像アップロードに失敗しました。");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("quiz-images").getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error("画像URLの取得に失敗しました。");
      }

      const ocrRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: publicUrl,
              },
              {
                type: "text",
                text: "この画像の内容をできるだけ正確にテキスト化してください。",
              },
            ] as any,
          },
        ],
      });

      const ocrContent = ocrRes.choices[0]?.message?.content as unknown;
      const ocrText =
        typeof ocrContent === "string"
          ? ocrContent
          : Array.isArray(ocrContent)
            ? (ocrContent as Array<{ type?: string; text?: string }>)
                .filter((part) => part.type === "text")
                .map((part) => part.text ?? "")
                .join("\n")
            : "";

      if (!ocrText.trim()) {
        throw new Error("画像から文字を読み取れませんでした。");
      }

      const prompt = `以下の文章から、4択クイズを1問作成してください。必ず JSON のみを返してください。

出力形式:
{
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "correct_index": 1
}

文章:
${ocrText}`;

      const quizRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "必ず JSON のみを返してください。説明や前置きは不要です。",
          },
          { role: "user", content: prompt },
        ],
      });

      const raw = quizRes.choices[0]?.message?.content ?? "";
      const rawText = typeof raw === "string" ? raw : "";

      let payload: QuizPayload;
      try {
        payload = JSON.parse(rawText);
      } catch {
        console.error("GPTの返答:", rawText);
        throw new Error("AIの返答がJSON形式ではありません。");
      }

      if (
        !payload.question ||
        !Array.isArray(payload.choices) ||
        payload.choices.length !== 4 ||
        typeof payload.correct_index !== "number"
      ) {
        throw new Error("生成されたクイズの形式が正しくありません。");
      }

      const { error: insertError } = await supabase.from("questions").insert({
        question: payload.question,
        choice1: payload.choices[0],
        choice2: payload.choices[1],
        choice3: payload.choices[2],
        choice4: payload.choices[3],
        correct_index: payload.correct_index,
        genre: "image",
      });

      if (insertError) {
        throw new Error("クイズの保存に失敗しました。");
      }

      setResult(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "不明なエラーが発生しました。";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">画像からクイズ作成</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? "生成中..." : "生成する"}
      </button>

      {loading && <p className="mt-4">生成中です…</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 rounded border p-4">
          <h2 className="mb-2 text-xl font-bold">生成されたクイズ</h2>
          <p className="mb-2">{result.question}</p>
          <ul className="ml-5 list-disc">
            {result.choices.map((choice, index) => (
              <li key={`${choice}-${index}`}>
                {index + 1}. {choice}
              </li>
            ))}
          </ul>
          <p className="mt-2">正解：選択肢 {result.correct_index}</p>
        </div>
      )}
    </main>
  );
}


