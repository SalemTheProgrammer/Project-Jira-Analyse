import Tree from "../views/Tree.js";
import Configuration from "../views/Configuration.js";
import Model from "../views/Model.js";
import JiraTickets from "../views/JiraTickets.js";

const layout = "/busi-admin";

const busiAdminRoutes = [
  {
    path: "/tree",
    name: "Trees",
    icon: "nc-icon nc-tag-content",
    component: Tree,
    layout: layout,
  },
  {
    path: "/issues",
    name: "issues",
    icon: "nc-icon nc-bullet-list-67",
    component: JiraTickets,
    layout: layout,
  },
  {
    path: "/configuration",
    name: "Configuration Jira",
    icon: "nc-icon nc-grid-45",
    component: Configuration,
    layout: layout,
  },
  {
    path: "/model",
    name: "Model",
    icon: "nc-icon nc-layers-3",
    component: Model,
    layout: layout,
  },
];

export default busiAdminRoutes;
