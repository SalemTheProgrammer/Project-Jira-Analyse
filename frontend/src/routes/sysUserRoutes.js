import Dashboard from "../views/Dashboard.js";
import Charts from "../views/Charts.js";

const layout = "/sys-user";

const sysUserRoutes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: layout,
  },
  {
    path: "/charts",
    name: "Charts",
    icon: "nc-icon nc-chart-bar-32", 
    component: Charts,
    layout: layout,
  },
];

export default sysUserRoutes;
