function urlWithQueryString(url, queryParams) {
  if (!queryParams || queryParams.length === 0) {
    return url;
  }
  const queryString = Object.keys(queryParams)
    .map(key => {
      const encodedKey = encodeURIComponent(key);
      const value = queryParams[key];
      if (Array.isArray(value)) {
        return value
          .map(v => `${encodedKey}=${encodeURIComponent(v)}`)
          .join("&");
      } else if (value === null || value === undefined) {
        return `${encodedKey}=`;
      } else {
        return `${encodedKey}=${encodeURIComponent(value)}`;
      }
    })
    .join("&");
  return url + "?" + queryString;
}

export function share(text, title, mailto = "") {
  if (navigator.share) {
    return navigator.share({ text, title });
  } else {
    window.open(
      urlWithQueryString(`mailto:${mailto}`, {
        subject: title,
        body: `Bonjour,\n\nVoici mon relevé de temps de travail : \n\n${text}`
      }),
      "_parent"
    );
  }
}
