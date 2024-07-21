import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import modelReducer from "./model/reducers";
import dashboardReducer from "./dashboard/reducers";
import accountReducer from "./account/reducers";
import loginReducer from "./login/reducers";
import treeReducer from "./tree/reducers";
import jiraReducer from "./issues/reducers";

const middleware = (getDefaultMiddleware) => {
  let middlewares = getDefaultMiddleware();
  if (process.env.NODE_ENV !== "production") {
    middlewares = [...middlewares, logger];
  }
  return middlewares;
};

const store = configureStore({
  reducer: {
    model: modelReducer,
    dashboard: dashboardReducer,
    account: accountReducer,
    login: loginReducer,
    tree: treeReducer,
    jira: jiraReducer,

  },
  middleware,
});

export default store;
