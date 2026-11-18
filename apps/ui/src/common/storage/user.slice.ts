/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/user.type";

interface UserState {
  me: User | null;
  sessionId?: string;
}

const initialState: UserState = {
  me: null,
  sessionId: undefined,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMe(state, action: PayloadAction<{ user: User; sessionId: string }>) {
      state.me = action.payload.user;
      state.sessionId = action.payload.sessionId;
    },
    clearMe(state) {
      state.me = null;
      state.sessionId = undefined;
    },
  },
});

export const { setMe, clearMe } = userSlice.actions;
export default userSlice.reducer;
