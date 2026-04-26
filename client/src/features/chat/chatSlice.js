import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [] },
  reducers: {
    addMessage: (state, action) => {
      // Sirf _id se check — koi time/text check nahi
      const exists = state.messages.some(
        (m) => m._id && action.payload._id && m._id === action.payload._id,
      );
      if (!exists) state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      if (!Array.isArray(action.payload)) return;
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    markAsSeen: (state) => {
      state.messages = state.messages.map((m) => ({ ...m, seen: true }));
    },
  },
});

export const { addMessage, setMessages, clearMessages, markAsSeen } =
  chatSlice.actions;
export default chatSlice.reducer;
