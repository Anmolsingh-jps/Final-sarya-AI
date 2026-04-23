import { NextRequest, NextResponse } from "next/server";

/* ---------- RATE LIMIT (simple) ---------- */
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQ = 20;
const ipStore: any = new Map();

function isRateLimited(ip: string) {
  const now = Date.now();
  const rec = ipStore.get(ip) || { count: 0, start: now };

  if (now - rec.start > RATE_LIMIT_WINDOW) {
    ipStore.set(ip, { count: 1, start: now });
    return false;
  }

  rec.count += 1;
  ipStore.set(ip, rec);
  return rec.count > MAX_REQ;
}

/* ---------- CACHE ---------- */
const cache: any = new Map();

function getCache(key: string) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() > v.exp) {
    cache.delete(key);
    return null;
  }
  return v.data;
}

function setCache(key: string, data: any, ttl = 5 * 60 * 1000) {
  cache.set(key, { data, exp: Date.now() + ttl });
}

/* ---------- SAFE OUTPUT ---------- */
function normalizeOutput(d: any) {
  return {
    search_data: d?.search_data || "",
    verdict: d?.verdict || "BHRAMAK",
    main_response: d?.main_response || "",
    fix: d?.fix || "",
    reel_script: d?.reel_script || "",
    brand_strategy: {
      brand_voice: d?.brand_strategy?.brand_voice || "",
      monetization: d?.brand_strategy?.monetization || "",
      growth_hack: d?.brand_strategy?.growth_hack || ""
    },
    viralKit: {
      caption: d?.viralKit?.caption || "",
      hashtags: d?.viralKit?.hashtags || "",
      reel_hook: d?.viralKit?.reel_hook || ""
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body: any = await req.json();
    const query: string = body?.query || "";

    if (!query) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }

    const cacheKey = query.toLowerCase();
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    /* ---------- GOOGLE SEARCH ---------- */
    let searchData: any = [];
    try {
      const res = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}`
      );
      const data = await res.json();
      searchData = data?.organic_results?.slice(0, 3) || [];
    } catch {
      searchData = "Search Failed";
    }

    /* ---------- GEMINI ---------- */
    let aiText: any = "";
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
You are SATYA AI (Fact-checker + Viral Strategist).

Analyze this:
"${query}"

Using this data:
${JSON.stringify(searchData)}

Return STRICT JSON:

{
  "search_data": "",
  "verdict": "SATYA / ASATYA / BHRAMAK",
  "main_response": "Explain in Hinglish",
  "fix": "How to correct it",
  "reel_script": "30 sec script",
  "brand_strategy": {
    "brand_voice": "",
    "monetization": "",
    "growth_hack": ""
  },
  "viralKit": {
    "caption": "",
    "hashtags": "",
    "reel_hook": ""
  }
}
`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await geminiRes.json();
      aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch {
      aiText = "";
    }

    /* ---------- PARSE ---------- */
    let finalData: any;
    try {
      finalData = JSON.parse(aiText);
    } catch {
      finalData = {
        search_data: searchData,
        verdict: "BHRAMAK",
        main_response: aiText
      };
    }

    finalData = normalizeOutput(finalData);
    setCache(cacheKey, finalData);

    return NextResponse.json(finalData);

  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}