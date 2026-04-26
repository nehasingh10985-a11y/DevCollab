import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, setMessages } from "./chatSlice";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { generateChatAI } from "../editor/groqService";

const ChatSidebar = ({ emitMessage, emitMarkSeen, roomId, isVisible }) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const [text, setText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const bottomRef = useRef(null);

  // --- 1. RELOAD & INITIAL FETCH ---
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        console.log("🔄 Fetching history for:", roomId);
        const res = await api.get(`/messages/${roomId}`);

        if (res.data) {
          // ✅ YAHAN DISPATCH HONA ZAROORI HAI
          dispatch(setMessages(res.data));
          console.log(`✅ MongoDB se ${res.data.length} messages load hue!`);
        }
      } catch (err) {
        console.error(
          "🚨 Reload API Error:",
          err.response?.data || err.message,
        );
      }
    };

    if (roomId && roomId !== "undefined") {
      fetchChatHistory();
    }
  }, [roomId, dispatch]); // dependency array fixed

  // --- 2. SCROLL TO BOTTOM ---
  useEffect(() => {
    if (isVisible) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length, isVisible]);

  // --- 3. SEEN LOGIC ---
  useEffect(() => {
    if (!isVisible || !messages || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const myId = user?._id || user?.id;
    const senderId = lastMessage?.user?._id || lastMessage?.user?.id;

    if (senderId !== myId && !lastMessage?.seen && emitMarkSeen) {
      emitMarkSeen();
    }
  }, [messages?.length, isVisible, user, emitMarkSeen]);

  // --- HANDLERS ---
  const handleCopy = (messageText) => {
    navigator.clipboard.writeText(messageText);
    toast.success("Message copied! 📋");
  };

  const handleAskAI = async () => {
    if (!text.trim()) return toast.error("AI ke liye thoda text likho!");
    setIsAiLoading(true);
    const toastId = toast.loading("AI soch raha hai...");

    try {
      const prompt = `Rewrite or generate a professional chat reply for this: "${text}"`;
      const aiResponse = await generateChatAI(prompt);
      setText(aiResponse);
      toast.success("AI ne text likh diya!", { id: toastId });
    } catch (error) {
      toast.error("AI kaam nahi kar raha!", { id: toastId });
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    emitMessage({
      roomId,
      user: { id: user?._id || user?.id, name: user?.name },
      text: text.trim(),
    });

    setText("");
  };

  return (
    <div className="w-72 border-l border-gray-800 bg-gray-900 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-300">Chat</h3>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3 hide-scrollbar">
        {(!messages || messages.length === 0) && (
          <p className="text-gray-600 text-xs text-center mt-4">
            Koi message nahi abhi...
          </p>
        )}

        {messages?.map((msg, i) => {
          const senderName = msg?.user?.name || "Unknown User";
          const isMe = user?.name === msg?.user?.name;
          const isLastMessage = i === messages.length - 1;

          return (
            <div
              key={msg?._id || i}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <span className="text-xs text-gray-500 mb-1">{senderName}</span>
              <div
                className={`flex items-center gap-1.5 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[90%] whitespace-pre-wrap ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  {msg?.text || ""}
                </div>
                <button
                  onClick={() => handleCopy(msg?.text || "")}
                  className="opacity-0 group-hover:opacity-100 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-300 p-1.5 rounded transition"
                >
                  📋
                </button>
              </div>
              {isMe && isLastMessage && msg?.seen && (
                <span className="text-[10px] text-blue-400 mt-1 font-medium">
                  Seen ✓✓
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-3 border-t border-gray-800 flex gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message likho..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition min-w-0"
        />
        <button
          type="button"
          onClick={handleAskAI}
          disabled={isAiLoading || !text.trim()}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-2.5 py-2 rounded-lg text-sm transition"
        >
          {isAiLoading ? "⏳" : "🤖"}
        </button>
        <button
          type="submit"
          disabled={!text.trim() || isAiLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition"
        >
          ↑
        </button>
      </form>
    </div>
  );
};

export default ChatSidebar;
