"use client";
import { useState } from "react";
import { Send, Paperclip, CheckCircle } from "lucide-react";

export default function SatyaAI() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSend = async () => {
    if (!input && !file) return;
    setLoading(true);
    let base64 = null;
    if (file) {
      const reader = new FileReader();
      base64 = await new Promise((res) => {
        reader.onload = () => res((reader.result as string).split(",")[1]);
        reader.readAsDataURL(file);
      });
    }

    try {
      const res = await fetch("/api/satya", {
        method: "POST",
        body: JSON.stringify({ message: input, fileData: base64, fileMimeType: file?.type }),
      });
      const data = await res.json();
      setChat([...chat, { role: "user", text: input }, { role: "ai", ...data }]);
      setInput(""); setFile(null);
    } catch (e) { alert("Error!"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="max-w-2xl w-full flex flex-col h-[90vh]">
        <h1 className="text-4xl font-black text-center text-purple-500 py-6">SATYA AI</h1>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-2">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-purple-600' : 'bg-zinc-900 border border-purple-900/40'}`}>
                {m.role === 'ai' ? (
                  <div className="space-y-3">
                    <p className="text-lg">{m.reply}</p>
                    {m.verdict !== "Chat" && (
                      <div className="bg-black/50 p-3 rounded-lg border-l-4 border-purple-500">
                        <p className="text-xs text-purple-400 font-bold uppercase">Verdict: {m.verdict}</p>
                        <p className="text-sm mt-1">{m.viralKit.caption}</p>
                        <p className="text-xs text-blue-400 mt-2">{m.viralKit.hashtags}</p>
                      </div>
                    )}
                  </div>
                ) : <p>{m.text}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-zinc-900 rounded-3xl p-3 flex items-center gap-3 border border-white/5">
          <input type="file" id="up" hidden onChange={(e) => setFile(e.target.files![0])} />
          <label htmlFor="up" className="p-2 cursor-pointer hover:bg-white/5 rounded-full">
            <Paperclip size={20} className={file ? "text-green-500" : "text-gray-400"} />
          </label>
          <input 
            className="flex-1 bg-transparent outline-none p-2" 
            placeholder="Kuch pucho ya news dalo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={handleSend} disabled={loading} className="p-3 bg-purple-600 rounded-full">
            {loading ? "..." : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
