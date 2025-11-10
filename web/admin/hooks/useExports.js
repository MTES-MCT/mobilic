import React, { useEffect, useRef, useState } from "react";
import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useSilentDownload } from "../../common/hooks/useSilentDownload";

export function useExports() {
  const api = useApi();

  const intervalRef = useRef(null);
  const [nbExports, setNbExports] = useState(0);
  const { silentDownload } = useSilentDownload();

  const updateExports = async () => {
    let res;
    try {
      res = await api.jsonHttpQuery(HTTP_QUERIES.checkOutExports);
    } catch (err) {
      console.error(err);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    setNbExports(res?.nb_wip_exports || 0);

    for (const dlUrl of res.ready_exports_links) {
      silentDownload(dlUrl);
    }
  };

  const addExport = async () => {
    await updateExports();
  };

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
  }, [nbExports]);

  const cancelExports = async () => {
    const res = await api.jsonHttpQuery(HTTP_QUERIES.cancelExports);
    if (res?.result === "ok") {
      setNbExports(0);
    }
  };

  return {
    updateExports,
    addExport,
    nbExports,
    cancelExports
  };
}
