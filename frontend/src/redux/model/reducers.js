import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  metadata: {},
  metrics: [],
  notif: {},
};

const modelSlice = createSlice({
  name: "model",
  initialState,
  reducers: {
    getDataset(state, action) {
      state.metadata = action.payload.data;
      state.notif = action.payload.notif;
    },
    dropDataset(state, action) {
      state.notif = action.payload.notif;
    },
    trainModel(state, action) {
      state.metrics = action.payload.data;
      state.notif = action.payload.notif;
    },
    getMetrics(state, action) {
      state.metrics = action.payload.data;
      state.notif = action.payload.notif;
    },
    resetModel(state, action) {
      state.notif = action.payload.notif;
    },
  },
});

export const { getDataset, trainModel, resetModel, getMetrics, dropDataset } =
  modelSlice.actions;

export default modelSlice.reducer;
