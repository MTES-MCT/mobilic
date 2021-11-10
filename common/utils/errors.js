import { formatPersonName } from "./coworkers";
import { formatDay, formatTimeOfDay } from "./time";
import { ACTIVITIES } from "./activities";

export function isConnectionError(error) {
  return (
    error.name === "NetworkError" ||
    (error.networkError && !error.networkError.statusCode)
  );
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
    error._refreshTokenFailed ||
    (isGraphQLError(error) &&
      error.graphQLErrors.some(
        err => err.extensions && err.extensions.code === "AUTHENTICATION_ERROR"
      ))
  );
}

export function isRetryable(error) {
  return isConnectionError(error) || isAuthenticationError(error);
}

export function formatNameInGqlError(
  user,
  selfId,
  capitalize,
  isObject = false
) {
  return selfId === user.id
    ? capitalize
      ? isObject
        ? "Vous-même"
        : "Vous"
      : isObject
      ? "vous-même"
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
        return "Vous n'êtes pas autorisé(e) à effectuer cette opération.";
      case "INACCESSIBLE_SIREN":
        return `Aucun établissement n'a été trouvé pour ce SIREN. Vérifiez que le numéro est bon et que l'entreprise est commercialement diffusible.`;
      case "SIREN_ALREADY_SIGNED_UP":
        return `L'entreprise a déjà été inscrite. Veuillez vous rapprocher de vos collaborateurs administrateurs pour y être rattaché(e)`;
      case "SIRET_ALREADY_SIGNED_UP":
        return `L'établissement a déjà été inscrit. Veuillez vous rapprocher de vos collaborateurs administrateurs pour y être rattaché(e)`;
      case "UNAVAILABLE_SIREN_API":
        return `Recherche impossible actuellement. Veuillez réessayer ultérieurement.`;
      case "NO_SIREN_API_CREDENTIALS":
        return "Recherche impossible.";
      case "FRANCE_CONNECT_ERROR":
        return "Une erreur est survenue dans l'authentification avec FranceConnect";
      case "INVALID_TOKEN":
        return "le lien est invalide";
      case "EXPIRED_TOKEN":
        return "le lien a expiré";
      case "EMAIL_ALREADY_REGISTERED":
        return "L'adresse email est déjà utilisée.";
      case "FC_USER_ALREADY_REGISTERED":
        return "L'utilisateur est déjà inscrit sur Mobilic.";
      case "OVERLAPPING_MISSIONS":
        return `Chevauchement avec la mission ${
          graphQLError.extensions.conflictingMission.name
        } créée par ${formatNameInGqlError(
          graphQLError.extensions.conflictingMission.submitter,
          store.userId()
        )} le ${formatDay(
          graphQLError.extensions.conflictingMission.receptionTime,
          true
        )}`;
      case "OVERLAPPING_ACTIVITIES":
        return `L'activité est en chevauchement avec ${
          graphQLError.extensions.conflictingActivity
            ? `l'activité ${
                ACTIVITIES[graphQLError.extensions.conflictingActivity.type]
                  .label
              } démarrée le ${formatDay(
                graphQLError.extensions.conflictingActivity.startTime,
                true
              )} à ${formatTimeOfDay(
                graphQLError.extensions.conflictingActivity.startTime
              )} et enregistrée par ${formatPersonName(
                graphQLError.extensions.conflictingActivity.submitter
              )}`
            : "d'autres activités"
        }.`;
      case "EMPTY_ACTIVITY_DURATION":
        return `L'heure de fin de l'activité doit être strictement après l'heure de début`;
      case "INVALID_EMAIL_ADDRESS":
        return `L'adresse email n'est pas valide`;
      case "MISSION_ALREADY_ENDED":
        return `La mission a déjà été terminée${
          graphQLError.extensions.missionEnd
            ? ` le ${formatDay(
                graphQLError.extensions.missionEnd.endTime,
                true
              )} à ${formatTimeOfDay(
                graphQLError.extensions.missionEnd.endTime
              )} par ${formatPersonName(
                graphQLError.extensions.missionEnd.submitter
              )}.`
            : ""
        }.`;
      case "MISSION_STILL_RUNNING":
        return `La mission ne peut pas être validée car il y a des activités en cours`;
      case "MISSION_ALREADY_VALIDATED_BY_ADMIN":
        return `La mission n'est plus modifiable, elle a été validée par le gestionnaire.`;
      case "MISSION_ALREADY_VALIDATED_BY_USER":
        return `L'utilisateur a déjà validé la mission, seul lui ou un gestionnaire peuvent modifier ses activités. `;
      case "NO_ACTIVITIES_TO_VALIDATE":
        return `Il n'y a pas d'activités à valider`;
      case "INVALID_RESOURCE":
        return "Opération impossible sur cette ressource.";
      case "DUPLICATE_EXPENDITURES":
        return "Vous avez déjà enregistré un frais de cette nature sur la mission.";
      case "EXPENDITURE_DATE_NOT_INCLUDED_IN_MISSION_RANGE":
        return "Impossible d'ajouter un frais à cette date là.";
      case "OVERLAPPING_EMPLOYMENTS":
        if (graphQLError.extensions.overlapType === "company") {
          return "L'utilisateur est déjà rattaché à l'entreprise.";
        }
        return "L'utilisateur a un rattachement existant qui n'est pas compatible.";
      case "VEHICLE_ALREADY_REGISTERED":
        return "Il existe déjà un véhicule enregistré avec cette immatriculation";
      case "ACTIVATION_EMAIL_DELAY_ERROR":
        return "Un mail d'activation a récemment été envoyé. Vérifiez votre boîte mail.";
      case "EMAIL_SENDING_ERROR":
        return "Erreur lors de l'envoi du mail. Veuillez réessayer plus tard.";
      default:
        return null;
    }
  }
}
