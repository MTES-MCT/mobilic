import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";

export function Logout() {
  const api = useApi();
  const history = useHistory();
  const location = useLocation();

  async function _logout() {
    const queryString = new URLSearchParams(location.search);
    const next = queryString.get("next");
    await api.logout(
      "/logout" + (next ? `?next=${encodeURIComponent(next)}` : "")
    );
    history.push(next ? decodeURI(next) : "/");
  }

  React.useEffect(() => {
    _logout();
  }, []);

  return null;
}
