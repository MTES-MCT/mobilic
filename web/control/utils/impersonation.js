import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

export function useImpersonation(token) {
  const store = useStoreSyncedWithLocalStorage();
  const [impersonating, setImpersonating] = React.useState(false);

  React.useEffect(() => {
    if (token && !impersonating) {
      store.setState(
        state => ({
          impersonationTokenStack: [
            token,
            ...(state.impersonationTokenStack || [])
          ]
        }),
        () => setImpersonating(true)
      );
      return () => {
        store.setState(
          state => ({
            impersonationTokenStack: (
              state.impersonationTokenStack || []
            ).slice(1)
          }),
          () => setImpersonating(false)
        );
      };
    }
  }, [token]);

  return impersonating;
}
