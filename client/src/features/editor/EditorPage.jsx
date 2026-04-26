import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { setCode, setLanguage, runCode } from "./editorSlice";
import useSocket from "../../hooks/useSocket";
import ChatSidebar from "../chat/ChatSidebar";
import Editor from "@monaco-editor/react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";
import { explainCode, fixCode } from "./groqService";
import DiffModal from "./DiffModal";
import LiveCursor from "./LiveCursor";
import { getUserColor } from "../rooms/roomSlice";
import { setMessages } from "../chat/chatSlice";

const languages = ["javascript", "python", "cpp", "java"];

const defaultCode = {
  javascript: "// JavaScript\nconsole.log('Hello DevCollab!');",
  python: "# Python\nprint('Hello DevCollab!')",
  cpp: '#include<iostream>\nusing namespace std;\nint main(){\n  cout<<"Hello DevCollab!";\n  return 0;\n}',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello DevCollab!");\n  }\n}',
};

const EditorPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { code, language, output, runLoading } = useSelector((s) => s.editor);
  const { user } = useSelector((s) => s.auth);
  const { activeUsers = [], cursors = {} } = useSelector((s) => s.rooms);

  const [showChat, setShowChat] = useState(false);
  const [snapName, setSnapName] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const [showSnaps, setShowSnaps] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiMode, setAiMode] = useState("explain");
  const [showDiff, setShowDiff] = useState(false);
  const [diffSnap, setDiffSnap] = useState(null);
  const [codeCache, setCodeCache] = useState(defaultCode);
  const editorRef = useRef(null); // ← sirf ek baar

  const {
    emitCodeChange,
    emitLanguageChange,
    socket,
    emitMessage,
    emitSaveCode,
    emitCursorMove,
    emitRunCode,
    emitMarkSeen,
  } = useSocket(roomId, user); // ← sirf ek baar

  useEffect(() => {
    const interval = setInterval(() => {
      emitSaveCode(code, language);
    }, 30000);
    return () => clearInterval(interval);
  }, [code, language]);

  useEffect(() => {
    if (code !== undefined && language) {
      setCodeCache((prev) => ({
        ...prev,
        [language]: code,
      }));
    }
  }, [code, language]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleToggleChat = async () => {
    const newShowChat = !showChat;
    setShowChat(newShowChat);
    if (newShowChat) {
      try {
        const res = await api.get(`/messages/${roomId}`);
        dispatch(setMessages(res.data));
      } catch (err) {}
    }
  };

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      console.log("Editor mounted ✅");

      editor.onDidChangeCursorPosition((e) => {
        // e.reason 3 ka matlab hai ki user ne khud mouse click kiya hai ya type kiya hai.
        // Agar socket se code update ho raha hai (reason 0, 1, ya 2), toh hum cursor position NAHI bhejenge.
        if (
          e.reason === 3 ||
          e.reason === 4 ||
          e.reason === 5 ||
          e.reason === 6
        ) {
          console.log("Asli user ka cursor move hua:", e.position);
          emitCursorMove({
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          });
        }
      });
    },
    [emitCursorMove],
  ); // <-- Ye dhyan rakhiyega
  const handleLeave = () => {
    const ok = window.confirm(
      "Room leave karna chahte ho? Code save ho jaayega.",
    );
    if (ok) {
      emitSaveCode(code, language);
      navigate("/dashboard");
    }
  };

  const handleLanguageChange = (lang) => {
    dispatch(setLanguage(lang));

    // Check karo ki is language ka koi purana code cache mein hai kya
    const nextCode = codeCache[lang] || defaultCode[lang];

    dispatch(setCode(nextCode));

    // Socket ke zariye baaki sabko bhi batao ki language aur code change hua hai
    emitLanguageChange(lang);
    emitCodeChange(nextCode);
  };

  const handleCodeChange = (val) => {
    dispatch(setCode(val || ""));
    emitCodeChange(val || "");
  };

  const handleRun = () => {
    emitRunCode(); // Dusro ko batao ki main code run kar raha hu
    dispatch(runCode({ code, language })); // Apna actual code run karo
  };

  const getOutput = () => {
    if (!output) return null;
    if (output.stdout) return { text: output.stdout, type: "success" };
    if (output.stderr) return { text: output.stderr, type: "error" };
    if (output.compile_output)
      return { text: output.compile_output, type: "error" };
    return { text: "No output", type: "info" };
  };

  const result = getOutput();

  const saveSnapshot = async () => {
    if (!snapName.trim()) return toast.error("Snapshot ka naam do!");
    await api.post("/snapshots", { roomId, name: snapName, code, language });
    setSnapName("");
    toast.success("Snapshot saved! ✅");
  };

  const loadSnapshots = async () => {
    const res = await api.get(`/snapshots/${roomId}`);
    setSnapshots(res.data);
    setShowSnaps(true);
  };

  const restoreSnapshot = (snap) => {
    setDiffSnap(snap);
    setShowDiff(true);
    setShowSnaps(false);
  };

  const applySnapshot = () => {
    const snapCode = diffSnap.code;
    const snapLang = diffSnap.language;
    setShowDiff(false);
    setDiffSnap(null);
    setTimeout(() => {
      dispatch(setCode(snapCode));
      dispatch(setLanguage(snapLang));
      emitCodeChange(snapCode);
      emitLanguageChange(snapLang);
      toast.success("Snapshot applied! ✅");
    }, 200);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied! 📋");
  };

  const handleExplain = async () => {
    setAiMode("explain");
    setAiLoading(true);
    setShowAi(true);
    setAiResponse(null);
    try {
      const res = await explainCode(code, language);
      setAiResponse(res);
    } catch {
      toast.error("AI helper kaam nahi kar raha!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFix = async () => {
    setAiMode("fix");
    const error = output?.stderr || output?.compile_output || "";
    setAiLoading(true);
    setShowAi(true);
    setAiResponse(null);
    try {
      const res = await fixCode(code, language, error);
      setAiResponse(res);
    } catch {
      toast.error("AI helper kaam nahi kar raha!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLeave}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ← Dashboard
          </button>
          <span className="text-gray-600 hidden sm:block">|</span>
          <button
            onClick={copyRoomId}
            className="text-xs text-gray-400 hover:text-white font-mono hidden sm:block truncate max-w-[140px]"
          >
            {roomId} 📋
          </button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`text-xs px-2 py-1.5 rounded-md transition font-medium ${
                language === lang
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={snapName}
            onChange={(e) => setSnapName(e.target.value)}
            placeholder="Snapshot naam..."
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs outline-none w-28"
          />
          <button
            onClick={saveSnapshot}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            Save
          </button>
          <button
            onClick={loadSnapshots}
            className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            History
          </button>
          <button
            onClick={handleExplain}
            disabled={aiLoading}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            🤖 Explain
          </button>
          <button
            onClick={handleFix}
            disabled={aiLoading || !output}
            className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            🔧 Fix Bug
          </button>
          <button
            onClick={handleRun}
            disabled={runLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
          >
            {runLoading ? "Running..." : "▶ Run"}
          </button>
          <button
            onClick={handleToggleChat}
            className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            {showChat ? "Hide Chat" : "Chat 💬"}
          </button>
        </div>
      </div>

      {/* Active Users Bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 border-b border-gray-800 flex-wrap">
        <span className="text-xs text-gray-500">Online:</span>
        {activeUsers.map((u, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: getUserColor(u.id) }}
            ></div>
            <span className="text-xs text-gray-300">{u.name}</span>
          </div>
        ))}
        {activeUsers.length === 0 && (
          <span className="text-xs text-gray-600">Sirf tum ho abhi</span>
        )}
      </div>

      {/* Snapshots Modal */}
      {showSnaps && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Code History</h3>
              <button
                onClick={() => setShowSnaps(false)}
                className="text-gray-400"
              >
                ✕
              </button>
            </div>
            {snapshots.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Koi snapshot nahi hai abhi
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto">
                {snapshots.map((snap) => (
                  <div
                    key={snap._id}
                    className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{snap.name}</p>
                      <p className="text-xs text-gray-500">
                        {snap.language} •{" "}
                        {new Date(snap.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreSnapshot(snap)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diff Modal */}
      {showDiff && diffSnap && (
        <DiffModal
          snap={diffSnap}
          currentCode={code}
          onApply={applySnapshot}
          onCancel={() => {
            setShowDiff(false);
            setDiffSnap(null);
          }}
        />
      )}

      {/* AI Modal */}
      {showAi && (
        <div className="fixed bottom-4 right-4 w-[480px] bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-950 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-orange-900/40 text-orange-400 px-3 py-1 rounded-full font-medium">
                🤖 AI Helper
              </span>
              <span className="text-sm font-medium text-gray-200">
                {aiLoading
                  ? "Thinking..."
                  : aiMode === "explain"
                    ? "Code Explanation"
                    : "Bug Fix"}
              </span>
            </div>
            <button
              onClick={() => setShowAi(false)}
              className="text-gray-500 hover:text-white transition text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="flex bg-gray-950 border-b border-gray-800">
            <button
              onClick={handleExplain}
              className={`px-5 py-2.5 text-xs font-medium transition border-b-2 ${
                aiMode === "explain"
                  ? "text-orange-400 border-orange-500"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              🤖 Explain Code
            </button>
            <button
              onClick={handleFix}
              disabled={!output}
              className={`px-5 py-2.5 text-xs font-medium transition border-b-2 disabled:opacity-40 ${
                aiMode === "fix"
                  ? "text-red-400 border-red-500"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              🔧 Fix Bug
            </button>
          </div>
          <div className="p-5 max-h-72 overflow-y-auto hide-scrollbar">
            {aiLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
                <span className="text-sm text-gray-500">
                  AI soch raha hai...
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </p>
            )}
          </div>
          <div className="px-5 py-2.5 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-600">
              Powered by Groq — llama3
            </span>
            <button
              onClick={aiMode === "explain" ? handleExplain : handleFix}
              disabled={aiLoading}
              className="text-xs text-orange-400 hover:text-orange-300 transition disabled:opacity-40"
            >
              Regenerate ↺
            </button>
          </div>
        </div>
      )}

      {/* Editor + Output + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Editor + LiveCursor */}
        <div className="flex-1 min-w-0 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 16 },
            }}
          />
          <LiveCursor editorRef={editorRef} userId={user?.id} />
        </div>

        {/* Output Panel */}
        <div
          className={`border-l border-gray-800 bg-gray-900 flex flex-col shrink-0 transition-all duration-300 overflow-hidden ${
            showChat ? "w-64 lg:w-72" : "w-80 lg:w-96"
          }`}
        >
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Output</span>
            {output && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  result?.type === "success"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {result?.type === "success" ? "✓ Success" : "✗ Error"}
              </span>
            )}
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-auto hide-scrollbar">
            {!output && !runLoading && (
              <p className="text-gray-600">
                Code run karo output dekhne ke liye...
              </p>
            )}
            {runLoading && (
              <p className="text-gray-400 animate-pulse">Running...</p>
            )}
            {result && (
              <pre
                className={`whitespace-pre-wrap ${
                  result.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.text}
              </pre>
            )}
          </div>
          {output && (
            <div className="border-t border-gray-800 px-4 py-3 flex gap-4 text-xs text-gray-500">
              <span>Time: {output.time || "—"}s</span>
              <span>Memory: {output.memory || "—"} KB</span>
            </div>
          )}
        </div>

        {/* Chat */}

        {showChat && (
          <ChatSidebar
            emitMessage={emitMessage}
            emitMarkSeen={emitMarkSeen}
            socket={socket}
            roomId={roomId}
            isVisible={showChat}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPage;
