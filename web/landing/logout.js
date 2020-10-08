import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";

export function Logout() {
  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();

  async function _logout() {
    const queryString = new URLSearchParams(location.search);
    const next = queryString.get("next");
    await api.logout(
      "/logout" + (next ? `?next=${encodeURIComponent(next)}` : "")
    );
    history.push(next ? decodeURI(next) : "/");
  }

  React.useEffect(() => {
    withLoadingScreen(_logout);
  }, []);

  return null;
}
