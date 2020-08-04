import React from "react";
import ReactDOM from "react-dom";
import map from "lodash/map";
import "./playground.css";
import { Provider } from "react-redux";
import { Playground, store } from "graphql-playground-react";

const ENVS = {
  prod: {
    host: "https://api.mobilic.beta.gouv.fr",
    color: "#ff9947",
    label: "PRODUCTION"
  },
  sandbox: {
    host: "https://api.sandbox.mobilic.beta.gouv.fr",
    color: "#03bd5b",
    label: "BAC A SABLE"
  }
};

ReactDOM.render(<Playgrounds />, document.getElementById("root"));

function Playgrounds() {
  const [env, setEnv] = React.useState("sandbox");
  return [
    <div
      key={0}
      style={{
        display: "flex",
        height: "50",
        backgroundColor: ENVS[env].color,
        paddingRight: "8px",
        paddingLeft: "8px",
        justifyContent: "space-between"
      }}
    >
      <p
        style={{
          textTransform: "uppercase",
          color: "white",
          fontWeight: "bold"
        }}
      >
        {env === "prod" && "⚠️ "}environnement : {ENVS[env].label}
      </p>
      <div style={{ display: "flex", alignItems: "center" }}>
        {map(ENVS, (value, entry) => (
          <button
            style={{
              cursor: "pointer",
              paddingTop: "6px",
              paddingBottom: "6px",
              borderStyle: "solid",
              borderRadius: 4,
              color: env === entry && "white",
              backgroundColor: env === entry && "#003b80"
            }}
            key={entry}
            onClick={() => setEnv(entry)}
            disabled={env === entry}
          >
            {value.label}
          </button>
        ))}
      </div>
    </div>,
    <Provider key={1} store={store}>
      <Playground endpoint={ENVS[env].host + "/graphql"} />
    </Provider>
  ];
}
