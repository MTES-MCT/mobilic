import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import React from "react";
import ReactDOM from "react-dom";

import "graphiql/graphiql.css";

const fetcher = createGraphiQLFetcher({
  url: "https://api.mobilic.beta.gouv.fr/graphql"
});

ReactDOM.render(<GraphiQL query={""} fetcher={fetcher} />, document.body);
