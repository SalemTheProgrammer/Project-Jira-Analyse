import axios from "axios";
import {
  parseEmails,
  getEmails,
  validateEmail,
  downloadFile,
} from "./reducers";

const API = "/dashboard";

export const parseEmailsAsync = () => async (dispatch) => {
  try {
    const resp = await axios.post(`${API}`);
    dispatch(parseEmails(resp.data));
    dispatch(getEmailsAsync());
  } catch (err) {
    console.log(err);
  }
};

export const getEmailsAsync = () => async (dispatch) => {
  try {
    const resp = await axios.get(`${API}`);
    dispatch(getEmails(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const validateEmailAsync = (id) => async (dispatch) => {
  try {
    const resp = await axios.put(`${API}/${id}`);
    dispatch(validateEmail(resp.data));
    dispatch(getEmailsAsync());
  } catch (err) {
    console.log(err);
  }
};

export const downloadFileAsync = (params) => async (dispatch) => {
  try {
    const resp = await axios.post(`${API}/download/`, params, { responseType: 'blob' });
    dispatch(downloadFile(resp.data));
    const blob = new Blob([resp.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = params.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.log(err);
  }
};

