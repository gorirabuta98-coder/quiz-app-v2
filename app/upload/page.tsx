"use client";

import { useState } from "react";
import { model } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);

  const [genre, setGenre] = useState("自然科学");
  const [difficulty, setDifficulty] = useState(1);

  // 画像プレビュー
  const handleImage = (file: File | null) => {
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // base64変換
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  // Geminiでクイズ生成
  const handleGenerate = async () => {
    if (!image) return;

    setLoading(true);

    const base64 = await toBase64(image);

    const prompt = `
次の画像から読み取れる内容をもとに、4択クイズを1問作成してください。

【要件】
- 問題文を1つ
- 正解を1つ
- 誤答を3つ
- 選択肢はランダム順
- JSON形式で返す
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: image.type,
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    setQuiz(JSON.parse(text));

    setLoading(false);
  };

  // Supabaseに保存
  const handleSave = async () => {
    if (!quiz || !image) return;

    const { data: imgData, error: imgError } = await supabase.storage
      .from("quiz-images")
      .upload(`quiz-${Date.now()}.png`, image);

    if (imgError) {
      alert("画像アップロード失敗");
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/quiz-images/${imgData.path}`;

    const { error } = await supabase.from("questions").insert({
      question: quiz.question,
      choice1: quiz.choices[0],
      choice2: quiz.choices[1],
      choice3: quiz.choices[2],
      choice4: quiz.choices[3],
      correct_index: quiz.correct_index ?? 1,
      genre,
      difficulty,
      image_url: imageUrl,
    });

    if (error) alert("保存失敗");
    else alert("保存完了！");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">クイズ生成</h1>

      {/* アップロードカード */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <label className="font-bold block">画像をアップロード</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
        />

        {/* プレビュー */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-48 rounded border mt-2"
          />
        )}

        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          画像からクイズ生成
        </button>

        {loading && <p>生成中…</p>}
      </div>

      {/* 生成結果カード */}
      {quiz && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold">生成されたクイズ</h2>

          <p className="font-bold">{quiz.question}</p>

          <ul className="space-y-1">
            {quiz.choices.map((c: string, i: number) => (
              <li key={i}>・{c}</li>
            ))}
          </ul>

          {/* ジャンル */}
          <div>
            <label className="block font-bold">ジャンル</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="自然科学">自然科学</option>
              <option value="社会">社会</option>
              <option value="スポーツ">スポーツ</option>
              <option value="雑学">雑学</option>
              <option value="歴史">歴史</option>
            </select>
          </div>

          {/* 難易度 */}
          <div>
            <label className="block font-bold">難易度</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="border p-2 rounded"
            >
              <option value={1}>★☆☆（かんたん）</option>
              <option value={2}>★★☆（ふつう）</option>
              <option value={3}>★★★（むずかしい）</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            保存する
          </button>
        </div>
      )}
    </div>
  );
}



