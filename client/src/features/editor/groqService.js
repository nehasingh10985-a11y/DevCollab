export const explainCode = async (code, language) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful code assistant. Explain code clearly in simple English under 150 words.",
        },
        {
          role: "user",
          content: `Explain this ${language} code:\n\n${code}`,
        },
      ],
      max_tokens: 300,
    }),
  });

  const data = await res.json();
  console.log("Groq response:", data);

  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0].message.content;
};

export const fixCode = async (code, language, error) => {
  // ← export zaroor likho
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a code debugging assistant. Find the bug and provide fixed code with brief explanation.",
        },
        {
          role: "user",
          content: `Fix this ${language} code:\n\n${code}\n\nError: ${error || "Unknown error"}`,
        },
      ],
      max_tokens: 500,
    }),
  });

  const data = await res.json();
  console.log("Fix response:", data);

  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0].message.content;
};

// 👇 NAYA FUNCTION CHAT AI KE LIYE 👇
export const generateChatAI = async (text) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful coding collaboration assistant. Your job is to rewrite the user's rough chat input into a clear, professional, and friendly chat message suitable for a developer team. Keep it concise. Do not include any extra commentary, just return the fixed message.",
        },
        {
          role: "user",
          content: `Rewrite this chat message to sound better: "${text}"`,
        },
      ],
      max_tokens: 150,
    }),
  });

  const data = await res.json();
  console.log("Chat AI response:", data);

  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  // Extra quotes hataane ke liye replace() lagaya hai
  return data.choices[0].message.content.replace(/^"|"$/g, "");
};
