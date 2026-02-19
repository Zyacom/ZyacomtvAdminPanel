import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usersReducer from "./slices/usersSlice";
import videosReducer from "./slices/videosSlice";
import channelsReducer from "./slices/channelsSlice";
import playlistsReducer from "./slices/playlistsSlice";
import rolesReducer from "./slices/rolesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    videos: videosReducer,
    channels: channelsReducer,
    playlists: playlistsReducer,
    roles: rolesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
