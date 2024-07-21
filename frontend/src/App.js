import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Sidebar from "./components/Sidebar.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import Login from "./components/Login";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import techAdminRoutes from "./routes/techAdminRoutes.js";
import busiAdminRoutes from "./routes/busiAdminRoutes.js";
import sysUserRoutes from "./routes/sysUserRoutes.js";
import { loginFromStorage } from "./redux/login/reducers";

function App() {
  const mainPanel = useRef(null);
  const dispatch = useDispatch();
  const { access } = useSelector((state) => state.login);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanel.current) {
      mainPanel.current.scrollTop = 0;
    }
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }

    // Check for token in localStorage
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    const notif = JSON.parse(localStorage.getItem('notif'));
    if (token && role && notif) {
      dispatch(loginFromStorage({ access: { token, role }, notif }));
    }
  }, [dispatch]);

  const generateMainPanelContent = (routes) => (
    <div className="wrapper">
      <Sidebar routes={routes} />
      <div className="main-panel" ref={mainPanel}>
        <Navbar routes={routes} />
        <div className="content">
          <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.layout + route.path}
                exact={route.exact}
                component={route.component}
              />
            ))}
          </Switch>
        </div>
        <Footer />
      </div>
    </div>
  );

  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/super-admin">
          {() =>
            access?.token && access?.role === "0" ? (
              generateMainPanelContent(superAdminRoutes)
            ) : (
              <Redirect to="/login" />
            )
          }
        </Route>
        <Route path="/tech-admin">
          {() =>
            access?.token && access?.role === "1" ? (
              generateMainPanelContent(techAdminRoutes)
            ) : (
              <Redirect to="/login" />
            )
          }
        </Route>
        <Route path="/busi-admin">
          {() =>
            access?.token && access?.role === "2" ? (
              generateMainPanelContent(busiAdminRoutes)
            ) : (
              <Redirect to="/login" />
            )
          }
        </Route>
        <Route path="/sys-user">
          {() =>
            access?.token && access?.role === "3" ? (
              generateMainPanelContent(sysUserRoutes)
            ) : (
              <Redirect to="/login" />
            )
          }
        </Route>
        <Redirect from="/" to="/login" />
      </Switch>
    </Router>
  );
}

export default App;
