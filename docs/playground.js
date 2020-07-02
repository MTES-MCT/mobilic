import React from "react";
import ReactDOM from "react-dom";
import "./playground.css";
import { Provider } from "react-redux";
import { Playground, store } from "graphql-playground-react";

const API_HOST = process.env.REACT_APP_API_HOST || "/api";

ReactDOM.render(
  <Provider store={store}>
    <Playground endpoint={API_HOST + "/graphql"} />
  </Provider>,
  document.getElementById("root")
);
