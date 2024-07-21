import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickets: [],
  notif: {},
};

const jiraSlice = createSlice({
  name: "jira",
  initialState,
  reducers: {
    setTickets(state, action) {
      state.tickets = action.payload.data;
      state.notif = action.payload.notif;
    },
    clearTickets(state) {
      state.tickets = [];
      state.notif = {};
    },
    setNotification(state, action) {
      state.notif = action.payload.notif;
    },
  },
});

export const { setTickets, clearTickets, setNotification } = jiraSlice.actions;

export default jiraSlice.reducer;
