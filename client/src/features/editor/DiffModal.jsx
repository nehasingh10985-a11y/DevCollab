import { DiffEditor } from "@monaco-editor/react";

const DiffModal = ({ snap, currentCode, onApply, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d1117] border-b border-[#21262d] shrink-0 flex-wrap gap-2">
        {/* Left */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>
            <span className="text-[#e6edf3] text-sm font-semibold tracking-wide">
              diff viewer
            </span>
          </div>
          <div className="w-px h-4 bg-[#21262d]"></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500/20 border border-red-500"></div>
              <span className="text-[#8b949e] text-xs">current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500/20 border border-green-500"></div>
              <span className="text-[#8b949e] text-xs">snapshot</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1">
            <span className="text-blue-400 text-xs">📸</span>
            <span className="text-[#e6edf3] text-xs">{snap.name}</span>
            <span className="text-[#30363d] text-xs">•</span>
            <span className="text-[#8b949e] text-xs">{snap.language}</span>
          </div>
          <button
            onClick={onCancel}
            className="border border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#e6edf3] px-4 py-1.5 rounded-md text-xs transition-all bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="bg-[#238636] hover:bg-[#2ea043] border border-[#2ea043] text-white px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>↓</span> Apply Snapshot
          </button>
        </div>
      </div>

      {/* File Labels */}
      <div className="flex bg-[#0d1117] border-b border-[#21262d] shrink-0">
        <div className="flex-1 flex items-center gap-2 px-5 py-1.5 border-r border-[#21262d]">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <span className="text-red-400 text-xs font-medium">current code</span>
          <span className="text-[#30363d] text-xs">—</span>
          <span className="text-[#484f58] text-xs">will be replaced</span>
        </div>
        <div className="flex-1 flex items-center gap-2 px-5 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="text-green-400 text-xs font-medium">
            {snap.name}
          </span>
          <span className="text-[#30363d] text-xs">—</span>
          <span className="text-[#484f58] text-xs">
            {new Date(snap.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* DiffEditor */}
      <div className="flex-1 overflow-hidden">
        <DiffEditor
          key={`${snap._id}-diff`} // ← unique key add karo
          height="100%"
          width="100%"
          language={snap.language}
          original={currentCode}
          modified={snap.code}
          theme="vs-dark"
          keepCurrentModel={true}
          options={{
            fontSize: 14,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            readOnly: true,
            renderSideBySide: true,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
            },
          }}
        />
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-[#0d1117] border-t border-[#21262d] shrink-0">
        <span className="text-[#484f58] text-xs">
          review changes carefully before applying
        </span>
        <span className="text-[#484f58] text-xs">
          {snap.language} • read-only diff
        </span>
      </div>
    </div>
  );
};

export default DiffModal;
