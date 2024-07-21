import axios from "axios";
import {
  getDataset,
  trainModel,
  resetModel,
  getMetrics,
  dropDataset,
} from "./reducers";

const API = "/model";

export const getDatasetAsync = () => async (dispatch) => {
  try {
    const resp = await axios.get(`${API}/dataset`);
    dispatch(getDataset(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const dropDatasetAsync = () => async (dispatch) => {
  try {
    const resp = await axios.delete(`${API}/dataset`);
    dispatch(dropDataset(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const trainModelAsync = (Params) => async (dispatch) => {
  try {
    const resp = await axios.post(`${API}`, Params);
    dispatch(trainModel(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const getMetricsAsync = () => async (dispatch) => {
  try {
    const resp = await axios.get(`${API}`);
    dispatch(getMetrics(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const resetModelAsync = () => async (dispatch) => {
  try {
    const resp = await axios.delete(`${API}`);
    dispatch(resetModel(resp.data));
  } catch (err) {
    console.log(err);
  }
};
