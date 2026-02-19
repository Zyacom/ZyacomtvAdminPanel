import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideosState {
  videos: any[];
  loading: boolean;
  error: string | null;
}

const initialState: VideosState = {
  videos: [],
  loading: false,
  error: null,
};

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setVideos: (state, action: PayloadAction<any[]>) => {
      state.videos = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setVideos, setLoading, setError } = videosSlice.actions;
export default videosSlice.reducer;
