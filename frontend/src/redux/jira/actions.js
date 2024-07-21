import axios from "axios";
import { setTickets, setNotification } from "./reducers";

const API = "http://localhost:5000/api";

export const downloadJiraTicketsAsync = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/download_jira_tickets`, data);
    dispatch(setTickets({ data: response.data.issues, notif: { type: "success", msg: response.data.message } }));
    return response.data;
  } catch (err) {
    const errorMsg = err.response ? err.response.data.message : "Failed to download JIRA tickets";
    dispatch(setNotification({ notif: { type: "error", msg: errorMsg } }));
    return { error: errorMsg };
  }
};

export const uploadJiraTicketsAsync = (data) => async (dispatch) => {
  try {
    const response = await axios.post(`${API}/bulk`, data);
    dispatch(setNotification({ notif: response.data.notif }));
    return response.data;
  } catch (err) {
    const errorMsg = err.response ? err.response.data.notif.msg : "Failed to upload JIRA tickets";
    dispatch(setNotification({ notif: { type: "error", msg: errorMsg } }));
    return { notif: { type: "error", msg: errorMsg } };
  }
};
