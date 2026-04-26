import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
];

export const getUserColor = (userId) => {
  const index = userId.charCodeAt(userId.length - 1) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
};

export const fetchMyRooms = createAsyncThunk(
  "rooms/fetchMyRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/rooms/my-rooms");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      const res = await api.post("/rooms/create", roomData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

export const joinRoom = createAsyncThunk(
  "rooms/joinRoom",
  async (roomId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/rooms/join/${roomId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data.message);
    }
  },
);

const roomSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [],
    activeRoom: null,
    activeUsers: [],
    loading: false,
    error: null,
    cursors: {},
  },
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    clearRoomError: (state) => {
      state.error = null;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    // FIXED: Moved inside the reducers object
    updateCursor: (state, action) => {
      const { user, position } = action.payload;
      // New object banao — re-render trigger hoga
      state.cursors = {
        ...state.cursors,
        [user.id]: {
          name: user.name,
          position,
          color: getUserColor(user.id),
        },
      };
    },
    // FIXED: Moved inside the reducers object
    clearCursors: (state) => {
      state.cursors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.activeRoom = action.payload;
      });
  },
});

export const {
  setActiveRoom,
  clearRoomError,
  setActiveUsers,
  updateCursor,
  clearCursors,
} = roomSlice.actions;

export default roomSlice.reducer;
