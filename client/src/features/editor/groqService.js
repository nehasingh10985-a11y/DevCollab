const MODEL = "openai/gpt-oss-20b";

const callGroq = async (messages, maxTokens) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      reasoning_effort: "low",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0].message.content?.trim() || "";
};

export const explainCode = (code, language) =>
  callGroq(
    [
      {
        role: "system",
        content:
          "You are a helpful code assistant. Explain code clearly in simple English under 150 words.",
      },
      { role: "user", content: `Explain this ${language} code:\n\n${code}` },
    ],
    1000,
  );

export const fixCode = (code, language, error) =>
  callGroq(
    [
      {
        role: "system",
        content:
          "You are a code debugging assistant. Find the bug and provide fixed code with a brief explanation.",
      },
      {
        role: "user",
        content: `Fix this ${language} code:\n\n${code}\n\nError: ${error || "Unknown error"}`,
      },
    ],
    1500,
  );

export const generateChatAI = async (text) => {
  const reply = await callGroq(
    [
      {
        role: "system",
        content:
          "Rewrite the user's rough chat input into a clear, professional, friendly message for a developer team. Keep it concise. Return only the rewritten message.",
      },
      {
        role: "user",
        content: `Rewrite this chat message to sound better: "${text}"`,
      },
    ],
    600,
  );
  return reply.replace(/^"|"$/g, "");
};
