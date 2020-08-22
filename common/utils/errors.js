import { formatPersonName } from "./coworkers";
import { formatDay, formatTimeOfDay } from "./time";
import { getTime } from "./events";

export function isGraphQLParsingError(error) {
  return error.networkError && error.networkError.statusCode === 400;
}

export function isConnectionError(error) {
  return error.networkError && !error.networkError.statusCode;
}

export function formatApiError(error, userId) {
  let formattedError;
  try {
    if (isConnectionError(error)) {
      formattedError =
        "Impossible de se connecter au serveur. Veuillez réessayer ultérieurement.";
    } else if (isAuthenticationError(error)) {
      formattedError =
        "Erreur d'authentification. Etes-vous sûrs de vos identifiants ?";
    } else if (isGraphQLError(error)) {
      const formattedGraphQLErrors = error.graphQLErrors
        .map(e => formatGraphQLError(e, userId))
        .join("\n");
      if (formattedGraphQLErrors) formattedError = formattedGraphQLErrors;
    }
  } catch {
    // Do nothing
  }
  return formattedError
    ? formattedError
    : "Une erreur est survenue. Veuillez nous contacter.";
}

export function isAuthenticationError(error) {
  return (
    isGraphQLError(error) &&
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

export function isGraphQLError(error) {
  return error.graphQLErrors && error.graphQLErrors.length > 0;
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
  // SIREN was not found or is not accessible in SIREN API
  if (graphQLError.extensions && graphQLError.extensions.code === 102) {
    return `Aucun établissement n'a été trouvé pour ce SIREN. Vérifiez que le numéro est bon et que l'entreprise est commercialement diffusible.`;
  }
  // SIREN already registered
  if (graphQLError.extensions && graphQLError.extensions.code === 103) {
    return `L'entreprise a déjà été inscrite. Veuillez vous rapprocher de vos collaborateurs administrateurs pour y être rattaché(e)`;
  }
  // Misc error from SIREN API (downtime, ...)
  if (graphQLError.extensions && graphQLError.extensions.code === 104) {
    return `Recherche impossible actuellement. Veuillez réessayer ultérieurement.`;
  }
  // SIREN API client is disabled
  if (graphQLError.extensions && graphQLError.extensions.code === 105) {
    return `Recherche impossible.`;
  }
  if (graphQLError.extensions && graphQLError.extensions.code === 107) {
    return `Un problème est survenu dans la connexion avec FranceConnect.`;
  }
  if (graphQLError.extensions && graphQLError.extensions.code === 108) {
    return `L'utilisateur n'existe pas. Vous êtes-vous inscrits ?`;
  }
}
