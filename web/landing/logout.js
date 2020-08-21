import React from "react";
import { useHistory } from "react-router-dom";
import { useApi } from "common/utils/api";

export function Logout() {
  const api = useApi();
  const history = useHistory();

  React.useEffect(() => {
    api.logout(false);
    history.push("/");
  }, []);

  return null;
}
