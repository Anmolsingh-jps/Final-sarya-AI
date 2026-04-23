import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY=AIzaSyAVocNyyC-LpNFBec1e49W1-laraRXCYVw);

export async function POST(req: Request) {
  try {
    const { message, fileData, fileMimeType } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are "Satya AI". 
      1. Detect user's language and reply in the same.
      2. If video/image is uploaded, fact-check it.
      3. Provide a viral caption, 10 hashtags, and point out any mistakes in content.
      4. Always return response in this JSON format:
      {
        "reply": "Main message",
        "verdict": "Real/Fake/Chat",
        "viralKit": { "caption": "...", "hashtags": "#tag1 #tag2" }
      }`;

    let result;
    if (fileData) {
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
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}
