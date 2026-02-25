import { formatPersonName } from "./coworkers";
import { formatDay, formatTimeOfDay } from "./time";
import { ACTIVITIES } from "./activities";

export function isConnectionError(error) {
  return (
    error.name === "NetworkError" ||
    (error.networkError && !error.networkError.statusCode)
  );
}

export const CONTROL_WITH_SAME_CONTROL_TIME_ERROR_CODE =
  "CONTROL_WITH_SAME_CONTROL_TIME";

export function formatApiError(error, overrideFormatGraphQLError) {
  let formattedError = "Une erreur est survenue. Veuillez réessayer plus tard.";

  try {
    if (isConnectionError(error)) {
      formattedError =
        "Pas de connexion Internet. Veuillez réessayer plus tard.";
    } else if (isGraphQLError(error)) {
      const formattedGraphQLErrors = error.graphQLErrors
        .map(e => formatGraphQLError(e, overrideFormatGraphQLError))
        .filter(e => !!e);

      if (formattedGraphQLErrors.length > 0) {
        if (typeof formattedGraphQLErrors[0] === "object") {
          formattedError = formattedGraphQLErrors;
        } else {
          formattedError = formattedGraphQLErrors.join("\n");
        }
      }
    }
  } catch {
    // Do nothing
  }

  return formattedError;
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
  return isConnectionError(error);
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
        return `Recherche impossible actuellement. Veuillez réessayer plus tard.`;
      case "NO_SIREN_API_CREDENTIALS":
        return "Recherche impossible.";
      case "FRANCE_CONNECT_ERROR":
        return "Une erreur est survenue dans l'authentification avec FranceConnect";
      case "INVALID_TOKEN":
        return "le lien est invalide";
      case "EXPIRED_TOKEN":
        return "le lien a expiré";
      case "ERROR_WHILE_REGISTERING_USER":
        return "Une erreur interne s'est produite ou l'adresse email est déjà utilisée.";
      case "FC_USER_ALREADY_REGISTERED":
        return "L'utilisateur est déjà inscrit sur Mobilic.";
      case "ACTIVITY_EXIST_AFTER_EMPLOYMENT_END_DATE":
        return "Détachement impossible à cette date. Vérifiez que le salarié n'a pas d'activités en cours ou d'activités après la date choisie.";
      case "EMPLOYMENT_ALREADY_TERMINATED":
        return "Opération impossible, une date de fin a déjà été renseignée pour ce rattachement.";
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
        return `La saisie ne peut pas être validée car il y a des activités en cours.`;
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
      case "COMPANY_ADDRESS_ALREADY_REGISTERED":
        return "Cette adresse est déjà enregistrée";
      case "ACTIVATION_EMAIL_DELAY_ERROR":
        return "Un mail d'activation a récemment été envoyé. Vérifiez votre boîte mail.";
      case "MAILJET_ERROR":
        return "Erreur lors de l'envoi du mail. Veuillez réessayer plus tard.";
      case "ACTIVITY_TIME_IN_FUTURE":
        return `La date de ${
          graphQLError.extensions.eventName === "Start" ? "début" : "fin"
        } de l'activité renseignée est ${Math.floor(
          (graphQLError.extensions.eventTime -
            graphQLError.extensions.receptionTime) /
            60
        )} minutes dans le futur. Veuillez vérifier l'heure de votre téléphone.`;
      case "USER_SELF_CHANGE_ROLE":
        return "La modification de votre rôle ne peut être effectuée que par un autre gestionnaire.";
      case "USER_SELF_TERMINATE_EMPLOYMENT":
        return "L'action de mettre fin à votre rattachement ne peut être effectuée que par un autre gestionnaire.";
      case "INVALID_CONTROL_TOKEN":
        return "Le QR Code n'a pas été reconnu par Mobilic.";
      case "ACTIVITY_OUTSIDE_EMPLOYMENT_EMPLOYEE":
        return "Vous ne pouvez pas enregistrer des activités en dehors de votre période de rattachement.";
      case "ACTIVITY_OUTSIDE_EMPLOYMENT_ADMIN":
        return "Vous ne pouvez pas enregistrer des activités en dehors de la période de rattachement du salarié sélectionné.";
      case "USER_NOT_EMPLOYED_BY_COMPANY_ANYMORE_EMPLOYEE":
        return "Vous ne pouvez pas effectuer cette opération car vous n'êtes plus rattaché à la société.";
      case "USER_NOT_EMPLOYED_BY_COMPANY_ANYMORE_ADMIN":
        return "Vous ne pouvez pas effectuer cette opération car le salarié n'est plus rattaché à la société.";
      case "EMPLOYMENT_CLIENT_LINK_ALREADY_ACCEPTED":
        return "Vous avez déjà accordé les droits d'accès à votre compte Mobilic.";
      case "EMPLOYMENT_CLIENT_LINK_EXPIRED":
        return "Le lien a expiré. Contactez votre éditeur de logiciel afin de recevoir un nouveau mail de connexion.";
      case "EMPLOYMENT_CLIENT_LINK_NOT_FOUND":
        return "Paramètres invalides. Veuillez suivre le lien d'activation inclus dans le mail reçu. Si le problème persiste, contactez votre éditeur de logiciel.";
      case "AGENT_CONNECT_IDP_NOT_ALLOWED_ERROR":
        return "Connexion impossible : vous n'avez pas les autorisations nécessaires.";
      case "AGENT_CONNECT_ORGANIZATIONAL_UNIT_NOT_FOUND_ERROR":
        return {
          message: `Vous n'êtes pas autorisé(e) à créer un compte Mobilic contrôleur. Si vous faites partie de l’inspection du travail, veuillez suivre la procédure décrite dans la notice d’utilisation disponible sur :`,
          link: {
            url: "https://mobilic.beta.gouv.fr/resources/controller",
            text: "https://mobilic.beta.gouv.fr/resources/controller"
          }
        };
      case CONTROL_WITH_SAME_CONTROL_TIME_ERROR_CODE:
        return "Un contrôle a déjà été enregistré à la même heure.";
      default:
        return null;
    }
  }
}
