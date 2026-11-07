// AI opsional (Ollama lokal) untuk ejekan boss & epitaf; fallback jika offline
async function ai(p) {
  try {
    const c = new AbortController(),
      x = setTimeout(() => c.abort(), 12000);
    const r = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      signal: c.signal,
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        stream: false,
        options: { num_predict: 60, temperature: 0.9 },
        messages: [{ role: 'user', content: p }],
      }),
    });
    clearTimeout(x);
    return (await r.json()).message.content
      .trim()
      .replace(/^["']|["']$/g, '')
      .slice(0, 110);
  } catch (e) {
    return null;
  }
}
