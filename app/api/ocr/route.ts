import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ① 画像を base64 に変換
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const base64Image = Buffer.from(imgBuffer).toString("base64");

    // ② OCR（画像→テキスト化）
    const ocrResult = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
      { text: "この画像の内容をできるだけ正確にテキスト化してください。" },
    ]);

    const ocrText = ocrResult.response.text();

    // ③ JSON形式でクイズ生成
    const quizPrompt = `
以下の文章から必ず JSON 形式で4択クイズを1問作ってください。

出力形式はこれだけ：

{
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "correct_index": 1
}

文章：
${ocrText}
`;

    const quizResult = await model.generateContent([
      { text: "必ず JSON のみを返してください。" },
      { text: quizPrompt },
    ]);

    const raw = quizResult.response.text();

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json(
        { error: "AIの返答がJSON形式ではありません", raw },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz: json });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

