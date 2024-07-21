import axios from "axios";
import {
  addAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  assignProject,
  getProjectsForAccount,
} from "./reducers";

const API = "/accounts";

export const addAccountAsync = (account) => async (dispatch) => {
  try {
    const resp = await axios.post(API, account);
    dispatch(addAccount(resp.data));
    dispatch(getAccountsAsync());
  } catch (err) {
    console.log(err);
  }
};

export const getAccountsAsync = () => async (dispatch) => {
  try {
    const resp = await axios.get(API);
    dispatch(getAccounts(resp.data));
    console.log(resp.data);
  } catch (err) {
    console.log(err);
  }
};

export const getAccountAsync = (id) => async (dispatch) => {
  try {
    const resp = await axios.get(`${API}/${id}`);
    dispatch(getAccount(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const updateAccountAsync = (id, account) => async (dispatch) => {
  try {
    const resp = await axios.put(`${API}/${id}`, account);
    dispatch(updateAccount(resp.data));
    dispatch(getAccountsAsync());
  } catch (err) {
    console.log(err);
  }
};

export const deleteAccountAsync = (id) => async (dispatch) => {
  try {
    const resp = await axios.delete(`${API}/${id}`);
    dispatch(deleteAccount(resp.data));
    dispatch(getAccountsAsync());
  } catch (err) {
    console.log(err);
  }
};

export const assignProjectAsync = (accountId, projectName) => async (dispatch) => {
  try {
    const resp = await axios.post(`${API}/${accountId}/assignProject`, { projectName });
    dispatch(assignProject(resp.data));
    dispatch(getProjectsForAccountAsync(accountId));
  } catch (err) {
    console.log(err);
  }
};

export const getProjectsForAccountAsync = (accountId) => async (dispatch) => {
  try {
    const resp = await axios.get(`${API}/${accountId}/projects`);
    dispatch(getProjectsForAccount(resp.data));
  } catch (err) {
    console.log(err);
  }
};
