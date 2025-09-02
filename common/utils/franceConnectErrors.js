/**
 * FranceConnect error messages compliant with OpenID Connect specifications
 * Reference: https://openid.net/specs/openid-connect-core-1_0.html#AuthError
 */
export const FRANCE_CONNECT_ERROR_MESSAGES = {
  access_denied: {
    title: "Connexion annulée",
    message: "Vous avez annulé la connexion avec FranceConnect.",
    type: "info"
  },
  login_required: {
    title: "Authentification requise",
    message: "Une authentification est requise. Veuillez vous reconnecter.",
    type: "error"
  },
  consent_required: {
    title: "Consentement requis",
    message: "Votre consentement est requis pour continuer.",
    type: "error"
  },
  invalid_request: {
    title: "Demande invalide",
    message: "La demande de connexion est invalide.",
    type: "error"
  },
  unauthorized_client: {
    title: "Client non autorisé",
    message: "Le client n'est pas autorisé à effectuer cette demande.",
    type: "error"
  },
  unsupported_response_type: {
    title: "Type de réponse non supporté",
    message: "Le type de réponse demandé n'est pas supporté.",
    type: "error"
  },
  invalid_scope: {
    title: "Portée invalide",
    message: "La portée demandée est invalide ou non reconnue.",
    type: "error"
  },
  server_error: {
    title: "Erreur serveur",
    message: "Une erreur serveur est survenue. Veuillez réessayer.",
    type: "error"
  },
  temporarily_unavailable: {
    title: "Service indisponible",
    message: "Le service FranceConnect est temporairement indisponible.",
    type: "error"
  },
  no_account: {
    title: "Compte requis",
    message:
      "Vous n'avez pas encore de compte Mobilic. Cliquez sur le bouton ci-dessous pour vous inscrire.",
    type: "info"
  },
  default: {
    title: "Erreur FranceConnect",
    message: "Une erreur est survenue lors de la connexion FranceConnect.",
    type: "error"
  }
};

export function formatFranceConnectError(errorCode, errorDescription = null) {
  const errorInfo =
    FRANCE_CONNECT_ERROR_MESSAGES[errorCode] ||
    FRANCE_CONNECT_ERROR_MESSAGES.default;

  let message = errorInfo.message;

  if (errorDescription && errorDescription.toLowerCase() !== errorCode) {
    message += ` (${errorDescription})`;
  }

  return {
    title: errorInfo.title,
    message: message,
    type: errorInfo.type,
    errorCode: errorCode
  };
}

export function getFranceConnectRedirectRoute(queryParams, errorCode) {
  const next = queryParams.get("next");
  const context = queryParams.get("context");
  const inviteToken = queryParams.get("invite_token");

  if (
    context === "signup" ||
    queryParams.get("create") === "true" ||
    errorCode === "no_account"
  ) {
    return inviteToken ? `/signup?invite_token=${inviteToken}` : "/signup";
  }

  switch (errorCode) {
    case "access_denied":
      return next || "/login";
    case "login_required":
    case "consent_required":
      return "/login";
    case "no_account":
      return inviteToken ? `/signup?invite_token=${inviteToken}` : "/signup";
    default:
      return next || "/login";
  }
}

export function shouldRedirectImmediately(errorCode) {
  const immediateRedirectErrors = [
    "unauthorized_client",
    "unsupported_response_type",
    "invalid_scope",
    "invalid_request"
  ];

  return immediateRedirectErrors.includes(errorCode);
}

export function getRedirectDelay(errorCode) {
  if (shouldRedirectImmediately(errorCode)) {
    return 0;
  }

  switch (errorCode) {
    case "access_denied":
      return 2000;
    case "no_account":
      return 4000;
    case "server_error":
    case "temporarily_unavailable":
      return 5000;
    default:
      return 3000;
  }
}
