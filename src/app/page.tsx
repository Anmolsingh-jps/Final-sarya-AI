"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!query) return alert("Enter something");

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center">

      <h1 className="text-4xl font-bold mb-6 text-purple-400">
        Satya AI ⚡
      </h1>

      <input
        className="w-full max-w-xl p-4 rounded bg-white/10 border border-white/20"
        placeholder="Paste reel / news..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-purple-600 rounded"
      >
        Analyze
      </button>

      {result && (
        <div className="mt-6 w-full max-w-xl space-y-4">

          <Card title="Verdict" value={result.verdict} />
          <Card title="Analysis" value={result.main_response} />
          <Card title="Fix" value={result.fix} />
          <Card title="Reel Script" value={result.reel_script} />
          <Card title="Caption" value={result.viralKit.caption} />
          <Card title="Hashtags" value={result.viralKit.hashtags} />

        </div>
      )}
    </main>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white/10 p-4 rounded">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}