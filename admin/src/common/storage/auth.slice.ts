import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  bootstrapped: boolean;
  bootstrapping: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  bootstrapped: false,
  bootstrapping: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startBootstrap(state) {
      state.bootstrapping = true;
      state.bootstrapped = false;
    },
    loginSuccess(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    },
    finishBootstrap(state) {
      state.bootstrapped = true;
      state.bootstrapping = false;
    },
  },
});

export const { startBootstrap, loginSuccess, logout, finishBootstrap } =
  authSlice.actions;
export default authSlice.reducer;
