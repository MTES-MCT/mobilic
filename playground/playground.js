import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import React from "react";
import { createRoot } from "react-dom/client";
import map from "lodash/map";

import "graphiql/style.css";
import "./playground.css";

// Configure Monaco Editor environment for workers
// This is required for GraphiQL v5 which uses Monaco internally
window.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    // Disable workers as a workaround for webpack loading issues
    // Monaco will fall back to running in the main thread
    return "data:text/javascript;charset=utf-8," + encodeURIComponent(`
      self.MonacoEnvironment = {
        baseUrl: '${window.location.origin}'
      };
    `);
  }
};

const ENVS = {
  prod: {
    host: "https://api.mobilic.beta.gouv.fr/",
    color: "#ff9947",
    label: "PRODUCTION"
  },
  sandbox: {
    host: "https://api.sandbox.mobilic.beta.gouv.fr/",
    color: "#03bd5b",
    label: "BAC A SABLE"
  }
};

const ENDPOINT = {
  graphql: {
    label: "graphql"
  },
  protected: {
    label: "protected"
  }
};

const fetcher = host =>
  createGraphiQLFetcher({
    url: host
  });

function Playgrounds() {
  const [env, setEnv] = React.useState("sandbox");
  const [endpoint, setEndpoint] = React.useState("graphql");
  return (
    <>
      <div
        style={{
          display: "flex",
          height: "50px",
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
                minWidth: "120px",
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
      </div>
      <div
        style={{
          display: "flex",
          height: "50px",
          backgroundColor: ENVS[env].color,
          paddingRight: "8px",
          paddingLeft: "8px",
          justifyContent: "space-between"
        }}
      >
        <p
          style={{
            color: "white",
            fontWeight: "bold"
          }}
        >
          ENDPOINT : {ENVS[env].host + ENDPOINT[endpoint].label}
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          {map(ENDPOINT, (value, entry) => (
            <button
              style={{
                cursor: "pointer",
                minWidth: "120px",
                paddingTop: "6px",
                paddingBottom: "6px",
                borderStyle: "solid",
                backgroundColor: endpoint === entry && "#003b80"
              }}
              key={entry}
              onClick={() => setEndpoint(entry)}
              disabled={endpoint === entry}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GraphiQL
          query={""}
          fetcher={fetcher(ENVS[env].host + ENDPOINT[endpoint].label)}
          plugins={[]}
          visiblePlugin={null}
        />
      </div>
    </>
  );
}

const container = document.getElementById("playground-root");
const root = createRoot(container);
root.render(<Playgrounds />);
