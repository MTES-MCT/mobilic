/**
 * Géoplateforme API configuration and utilities
 * https://geoplateforme.fr/
 */

import throttle from "lodash/throttle";
import { captureSentryException } from "common/utils/sentry";

export const GEOPLATEFORME_API_BASE_URL = "https://data.geopf.fr/geocodage";

export const GEOPLATEFORME_MIN_SEARCHABLE_CHARACTER = 3;

export const GEOPLATEFORME_THROTTLE_MS = 200;

export const GEOPLATEFORME_MAX_RESPONSES = "15";

/**
 * Check if input is long enough to trigger a search
 */
export const isInputSearchable = (input) =>
  input?.trim()?.length >= GEOPLATEFORME_MIN_SEARCHABLE_CHARACTER;

/**
 * Generic fetch function for Géoplateforme API
 * @param {string} endpoint - API endpoint (e.g., "search", "completion", "reverse")
 * @param {URLSearchParams} queryArgs - Query parameters
 * @param {function} callback - Callback function to receive results
 * @param {function} [resultExtractor] - Optional function to extract results from response
 */
export const fetchGeoplateforme = throttle(
  (endpoint, queryArgs, callback, resultExtractor = (json) => json) => {
    const url = `${GEOPLATEFORME_API_BASE_URL}/${endpoint}/?${queryArgs.toString()}`;

    fetch(url)
      .then(
        (response) => response.json(),
        (err) => {
          captureSentryException(err);
          return null;
        }
      )
      .then((json) => {
        if (json) {
          callback(resultExtractor(json));
        } else {
          callback([]);
        }
      });
  },
  GEOPLATEFORME_THROTTLE_MS
);

