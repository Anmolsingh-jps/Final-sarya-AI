import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Yahan String use kiya hai taaki TypeScript number wala error na de
const apiKey = String(process.env.GEMINI_API_KEY=AIzaSyAVocNyyC-LpNFBec1e49W1-laraRXCYVw);
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { message, fileData, fileMimeType } = await req.json();
    
    if (!apiKey) {
      return NextResponse.json({ reply: "API Key missing in Vercel settings!" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are "Satya AI". 
      1. Detect user's language and reply in the same.
      2. If video/image is uploaded, fact-check it.
      3. Always return response in this JSON format:
      {
        "reply": "Main message",
        "verdict": "Real/Fake/Chat",
        "viralKit": { "caption": "...", "hashtags": "#tag1 #tag2..." }
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
    console.error(error);
    return NextResponse.json({ reply: "Bhai, AI ne jawab nahi diya. Check settings.", verdict: "Chat" }, { status: 500 });
  }
}
