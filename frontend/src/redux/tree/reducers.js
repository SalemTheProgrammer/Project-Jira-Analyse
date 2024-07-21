import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  tree: { id: 1, name: "Root", children: [] },
  notif: {},
  error: {},
};

const treeSlice = createSlice({
  name: "tree",
  initialState,
  reducers: {
    setTree(state, action) {
      state.tree = action.payload;
    },
    addNode(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    updateNode(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
    deleteNode(state, action) {
      state.notif = action.payload.notif;
      state.error = action.payload.error;
    },
  },
});

export const { setTree, addNode, updateNode, deleteNode } = treeSlice.actions;

export default treeSlice.reducer;
