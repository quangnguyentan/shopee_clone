import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  bootstrapped: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state) {
      state.isAuthenticated = true;
      state.bootstrapped = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.bootstrapped = true;
    },
    finishBootstrap(state) {
      state.bootstrapped = true;
    },
  },
});

export const { loginSuccess, logout, finishBootstrap } = authSlice.actions;
export default authSlice.reducer;
