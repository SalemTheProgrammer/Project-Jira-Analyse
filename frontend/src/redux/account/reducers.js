import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accounts: [],
  account: {},
  projects: [],
  notif: {},
  error: {},
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    addAccount(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    getAccounts(state, action) {
      state.accounts = action.payload.data;
    },
    getAccount(state, action) {
      state.account = action.payload.data;
      state.notif = action.payload.notif;
    },
    updateAccount(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    deleteAccount(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    assignProject(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    getProjectsForAccount(state, action) {
      state.projects = action.payload.projects;
      state.notif = action.payload.notif;
    },
  },
});

export const {
  addAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  assignProject,
  getProjectsForAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
