import axios from "axios";
import { login, logout } from "./reducers";

const API = "/login";

export const loginAsync = (credentials) => async (dispatch) => {
  try {
    const resp = await axios.post(`${API}`, credentials);
    const token = resp.data.token;
    const role = resp.data.role;
    console.log(resp.data);
    localStorage.setItem('role', 1);
    localStorage.setItem('authToken', 333);
    dispatch(login(resp.data));
  } catch (err) {
    console.log(err);
  }
};

export const logoutAsync = () => async (dispatch) => {
  try {
    localStorage.removeItem('authToken');
    dispatch(logout());
  } catch (err) {
    console.log(err);
  }
};
