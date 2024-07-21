import Dataset from "../views/Configuration.js";
import UserProject from "../views/UserProjects.js";

const layout = "/tech-admin";

const techAdminRoutes = [
  {
    path: "/users",
    name: "Manage Projects", 
    icon: "nc-icon nc-grid-45",
    component: UserProject,
    layout: layout,
  },
];

export default techAdminRoutes;
