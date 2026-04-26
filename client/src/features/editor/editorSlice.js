import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const JUDGE0_URL = "https://ce.judge0.com";

const languageIds = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

export const runCode = createAsyncThunk(
  "editor/runCode",
  async ({ code, language }, { rejectWithValue }) => {
    try {
      const submitRes = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageIds[language],
        },
        {
          headers: {
            "content-type": "application/json", // ← sirf ye, baaki hata do
          },
        },
      );

      return submitRes.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    code: "// Start coding here...\nconsole.log('Hello DevCollab!');",
    language: "javascript",
    output: null,
    runLoading: false,
    error: null,
  },
  reducers: {
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.output = null;
    },
    clearOutput: (state) => {
      state.output = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runCode.pending, (state) => {
        state.runLoading = true;
        state.output = null;
        state.error = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.runLoading = false;
        state.output = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.runLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCode, setLanguage, clearOutput } = editorSlice.actions;
export default editorSlice.reducer;
