import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import sidebarImage from "../assets/img/sidebar.jpg";
import logoImage from "../assets/img/logoVermeg.jpeg";

function Sidebar({ routes }) {
  const location = useLocation();
  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  return (
    <div className="sidebar" data-image={sidebarImage} data-color={"dark-gray"}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: "url(" + sidebarImage + ")",
        }}
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex justify-content-center align-items-center">
          <div className="w-50 mb-1 pt-2 pb-2">
            <a href="http://www.vermeg.com" target="_blank">
              <img src={logoImage} className="img-fluid" alt="..." />
            </a>
          </div>
        </div>
        <ul className="nav">
          {routes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={"nav-item " + activeRoute(prop.layout + prop.path)}
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                  >
                    <i className={prop.icon} />
                    <span className="pl-2">{prop.name}</span>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
