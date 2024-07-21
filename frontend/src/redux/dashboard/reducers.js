import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  emails: [],
  notif: {},
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    parseEmails(state, action) {
      state.notif = action.payload.notif;
    },
    getEmails(state, action) {
      state.emails = action.payload.data;
      state.notif = action.payload.notif;
    },
    validateEmail(state, action) {
      state.notif = action.payload.notif;
    },
    downloadFile(state, action) {
      state.notif = action.payload.notif;
    },
  },
});

export const { parseEmails, getEmails, validateEmail, downloadFile } = dashboardSlice.actions;

export default dashboardSlice.reducer;
