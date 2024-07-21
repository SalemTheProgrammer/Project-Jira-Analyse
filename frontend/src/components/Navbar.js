import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { logoutAsync } from "../redux/login/actions";
import logoImageSM from "../assets/img/logoVermeg.png";

function Navmenu({ routes }) {
  const location = useLocation();
  const history = useHistory();

  const { access } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!access?.token) {
      return history.push("/login");
    }
  }, [access, history]);

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "VERMail";
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light">
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center ml-2 ml-md-0">
          
          
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
             
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <div className="m-3">
                <img
                  src={logoImageSM}
                  className="img-fluid"
                  style={{ width: "130px" }}
                  alt="..."
                />
              </div>
            </li>
          </ul>

          <ul className="navbar-nav ml-auto">
            
            <li className="nav-item">
  <a className="nav-link m-0 text-danger d-flex align-items-center" href="#" onClick={handleLogout}>
    <i className="fas fa-sign-out-alt mr-2"></i>
    <span className="no-icon">Log out</span>
  </a>
</li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navmenu;
