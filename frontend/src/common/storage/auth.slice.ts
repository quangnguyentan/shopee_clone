import { createSlice } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  bootstrapped: boolean;
  loggedOut: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  bootstrapped: false,
  loggedOut: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state) {
      state.isAuthenticated = true;
      state.loggedOut = false;
      state.bootstrapped = true;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.bootstrapped = true;
      state.loggedOut = true;
    },
    finishBootstrap(state) {
      state.bootstrapped = true;
    },
  },
});

export const { loginSuccess, logout, finishBootstrap } = authSlice.actions;
export default authSlice.reducer;
