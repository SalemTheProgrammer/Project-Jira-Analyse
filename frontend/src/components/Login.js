import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { loginAsync } from "../redux/login/actions";
import NotificationAlert from "react-notification-alert";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logoImage from "../assets/img/logoVermeg.png";
import backgroundImage from "../assets/img/backgroundImage.jpg";

const initialState = {
  username: "",
  password: "",
};

function Login() {
  const history = useHistory();

  const [state, setState] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

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

  const { notif, access } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notif?.msg) {
      notify(notif, "tr");
    }
  }, [notif]);

  useEffect(() => {
    if (access?.token) {
      switch (access.role) {
        case "0":
          return history.push("/super-admin/accounts");
        case "1":
          return history.push("/tech-admin/mailboxes");
        case "2":
          return history.push("/busi-admin/tree");
        case "3":
          return history.push("/sys-user/dashboard");
      }
    }
  }, [access, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!state.username || !state.password) {
      notify({ type: "danger", msg: "Please fill all required fields" }, "tr");
    } else {
      dispatch(loginAsync(state));
    }
  };

  return (
    <div
    className="container-fluid"
    style={{
      height: "100vh",
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      animation: "fadeIn 1s ease-in-out forwards",
    }}
  >
    <div
      className="row p-2 d-flex align-items-center justify-content-center"
      style={{ height: "100vh", backgroundColor: "transparent" }}
    >
      <div className="col-xl-4 col-md-6 col-sm-9 col-12">
        <div className="card border-0 rounded-lg shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
          <div className="card-header bg-transparent border-0 text-center">
            <h4 className="card-title w-100 text-center">
              <img src={logoImage} className="img-fluid p-2 w-50" alt="Logo" />
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="usernameInput" className="form-label text-dark">
                  Username
                </label>
                <input
                  id="usernameInput"
                  name="username"
                  type="text"
                  className={
                    "form-control border-0 rounded-pill shadow-sm" + (notif?.msg ? " is-invalid" : "")
                  }
                  placeholder="Shaima"
                  value={state.username}
                  onChange={handleChange}
                />
                {notif?.msg && (
                  <div className="invalid-feedback">
                    {notif.msg.split(": ")[1]}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="passwordInput" className="form-label text-dark">
                  Password
                </label>
                <div className="input-group">
                  <input
                    id="passwordInput"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={
                      "form-control border-0 rounded-pill shadow-sm" + (notif?.msg ? " is-invalid" : "")
                    }
                    placeholder="*******************"
                    value={state.password}
                    onChange={handleChange}
                  />
                  <div className="input-group-append">
                    <span
                      className="input-group-text border-0 rounded-pill shadow-sm"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", backgroundColor: "transparent" }}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {notif?.msg && (
                    <div className="invalid-feedback">
                      {notif.msg.split(": ")[1]}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="col-md-12 btn btn-primary btn-fill my-1 d-flex justify-content-center align-items-center rounded-pill shadow-sm"
                type="submit"
                style={{ transition: "background-color 0.3s" }}
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </button>
              <div className="clearfix"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div className="rna-container">
      <NotificationAlert ref={notificationAlertRef} />
    </div>
  </div>
  
  );
}

export default Login;
