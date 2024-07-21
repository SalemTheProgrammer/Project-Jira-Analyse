import axios from "axios";
import { setTree, addNode, updateNode, deleteNode } from "./reducers";

const API = "/tree";

const ensureRootNode = (tree) => {
  if (!tree || tree.name !== "Root") {
    return {
      id: 1,
      name: "Root",
      children: tree ? [tree] : [],
    };
  }
  return tree;
};

export const getTreeAsync = () => async (dispatch) => {
  try {
    const response = await axios.get(API);
    const tree = ensureRootNode(response.data.data);
    dispatch(setTree(tree));
  } catch (err) {
    console.error(err);
  }
};

export const saveTree = (tree) => async (dispatch) => {
  try {
    const ensuredTree = ensureRootNode(tree);
    await axios.post(API, ensuredTree);
    dispatch(setTree(ensuredTree));
  } catch (err) {
    console.error(err);
  }
};

export const addNodeAsync = (node) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/node`, node);
    dispatch(addNode(response.data));
    dispatch(getTreeAsync());
  } catch (err) {
    console.error(err);
  }
};

export const updateNodeAsync = (nodeId, updatedNode) => async (dispatch) => {
  try {
    const response = await axios.put(`${API}/node/${nodeId}`, updatedNode);
    dispatch(updateNode(response.data));
    dispatch(getTreeAsync());
  } catch (err) {
    console.error(err);
  }
};

export const deleteNodeAsync = (nodeId) => async (dispatch) => {
  try {
    const response = await axios.delete(`${API}/node/${nodeId}`);
    dispatch(deleteNode(response.data));
    dispatch(getTreeAsync());
  } catch (err) {
    console.error(err);
  }
};
