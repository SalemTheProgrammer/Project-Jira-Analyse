import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access: {},
  notif: {},
};

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    login(state, action) {
      state.access = action.payload.data;
      state.notif = action.payload.notif;
    },
    logout(state) {
      state.access = {};
      state.notif = {};
    },
    loginFromStorage(state, action) {
      state.access = action.payload.access;
      state.notif = action.payload.notif;
    },
  },
});

export const { login, logout, loginFromStorage } = loginSlice.actions;

export default loginSlice.reducer;
