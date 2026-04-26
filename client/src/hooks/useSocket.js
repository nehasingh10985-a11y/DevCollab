import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { setCode, setLanguage } from "../features/editor/editorSlice";
import { addMessage, markAsSeen } from "../features/chat/chatSlice";
import { setActiveUsers, updateCursor } from "../features/rooms/roomSlice";
import toast from "react-hot-toast";

const SOCKET_URL = "http://localhost:5000";

const useSocket = (roomId, user) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!roomId || !user) return;

    // ← Connect karo
    socketRef.current = io(SOCKET_URL);

    // ← Sirf ek baar join karo
    socketRef.current.emit("join-room", { roomId, user });

    socketRef.current.on("code-update", (data) => {
      if (typeof data === "string") {
        dispatch(setCode(data));
      } else {
        const { code, user: incomingUser } = data;
        const currentUserId = user._id || user.id;
        const incomingUserId = incomingUser?._id || incomingUser?.id;
        if (
          !incomingUser ||
          incomingUserId === "system" ||
          incomingUserId !== currentUserId
        ) {
          dispatch(setCode(code));
        }
      }
    });

    socketRef.current.on("cursor-update", ({ user, position }) => {
      dispatch(updateCursor({ user, position }));
    });

    socketRef.current.on("language-update", (language) => {
      dispatch(setLanguage(language));
    });

    socketRef.current.on("user-joined", ({ user, activeUsers }) => {
      toast.success(`${user.name} joined! 👋`);
      dispatch(setActiveUsers(activeUsers));
    });

    socketRef.current.on("user-left", ({ user, activeUsers }) => {
      toast(`${user.name} left the room`, { icon: "👋" });
      dispatch(setActiveUsers(activeUsers));
    });

    socketRef.current.on("active-users", (activeUsers) => {
      dispatch(setActiveUsers(activeUsers));
    });

    socketRef.current.on("notify-run", (runningUser) => {
      toast(`${runningUser.name} code run kar raha hai... ⚙️`, {
        style: { background: "#3b82f6", color: "#fff" },
      });
    });

    socketRef.current.on("messages-seen", () => {
      dispatch(markAsSeen());
    });

    // ← Yahan message receive hota hai — hamesha dispatch karo
    socketRef.current.on("receive-message", (message) => {
      dispatch(addMessage(message));

      const currentUserId = user._id || user.id;
      const senderId = message.user._id || message.user.id;

      if (senderId !== currentUserId) {
        toast(`💬 ${message.user.name}: ${message.text.substring(0, 25)}...`, {
          style: {
            borderRadius: "10px",
            background: "#1f2937",
            color: "#fff",
          },
        });
      }
    });

    return () => {
      socketRef.current.emit("leave-room", { roomId, user });
      socketRef.current.disconnect();
    };
  }, [roomId, user?.id]); // ← user?.id use karo, pura user object nahi

  const emitCodeChange = (code) => {
    socketRef.current?.emit("code-change", { roomId, code, user });
  };

  const emitCursorMove = (position) => {
    socketRef.current?.emit("cursor-move", { roomId, user, position });
  };

  const emitLanguageChange = (language) => {
    socketRef.current?.emit("language-change", { roomId, language });
  };

  const emitMessage = ({ roomId, user, text }) => {
    socketRef.current?.emit("send-message", { roomId, user, text });
  };

  const emitSaveCode = (code, language) => {
    socketRef.current?.emit("save-code", { roomId, code, language });
  };

  const emitRunCode = () => {
    socketRef.current?.emit("code-run", { roomId, user });
  };

  const emitMarkSeen = () => {
    socketRef.current?.emit("mark-seen", {
      roomId,
      userId: user?._id || user?.id,
    });
  };

  return {
    emitCodeChange,
    emitLanguageChange,
    socket: socketRef,
    emitMessage,
    emitSaveCode,
    emitCursorMove,
    emitRunCode,
    emitMarkSeen,
  };
};

export default useSocket;
