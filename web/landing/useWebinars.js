import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries/httpQueries";
import { captureSentryException } from "common/utils/sentry";
import React from "react";

export const useWebinars = (setCantDisplayWebinarsBecauseNoneOrError) => {
  const api = useApi();

  const [webinars, setWebinars] = React.useState([]);
  const [webinarsLoaded, setWebinarsLoaded] = React.useState(false);
  const [webinarsLoadError, setWebinarsLoadError] = React.useState(false);

  async function fetchWebinars() {
    try {
      const newWebinars = await api.jsonHttpQuery(
        HTTP_QUERIES.webinars,
        {},
        true
      );
      setWebinars(newWebinars);
      setWebinarsLoaded(true);
      setWebinarsLoadError(false);
    } catch (err) {
      setWebinarsLoadError(true);
      captureSentryException(err);
    }
  }

  React.useEffect(() => {
    if (webinars.length === 0 && !webinarsLoaded) {
      fetchWebinars();
    }
  }, []);

  React.useEffect(() => {
    if ((webinarsLoaded && webinars.length === 0) || webinarsLoadError) {
      setCantDisplayWebinarsBecauseNoneOrError(true);
    } else setCantDisplayWebinarsBecauseNoneOrError(false);
  }, [webinars, webinarsLoaded, webinarsLoadError]);

  return [webinars, webinarsLoaded];
};
