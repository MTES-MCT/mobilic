import React, { useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import {
  formatFranceConnectError,
  getFranceConnectRedirectRoute,
  getRedirectDelay
} from "common/utils/franceConnectErrors";

export function FranceConnectErrorDisplay({
  errorCode,
  errorDescription,
  queryParams,
  onRedirect
}) {
  const history = useHistory();
  const [countdown, setCountdown] = React.useState(null);

  const errorInfo = formatFranceConnectError(errorCode, errorDescription);
  const redirectRoute = getFranceConnectRedirectRoute(queryParams, errorCode);
  const redirectDelay = getRedirectDelay(errorCode);

  const handleManualRedirect = useCallback(() => {
    if (onRedirect) {
      onRedirect(redirectRoute);
    } else {
      history.push(redirectRoute);
    }
  }, [onRedirect, redirectRoute, history]);

  useEffect(() => {
    if (redirectDelay === 0) {
      handleManualRedirect();
      return;
    }

    if (redirectDelay > 0) {
      setCountdown(Math.ceil(redirectDelay / 1000));

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleManualRedirect();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [errorCode, redirectRoute, redirectDelay, handleManualRedirect]);

  const getAlertClass = type => {
    switch (type) {
      case "error":
        return "fr-alert fr-alert--error";
      case "warning":
        return "fr-alert fr-alert--warning";
      case "info":
      default:
        return "fr-alert fr-alert--info";
    }
  };

  return (
    <div
      className="fr-container fr-container--fluid"
      style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
    >
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <div className={getAlertClass(errorInfo.type)} role="alert">
            <h3 className="fr-alert__title">{errorInfo.title}</h3>
            <p className="fr-mb-0">{errorInfo.message}</p>
          </div>

          <div className="fr-mt-4w" style={{ textAlign: "center" }}>
            <ButtonsGroup
              inlineLayoutWhen="always"
              alignment="center"
              buttons={[
                {
                  children:
                    queryParams.get("context") === "signup"
                      ? "Retour à l'inscription"
                      : "Retour à la connexion",
                  onClick: handleManualRedirect
                },
                ...(queryParams.get("next")
                  ? [
                      {
                        children: "Accueil",
                        priority: "secondary",
                        onClick: () => history.push("/")
                      }
                    ]
                  : [])
              ]}
            />

            {countdown > 0 && (
              <p className="fr-text--sm fr-mt-2w" style={{ color: "#666666" }}>
                Redirection automatique dans {countdown} seconde
                {countdown > 1 ? "s" : ""}...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
