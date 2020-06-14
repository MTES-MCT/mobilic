import { formatPersonName } from "./coworkers";
import { formatDay, formatTimeOfDay } from "./time";
import { getTime } from "./events";

export function isGraphQLParsingError(error) {
  return error.networkError && error.networkError.statusCode === 400;
}

export function isConnectionError(error) {
  return error.networkError && !error.networkError.statusCode;
}

export function formatApiError(error) {
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
    error.graphQLErrors.some(
      err => err.extensions && err.extensions.code === 100
    )
  );
}

export function isRetryable(error) {
  return isConnectionError(error) || isAuthenticationError(error);
}

function _formatName(user, selfId) {
  return selfId === user.id ? "Vous" : formatPersonName(user);
}

export function formatGraphQLError(graphQLError, userId) {
  if (graphQLError.extensions && graphQLError.extensions.code === 200) {
    return `${_formatName(graphQLError.extensions.user, userId)} ${
      graphQLError.extensions.user.id === userId ? "avez" : "a"
    } déjà une mission en cours démarrée par ${_formatName(
      graphQLError.extensions.conflictingMission.submitter,
      userId
    )} le ${formatDay(
      getTime(graphQLError.extensions.conflictingMission)
    )} à ${formatTimeOfDay(
      getTime(graphQLError.extensions.conflictingMission)
    )}`;
  }
  if (graphQLError.extensions && graphQLError.extensions.code === 201) {
    return `La mission a déjà été terminée par ${_formatName(
      graphQLError.extensions.missionEnd.submitter
    )} à ${formatTimeOfDay(getTime(graphQLError.extensions.missionEnd))}`;
  }
  if (
    graphQLError.extensions &&
    [202, 203, 204].includes(graphQLError.extensions.code)
  ) {
    return `L'évènement a déjà été enregistré`;
  }
}
