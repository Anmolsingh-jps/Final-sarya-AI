import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey: any = "AIzaSyAVocNyyC-LpNFBec1e49W1-laraRXCYVw";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message, fileData, fileMimeType } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are "Satya AI". 
      Respond in user's language.
      If video/image is uploaded, fact-check it.
      Return ONLY JSON:
      {
        "reply": "Main message",
        "verdict": "Real/Fake/Chat",
        "viralKit": { "caption": "...", "hashtags": "#tag1 #tag2" }
      }
      Input: ${message}`;

    let result;
    if (fileData && fileMimeType) {
      result = await model.generateContent([
        prompt,
        { inlineData: { data: fileData, mimeType: fileMimeType } }
      ]);
    } else {
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    return NextResponse.json({ reply: "API Error" }, { status: 500 });
  }
}
