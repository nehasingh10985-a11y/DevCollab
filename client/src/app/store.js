import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import roomReducer from "../features/rooms/roomSlice";
import editorReducer from "../features/editor/editorSlice";
import chatReducer from "../features/chat/chatSlice"; // ← ye missing tha

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomReducer,
    editor: editorReducer,
    chat: chatReducer,
  },
});
