import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const LiveCursor = ({ editorRef, userId }) => {
  const { cursors = {} } = useSelector((s) => s.rooms);
  const decorationsRef = useRef([]);

  useEffect(() => {
    if (!editorRef.current) return;

    const otherCursors = Object.entries(cursors).filter(
      ([id]) => id !== userId,
    );

    if (otherCursors.length === 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [],
      );
      return;
    }

    // CSS inject
    otherCursors.forEach(([cursorUserId, cursor]) => {
      const styleId = `cs-${cursorUserId}`;
      let style = document.getElementById(styleId);
      if (!style) {
        style = document.createElement("style");
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `
        .rc-${cursorUserId} {
          border-left: 3px solid ${cursor.color} !important;
          background: ${cursor.color}30 !important;
          margin-left: -1px !important;
        }
      `;
    });

    // Decorations
    const newDecorations = otherCursors.map(([cursorUserId, cursor]) => ({
      range: {
        startLineNumber: cursor.position?.lineNumber || 1,
        startColumn: cursor.position?.column || 1,
        endLineNumber: cursor.position?.lineNumber || 1,
        endColumn: (cursor.position?.column || 1) + 1,
      },
      options: {
        className: `rc-${cursorUserId}`,
        stickiness: 1,
        hoverMessage: { value: `**${cursor.name}**` },
      },
    }));

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations,
    );

    // Name label — body mein fixed position
    otherCursors.forEach(([cursorUserId, cursor]) => {
      try {
        const pos = editorRef.current.getScrolledVisiblePosition({
          lineNumber: cursor.position?.lineNumber || 1,
          column: cursor.position?.column || 1,
        });

        if (!pos) return;

        const editorDom = editorRef.current.getDomNode();
        if (!editorDom) return;
        const rect = editorDom.getBoundingClientRect();

        let label = document.getElementById(`cl-${cursorUserId}`);
        if (!label) {
          label = document.createElement("div");
          label.id = `cl-${cursorUserId}`;
          Object.assign(label.style, {
            position: "fixed",
            color: "white",
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: "99999",
            whiteSpace: "nowrap",
            fontFamily: "sans-serif",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          });
          label.textContent = cursor.name;
          document.body.appendChild(label);
        }

        label.style.background = cursor.color;
        label.style.top = `${rect.top + pos.top - 24}px`;
        label.style.left = `${rect.left + pos.left}px`;
        label.style.display = "block";
      } catch (e) {}
    });
  }, [cursors, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(cursors).forEach((cursorUserId) => {
        document.getElementById(`cl-${cursorUserId}`)?.remove();
        document.getElementById(`cs-${cursorUserId}`)?.remove();
      });
    };
  }, []);

  return null;
};

export default LiveCursor;
