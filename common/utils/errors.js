export function isGraphQLParsingError(graphQLError) {
  return (
    graphQLError.networkError && graphQLError.networkError.statusCode === 400
  );
}

export function isConnectionError(graphQLError) {
  return (
    graphQLError.networkError &&
    RegExp(".*Failed to fetch.*").test(graphQLError.networkError.message)
  );
}

export function formatGraphQLError(graphQLError) {
  if (isConnectionError(graphQLError)) {
    return "Veuillez vérifier que vous êtes connecté à Internet avant de réessayer";
  } else {
    return "Une erreur est survenue. Veuillez nous contacter";
  }
}
