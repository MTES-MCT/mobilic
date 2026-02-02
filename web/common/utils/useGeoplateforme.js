import { useState, useEffect } from "react";
import {
  isInputSearchable,
  fetchGeoplateforme
} from "./geoplateforme";
export function useGeoplateforme({
  endpoint,
  inputValue,
  params = {},
  resultMapper = (json) => json,
  enabled = true,
  dependencies = []
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !isInputSearchable(inputValue)) {
      setOptions([]);
      return;
    }

    setLoading(true);
    let isCancelled = false;

    const queryArgs = new URLSearchParams();
    
    if (endpoint === "completion") {
      queryArgs.append("text", inputValue);
    } else if (endpoint === "search") {
      queryArgs.append("q", inputValue);
    }
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryArgs.append(key, value);
      }
    });

    fetchGeoplateforme(
      endpoint,
      queryArgs,
      (results) => {
        if (!isCancelled) {
          setOptions(results);
          setLoading(false);
        }
      },
      resultMapper
    );

    return () => {
      isCancelled = true;
    };
  }, [endpoint, inputValue, enabled, ...dependencies]);

  return { options, loading };
}

export function useGeoplateforme_Reverse({
  position,
  resultMapper = (json) => json.features || [],
  enabled = true
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !position || !position.coords) {
      setOptions([]);
      return;
    }

    setLoading(true);

    const queryArgs = new URLSearchParams({
      lat: position.coords.latitude,
      lon: position.coords.longitude
    });

    fetchGeoplateforme(
      "reverse",
      queryArgs,
      (results) => {
        setOptions(resultMapper(results));
        setLoading(false);
      },
      resultMapper
    );
  }, [position, enabled]);

  return { options, loading };
}
