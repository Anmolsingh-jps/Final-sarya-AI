"use client";
import { useState } from "react";
import { Send, Paperclip } from "lucide-react";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, fileData: base64, fileMimeType: file?.type }),
      });
      const data = await res.json();
      setChat([...chat, { role: "user", text: input }, { role: "ai", ...data }]);
      setInput(""); setFile(null);
    } catch (e) { 
      alert("Connection issue!"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', height: '90vh' }}>
        <h1 style={{ color: '#a855f7', textAlign: 'center', fontSize: '2.5rem', fontWeight: '900' }}>SATYA AI</h1>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {chat.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
              <div style={{ 
                padding: '15px', 
                borderRadius: '20px', 
                maxWidth: '85%', 
                backgroundColor: m.role === 'user' ? '#9333ea' : '#18181b',
                border: m.role === 'ai' ? '1px solid #3b0764' : 'none'
              }}>
                {m.role === 'ai' ? (
                  <div>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{m.reply}</p>
                    {m.verdict !== "Chat" && m.viralKit && (
                      <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px', borderLeft: '4px solid #a855f7' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#a855f7' }}>VERDICT: {m.verdict}</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '5px' }}>{m.viralKit.caption}</p>
                        <p style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '5px' }}>{m.viralKit.hashtags}</p>
                      </div>
                    )}
                  </div>
                ) : <p>{m.text}</p>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#18181b', padding: '10px', borderRadius: '30px', border: '1px solid #27272a' }}>
          <input type="file" id="up" hidden onChange={(e) => setFile(e.target.files![0])} />
          <label htmlFor="up" style={{ padding: '10px', cursor: 'pointer', color: file ? '#22c55e' : '#71717a' }}>
            <Paperclip size={24} />
          </label>
          <input 
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
            placeholder="Baat karo ya news check karo..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} style={{ backgroundColor: '#9333ea', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
