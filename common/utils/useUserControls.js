import { useApi } from "../utils/api";
import React from "react";
import { USER_CONTROLS_QUERY } from "./apiQueries/user";

export const useUserControls = (userId) => {
  const api = useApi();
  const [userControls, setUserControls] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const loadUserControls = React.useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.graphQlQuery(USER_CONTROLS_QUERY, {
        userId: userId
      });

      setUserControls(response.data?.user?.userControls || []);
    } catch (err) {
      setError(err);
      console.error("Erreur lors du chargement des contrôles:", err);
    } finally {
      setLoading(false);
    }
  }, [api, userId]);

  React.useEffect(() => {
    loadUserControls();
  }, [loadUserControls]);

  return {
    userControls,
    loading,
    error,
    refetch: loadUserControls
  };
};
