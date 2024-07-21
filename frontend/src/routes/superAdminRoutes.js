import Accounts from "../views/Accounts.js";

const layout = "/super-admin";

const superAdminRoutes = [
  {
    path: "/accounts",
    name: "Accounts",
    icon: "nc-icon nc-email-83",
    component: Accounts,
    layout: layout,
  },
];

export default superAdminRoutes;
