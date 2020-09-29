import { formatPersonName } from "./coworkers";
import { formatDay, formatTimeOfDay } from "./time";
import { getTime } from "./events";

export function isConnectionError(error) {
  return error.networkError && !error.networkError.statusCode;
}

export function formatApiError(error, overrideFormatGraphQLError) {
  let formattedError;
  try {
    if (isConnectionError(error)) {
      formattedError =
        "Impossible de se connecter au serveur. Veuillez réessayer ultérieurement.";
    } else if (isGraphQLError(error)) {
      const formattedGraphQLErrors = error.graphQLErrors
        .map(e => formatGraphQLError(e, overrideFormatGraphQLError))
        .filter(e => !!e);
      if (formattedGraphQLErrors.length > 0)
        formattedError = formattedGraphQLErrors.join("\n");
    }
  } catch {
    // Do nothing
  }
  return formattedError
    ? formattedError
    : "Une erreur est survenue. Veuillez réessayer ultérieurement.";
}

export function isAuthenticationError(error) {
  return (
    isGraphQLError(error) &&
    error.graphQLErrors.some(
      err => err.extensions && err.extensions.code === "AUTHENTICATION_ERROR"
    )
  );
}

export function isRetryable(error) {
  return isConnectionError(error) || isAuthenticationError(error);
}

export function formatNameInGqlError(user, selfId, capitalize) {
  return selfId === user.id
    ? capitalize
      ? "Vous"
      : "vous"
    : formatPersonName(user);
}

export function isGraphQLError(error) {
  return error.graphQLErrors && error.graphQLErrors.length > 0;
}

export function formatGraphQLError(graphQLError, overrideFormatGraphQLError) {
  let formattedErr;
  if (overrideFormatGraphQLError) {
    formattedErr = overrideFormatGraphQLError(graphQLError);
  }
  if (!formattedErr) {
    formattedErr = defaultFormatGraphQLApiError(graphQLError);
  }
  return formattedErr;
}

export function graphQLErrorMatchesCode(error, code) {
  return error.extensions && error.extensions.code === code;
}

export function defaultFormatGraphQLApiError(graphQLError, store) {
  if (graphQLError.extensions) {
    switch (graphQLError.extensions.code) {
      case "AUTHENTICATION_ERROR":
        return "Erreur d'authentification.";
      case "AUTHORIZATION_ERROR":
        return "Vous n'êtes pas autorisés à effectuer cette opération.";
      case "INACCESSIBLE_SIREN":
        return `Aucun établissement n'a été trouvé pour ce SIREN. Vérifiez que le numéro est bon et que l'entreprise est commercialement diffusible.`;
      case "SIREN_ALREADY_SIGNED_UP":
        return `L'entreprise a déjà été inscrite. Veuillez vous rapprocher de vos collaborateurs administrateurs pour y être rattaché(e)`;
      case "UNAVAILABLE_SIREN_API":
        return `Recherche impossible actuellement. Veuillez réessayer ultérieurement.`;
      case "NO_SIREN_API_CREDENTIALS":
        return "Recherche impossible.";
      case "FRANCE_CONNECT_ERROR":
        return "Une erreur est survenue dans l'authentification avec FranceConnect";
      case "INVALID_TOKEN":
        return "Jeton invalide";
      case "EXPIRED_TOKEN":
        return "Jeton expiré";
      case "EMAIL_ALREADY_REGISTERED":
        return "L'adresse email est déjà utilisée.";
      case "OVERLAPPING_MISSIONS":
        return `Vous avez déjà une mission en cours démarrée le ${formatDay(
          getTime(graphQLError.extensions.conflictingMission)
        )} à ${formatTimeOfDay(
          getTime(graphQLError.extensions.conflictingMission)
        )}`;
      case "ACTIVITY_SEQUENCE_ERROR":
        return "Opération impossible avec les autres activités de la mission.";
      case "INVALID_RESOURCE":
        return "Opération impossible sur cette ressource.";
      case "DUPLICATE_EXPENDITURES":
        return "Vous avez déjà enregistré un frais de cette nature sur la mission.";
      case "OVERLAPPING_EMPLOYMENTS":
        return "L'utilisateur est déjà rattaché à l'entreprise à cette date";
      default:
        return null;
    }
  }
}
