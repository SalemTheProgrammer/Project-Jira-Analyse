import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addAccountAsync,
  getAccountsAsync,
  getAccountAsync,
  updateAccountAsync,
  deleteAccountAsync,
} from "../redux/account/actions";
import NotificationAlert from "react-notification-alert";
import { Modal, Button } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaDatabase, FaEdit, FaTrash } from "react-icons/fa";
import "../style/Account.css";

const initialState = {
  username: "",
  password: "",
  role: "",
};

function Accounts() {
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [state, setState] = useState(initialState);
  const [editMode, setEditMode] = useState(false);
  const [accountId, setAccountId] = useState(null);

  const notificationAlertRef = useRef(null);
  const notify = (notif, place) => {
    var options = {
      message: <div dangerouslySetInnerHTML={{ __html: notif.msg }}></div>,
      type: notif.type,
      place: place,
      icon: "nc-icon nc-bell-55",
      autoDismiss: 5,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const { accounts, account, notif, error } = useSelector(
    (state) => state.account
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAccountsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (account) {
      setState({ ...account, password: "" });
    }
  }, [account]);

  useEffect(() => {
    setState(initialState);
  }, [location.pathname]);

  useEffect(() => {
    if (notif?.msg) {
      notify(notif, "tr");
    }
  }, [notif]);

  useEffect(() => {
    if (notif?.type === "success" || notif?.type === "warning") {
      setState(initialState);
      setAccountId(null);
      setEditMode(false);
      setShowPassword(false);
      setShowModal(false);
      setShowDeleteModal(false);
    }
  }, [notif]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!state.username || (!editMode && !state.password) || !state.role) {
      notify({ type: "danger", msg: "Please fill all required fields" }, "tr");
    } else {
      if (editMode && accountId) {
        const accountDataChanged =
          state.username !== account.username ||
          state.password !== account.password ||
          state.role !== account.role;
        if (accountDataChanged) {
          dispatch(updateAccountAsync(accountId, state));
        } else {
          notify(
            { type: "warning", msg: "No changes were made to the account" },
            "tr"
          );
        }
      } else {
        dispatch(addAccountAsync(state));
      }
    }
  };

  const handleUpdate = (id) => {
    dispatch(getAccountAsync(id));
    setAccountId(id);
    setEditMode(true);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteAccountAsync(id));
    setShowDeleteModal(false);
  };

  const handleCheckboxChange = (item) => {
    const updatedState = { ...item, state: !item.state };
    dispatch(updateAccountAsync(item._id, updatedState));
  };

  const openAddModal = () => {
    setState(initialState);
    setEditMode(false);
    setShowModal(true);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">Manage Accounts</h4>
              <button className="btn btn-primary" onClick={openAddModal}>
                <FaDatabase className="mr-2" /> Add Account
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover table-bordered">
                  <thead className="thead-light">
                    <tr>
                      <th>A/D</th>
                      <th>Username</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="form-check my-auto p-0">
                            <label className="form-check-label">
                              <input
                                name="state"
                                type="checkbox"
                                className="form-check-input"
                                checked={item.state}
                                onChange={() => handleCheckboxChange(item)}
                              />
                              <span className="form-check-sign"></span>
                            </label>
                          </div>
                        </td>
                        <td>{item.username}</td>
                        <td>
                          <div className="btn-group">
                            <button
                              className="btn btn-secondary mr-1"
                              onClick={() => handleUpdate(item._id)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                setAccountId(item._id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationAlert ref={notificationAlertRef} />
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Account" : "Add Account"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usernameInput" className="form-label">
                Username
              </label>
              <input
                id="usernameInput"
                name="username"
                type="text"
                className={
                  "form-control" +
                  (error?.field === "username" ? " is-invalid" : "")
                }
                placeholder="med_khalil_zrelly"
                value={state.username}
                onChange={handleChange}
              />
              {error?.field === "username" && (
                <div className="invalid-feedback">{error.msg}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="passwordInput" className="form-label">
                Password
              </label>
              <div className="input-group">
                <input
                  id="passwordInput"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={
                    "form-control" +
                    (error?.field === "password" ? " is-invalid" : "")
                  }
                  placeholder={editMode ? "Enter new password" : "x$%d-y&#w_k\""}
                  value={state.password}
                  onChange={handleChange}
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {error?.field === "password" && (
                  <div className="invalid-feedback">{error.msg}</div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="roleInput" className="form-label">
                Role
              </label>
              <select
                id="roleInput"
                name="role"
                className="form-control custom-select"
                value={state.role}
                onChange={handleChange}
              >
                <option value="">Assign Role</option>
                <option value="Technical Admin">Technical Admin</option>
                <option value="Business Admin">Business Admin</option>
                <option value="System User">System User</option>
              </select>
            </div>
            <Button type="submit" className="btn btn-primary btn-block">
              {editMode ? (
                <FaEdit className="mr-2" />
              ) : (
                <FaDatabase className="mr-2" />
              )}
              {editMode ? "Update" : "Add"} Account
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this account?</p>
          <Button variant="danger" onClick={() => handleDelete(accountId)}>
            Yes, Delete
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Accounts;
