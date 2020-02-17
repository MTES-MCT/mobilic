export function isGraphQLParsingError(graphQLError) {
  return (
    graphQLError.networkError && graphQLError.networkError.statusCode === 400
  );
}
