export function isGraphQLParsingError(error) {
  return error.networkError && error.networkError.statusCode === 400;
}

export function isConnectionError(error) {
  return error.networkError && !error.networkError.statusCode;
}

export function formatGraphQLError(error) {
  if (isConnectionError(error)) {
    return "Veuillez vérifier que vous êtes connecté à Internet avant de réessayer";
  } else {
    return "Une erreur est survenue. Veuillez nous contacter";
  }
}

export function isAuthenticationError(error) {
  return (
    error.graphQLErrors &&
    error.graphQLErrors.length > 0 &&
    error.graphQLErrors.some(err => err.message === "Authentication error")
  );
}

export function isRetryable(error) {
  return isConnectionError(error) || isAuthenticationError(error);
}
