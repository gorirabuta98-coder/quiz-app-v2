import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // ① OCR（画像→テキスト化）
    const ocrRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: imageUrl },
            { type: "text", text: "この画像の内容をできるだけ正確にテキスト化してください。" },
          ],
        },
      ],
    });

    const ocrText = ocrRes.choices[0].message.content;

    // ② クイズ生成（JSON固定）
    const quizPrompt = `
以下の文章から、必ず JSON 形式で 4択クイズを1問作ってください。

出力形式はこれだけにしてください：

{
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "correct_index": 1
}

文章：
${ocrText}
`;

    const quizRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "必ず JSON のみを返してください。" },
        { role: "user", content: quizPrompt },
      ],
    });

    const raw = quizRes.choices[0].message.content;

if (!raw) {
  return NextResponse.json(
    { error: "AIの返答が空でした（null）" },
    { status: 500 }
  );
}

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
