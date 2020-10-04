import React from "react";
import { useHistory } from "react-router-dom";
import { useApi } from "common/utils/api";

export function Logout() {
  const api = useApi();
  const history = useHistory();

  async function _logout() {
    await api.logout();
    history.push("/");
  }

  React.useEffect(() => {
    _logout();
  }, []);

  return null;
}
