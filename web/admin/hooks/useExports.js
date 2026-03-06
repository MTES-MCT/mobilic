import React, { useEffect, useRef, useState, useCallback } from "react";
import { useApi } from "common/utils/api";
import { useSilentDownload } from "../../common/hooks/useSilentDownload";
import { HTTP_QUERIES } from "common/utils/apiQueries/httpQueries";

export function useExports() {
  const api = useApi();

  const intervalRef = useRef(null);
  const [nbExports, setNbExports] = useState(0);
  const { silentDownload } = useSilentDownload();

  const updateExports = useCallback(async () => {
    let res;
    try {
      res = await api.jsonHttpQuery(HTTP_QUERIES.checkOutExports);
    } catch (err) {
      console.error(err);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setNbExports(res?.nb_wip_exports || 0);

    for (const dlUrl of res.ready_exports_links) {
      silentDownload(dlUrl);
    }
  }, [api, silentDownload]);

  const addExport = useCallback(async () => {
    setTimeout(async () => {
      await updateExports();
    }, 1000);
  }, [updateExports]);

  useEffect(() => {
    if (nbExports === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (nbExports > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        updateExports();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [nbExports, updateExports]);

  const cancelExports = useCallback(async () => {
    const res = await api.jsonHttpQuery(HTTP_QUERIES.cancelExports);
    if (res?.result === "ok") {
      setNbExports(0);
    }
  }, [api]);

  return {
    updateExports,
    addExport,
    nbExports,
    cancelExports
  };
}
