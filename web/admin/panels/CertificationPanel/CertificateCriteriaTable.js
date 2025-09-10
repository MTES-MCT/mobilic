import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Typography } from "@mui/material";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";
import classNames from "classnames";
import { getFrenchMedalLabel } from "../../../common/certification";

const MEDALS = ["BRONZE", "SILVER", "GOLD", "DIAMOND"];

const CERTIFICATE_LEVELS = {
  BRONZE: { logInRealTime: 60, adminChanges: 30, compliancy: 0 },
  SILVER: { logInRealTime: 70, adminChanges: 20, compliancy: 2 },
  GOLD: { logInRealTime: 80, adminChanges: 10, compliancy: 4 },
  DIAMOND: { logInRealTime: 95, adminChanges: 1, compliancy: 6 }
};

const CRITERIA_LABELS = {
  logInRealTime: "Temps de travail enregistrés en temps réel",
  adminChanges: "Temps de travail modifiés par le gestionnaire",
  compliancy: "Respect des seuils réglementaires"
};

export default function CertificateCriteriaTable({ companyWithInfo = {} }) {
  const {
    medal,
    logInRealTime,
    adminChanges,
    compliancy
  } = useCompanyCertification(companyWithInfo.currentCompanyCertification);

  const renderHeader = m => {
    return (
      <th
        className={classNames(m.toLowerCase(), {
          active: m === medal
        })}
        key={m}
      >
        <span className="header-badge">{getFrenchMedalLabel(m)}</span>
      </th>
    );
  };

  const renderDataCell = (m, value, suffix) => {
    const isActive = medal === m;
    return (
      <td
        key={m}
        className={classNames("value", m.toLowerCase(), {
          active: isActive
        })}
      >
        {value}
        <span className="suffix">{suffix}</span>
      </td>
    );
  };

  const renderScoreCell = (value, suffix = "%") => (
    <td className={classNames("my-score", "value")}>
      {value}
      <span className="suffix">{suffix}</span>
    </td>
  );

  const renderCriteriaCell = text => <td className="definition">{text}</td>;

  const renderLevelGuidanceMessage = () => {
    if (!medal) {
      return (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <h3 className={cx(fr.cx("fr-h3", "fr-mb-4w"))}>
            Comment obtenir le premier niveau ?
          </h3>
          <h4 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
            Vous pouvez obtenir le niveau bronze !
          </h4>
          <ul
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0",
              paddingLeft: "20px",
              textAlign: "justify"
            }}
          >
            <li>
              Aidez vos salariés à prendre en main Mobilic en leur fournissant
              de la{" "}
              <a
                href="/resources/driver"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#000091",
                  textDecoration: "underline"
                }}
              >
                documentation
              </a>{" "}
              ;
            </li>
            <li>
              Demandez aux salariés à l'aise avec l'outil de prendre le temps de
              former les autres ;
            </li>
            <li>
              Expliquez-leur l'importance de saisir en temps réel : respect des
              seuils réglementaires, respect du droit du travail ;
            </li>
            <li>
              L'équipe Mobilic est disponible en visioconférence pour plus de
              conseils :{" "}
              <a
                href="mailto:contact@mobilic.beta.gouv.fr"
                style={{
                  color: "#000091",
                  textDecoration: "underline"
                }}
              >
                prendre rendez-vous
              </a>
              .
            </li>
            <li>
              Pour garantir le respect{" "}
              <a
                href="https://faq.mobilic.beta.gouv.fr/je-suis-salarie/respecter-les-seuils-reglementaires"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#000091",
                  textDecoration: "underline"
                }}
              >
                la réglementation en vigueur
              </a>
              , incitez vos salariés à faire attention aux temps de pause et de
              repos.
            </li>
          </ul>
        </div>
      );
    }

    const levelMessages = {
      BRONZE: (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <Typography component="h2" variant="h5">
            Comment passer au niveau suivant ?
          </Typography>
          <Typography>
            <b>Vous êtes sur la bonne voie !</b>
          </Typography>
          <ul
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0",
              paddingLeft: "20px",
              textAlign: "justify"
            }}
          >
            <li>Formez vos salariés à l'usage de Mobilic ;</li>
            <li>
              Assurez-vous en début de journée qu'ils aient bien lancé Mobilic
              (information vérifiable depuis l'onglet "Activités" de votre
              espace) ;
            </li>
            <li>
              Renseignez-vous sur{" "}
              <a
                href="https://faq.mobilic.beta.gouv.fr/je-suis-salarie/respecter-les-seuils-reglementaires"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#000091",
                  textDecoration: "underline"
                }}
              >
                la réglementation en vigueur
              </a>
              .
            </li>
          </ul>
        </div>
      ),
      SILVER: (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <Typography component="h2" variant="h5">
            Comment passer au niveau suivant ?
          </Typography>
          <h4 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
            Vous pouvez faire encore mieux !
          </h4>
          <ul
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0",
              paddingLeft: "20px",
              textAlign: "justify"
            }}
          >
            <li>
              Expliquez à vos salariés pourquoi il est dans leur intérêt de
              saisir en temps réel ;
            </li>
            <li>
              En fin de journée, assurez-vous qu'ils mettent bien fin à leur
              mission en cours ;
            </li>
            <li>Formez-les au respect des seuils réglementaires.</li>
          </ul>
        </div>
      ),
      GOLD: (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <Typography component="h2" variant="h5">
            Comment passer au niveau suivant ?
          </Typography>
          <h4 className={cx(fr.cx("fr-h4", "fr-mb-4w"))}>
            Vous y êtes presque !
          </h4>
          <ul
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0",
              paddingLeft: "20px",
              textAlign: "justify"
            }}
          >
            <li>
              Chaque fois que vous communiquez avec vos salariés dans la
              journée, demandez-leur s'ils ont bien mis à jour Mobilic ;
            </li>
            <li>
              Réservez la modification des missions aux oublis ou aux erreurs
              des salariés ;
            </li>
            <li>
              Identifiez les critères manquants à l'aide de la section "Respect
              des seuils réglementaires" ci-dessous et mettez en place une
              procédure spécifique pour y remédier.
            </li>
          </ul>
        </div>
      ),
      DIAMOND: null
    };

    return levelMessages[medal] || null;
  };

  return (
    <div>
      <>
        <table className="certificate">
          <thead>
            <tr>
              <th className="base">Critères</th>
              {MEDALS.map(m => renderHeader(m))}
              <th className="your-score">Votre score</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.logInRealTime)}
              {MEDALS.map(m =>
                renderDataCell(m, CERTIFICATE_LEVELS[m].logInRealTime, "%")
              )}
              {renderScoreCell((logInRealTime * 100).toFixed(0))}
            </tr>
            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.adminChanges)}
              {MEDALS.map(m =>
                renderDataCell(m, CERTIFICATE_LEVELS[m].adminChanges, "%")
              )}
              {renderScoreCell((adminChanges * 100).toFixed(0))}
            </tr>
            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.compliancy)}
              {MEDALS.map(m =>
                renderDataCell(m, CERTIFICATE_LEVELS[m].compliancy, "/6")
              )}
              {renderScoreCell(compliancy, "/6")}
            </tr>
          </tbody>
        </table>
      </>

      <div className={cx(fr.cx("fr-mt-6w"))}>
        {renderLevelGuidanceMessage()}
      </div>
    </div>
  );
}
