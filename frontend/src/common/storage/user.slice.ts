/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/user.type";

type UserState = {
  me?: User | null;
};

const initialState: UserState = {
  me: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setMe(state, action: PayloadAction<User>) {
      state.me = action.payload;
    },
    clearMe(state) {
      state.me = null;
    },
  },
});

export const { setMe, clearMe } = userSlice.actions;
export default userSlice.reducer;
