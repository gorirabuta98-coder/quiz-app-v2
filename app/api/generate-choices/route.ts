import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { question, correct } = await req.json();

    if (!question || !correct) {
      return NextResponse.json(
        { error: "question と correct は必須です" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
あなたはクイズ作成の専門家です。
以下の問題文と正解をもとに、自然で、もっともらしく、引っかけとして成立する誤答を3つ作ってください。

条件:
- 正解と矛盾しない
- 正解と似すぎない
- でも「ありそう」な選択肢にする
- 必ず JSON 形式で返す

出力形式:
{
  "choices": ["誤答1", "誤答2", "誤答3"]
}

問題文: ${question}
正解: ${correct}
`;

    const result = await model.generateContent([
      { text: "必ず JSON のみを返してください。" },
      { text: prompt },
    ]);

    let raw = result.response.text();

    // 余計な記号を除去
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json(
        { error: "AIの返答がJSON形式ではありません", raw },
        { status: 500 }
      );
    }

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

