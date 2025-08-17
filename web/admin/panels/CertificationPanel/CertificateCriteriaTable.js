import React, { useMemo } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const CERTIFICATE_LEVELS = {
  BRONZE: { label: "Bronze", percentage: 60 },
  ARGENT: { label: "Argent", percentage: 70 },
  OR: { label: "Or", percentage: 80 },
  DIAMANT: { label: "Diamant", percentage: 95 }
};

const ADMIN_CHANGES_THRESHOLDS = {
  BRONZE: 30,
  ARGENT: 20,
  OR: 10,
  DIAMANT: 1
};

const CRITERIA_LABELS = {
  logInRealTime: "Temps de travail enregistrés en temps réel",
  adminChanges: "Temps de travail modifiés par le gestionnaire",
  compliancy: "Respect des seuils réglementaires"
};

const LEVEL_COLORS = {
  BRONZE: {
    active: {
      header: "#E9A866",
      body: "#F7EBE5",
      text: "#855D48",
      textBody: "#161616",
      badge: "#FBF5F2"
    },
    inactive: {
      header: "#F6F6F6",
      body: "#FFFFFF",
      text: "#3A3A3A",
      textBody: "#3A3A3A",
      badge: "#F6F6F6"
    }
  },
  ARGENT: {
    active: {
      header: "#DBDBDB",
      body: "#EEEEEE",
      text: "#3A3A3A",
      textBody: "#161616",
      badge: "#F8F8F8"
    },
    inactive: {
      header: "#F6F6F6",
      body: "#FFFFFF",
      text: "#3A3A3A",
      textBody: "#3A3A3A",
      badge: "#F6F6F6"
    }
  },
  OR: {
    active: {
      header: "#FACE3D",
      body: "#FEF7DA",
      text: "#66673D",
      textBody: "#161616",
      badge: "#FEF7DA"
    },
    inactive: {
      header: "#F6F6F6",
      body: "#FFFFFF",
      text: "#3A3A3A",
      textBody: "#3A3A3A",
      badge: "#F6F6F6"
    }
  },
  DIAMANT: {
    active: {
      header: "#CAEDF0",
      body: "#E5FBFD",
      text: "#006A6F",
      textBody: "#161616",
      badge: "#E5FBFD"
    },
    inactive: {
      header: "#F6F6F6",
      body: "#FFFFFF",
      text: "#3A3A3A",
      textBody: "#3A3A3A",
      badge: "#F6F6F6"
    }
  }
};

export default function CertificateCriteriaTable({
  companyWithInfo = {},
  regulatoryScore = { compliant: 0, total: 6 }
}) {
  const calculateScore = useMemo(() => {
    if (!companyWithInfo?.currentCompanyCertification?.certificateCriterias) {
      return { logInRealTime: 0, adminChanges: 1, compliancy: 0 };
    }

    const scores = {
      logInRealTime:
        companyWithInfo.currentCompanyCertification.certificateCriterias
          .logInRealTime ?? 0,
      adminChanges:
        companyWithInfo.currentCompanyCertification.certificateCriterias
          .adminChanges ?? 1,
      compliancy:
        companyWithInfo.currentCompanyCertification.certificateCriterias
          .compliancy ?? 0
    };

    return scores;
  }, [companyWithInfo, regulatoryScore]);

  const reachedLevels = useMemo(() => {
    const { logInRealTime, adminChanges, compliancy } = calculateScore;

    return {
      logInRealTime: {
        BRONZE: logInRealTime >= 0.6,
        ARGENT: logInRealTime >= 0.7,
        OR: logInRealTime >= 0.8,
        DIAMANT: logInRealTime >= 0.95
      },
      adminChanges: {
        BRONZE: adminChanges <= 0.3,
        ARGENT: adminChanges <= 0.2,
        OR: adminChanges <= 0.1,
        DIAMANT: adminChanges <= 0.01
      },
      compliancy: {
        BRONZE: compliancy >= 1,
        ARGENT: compliancy >= 2,
        OR: compliancy >= 4,
        DIAMANT: compliancy >= 6
      }
    };
  }, [calculateScore]);

  const certificationLevel = useMemo(() => {
    const levels = ["BRONZE", "ARGENT", "OR", "DIAMANT"];

    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const allCriteriaMet = Object.values(reachedLevels).every(
        criteria => criteria[level]
      );
      if (allCriteriaMet) {
        return level;
      }
    }
    return null;
  }, [reachedLevels]);

  const getLevelColors = level => {
    const isActive = level === certificationLevel;
    const colors = LEVEL_COLORS[level] || LEVEL_COLORS.BRONZE;
    return isActive ? colors.active : colors.inactive;
  };

  const renderHeaderCell = (content, isScore = false, level = null) => {
    let backgroundColor = "#F6F6F6";
    let textColor = "#3A3A3A";

    if (isScore) {
      backgroundColor = "#3965EA";
      textColor = "#F4F8FF";
    } else if (level && certificationLevel === level) {
      const colors = getLevelColors(level);
      backgroundColor = colors.header;
      textColor = colors.text;
    }

    return (
      <th
        className={cx(
          fr.cx("fr-p-3w"),
          isScore && fr.cx("fr-background-alt--blue-france")
        )}
        style={{
          backgroundColor,
          borderBottom: "1px solid #929292",
          textAlign: "center",
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "24px"
        }}
      >
        {level && certificationLevel === level ? (
          <div
            style={{
              display: "inline-block",
              backgroundColor: getLevelColors(level).badge,
              color: getLevelColors(level).text,
              padding: "0px 6px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase"
            }}
          >
            {content}
          </div>
        ) : (
          <span style={{ color: textColor }}>{content}</span>
        )}
      </th>
    );
  };

  const renderDataCell = (level, value, unit, criteriaType = "percentage") => {
    const colors = getLevelColors(level);
    const isActive = certificationLevel === level;
    const displayValue =
      criteriaType === "adminChanges" ? ADMIN_CHANGES_THRESHOLDS[level] : value;

    return (
      <td
        className={cx(fr.cx("fr-p-3w"))}
        style={{
          backgroundColor: colors.body,
          borderBottom: "1px solid #929292",
          textAlign: "center",
          minHeight: "72px",
          verticalAlign: "middle"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px"
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: isActive ? 700 : 400,
              color: colors.textBody
            }}
          >
            {displayValue}
          </span>
          <span
            style={{
              fontSize: "14px",
              color: colors.textBody
            }}
          >
            {unit}
          </span>
        </div>
      </td>
    );
  };

  const renderScoreCell = (score, unit = "%") => (
    <td
      className={cx(fr.cx("fr-p-3w"))}
      style={{
        backgroundColor: "#DAE9FF",
        borderBottom: "1px solid #929292",
        textAlign: "center",
        minHeight: "72px",
        verticalAlign: "middle"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px"
        }}
      >
        <span style={{ fontSize: "20px", fontWeight: 700, color: "#3A3A3A" }}>
          {score}
        </span>
        <span style={{ fontSize: "14px", color: "#3A3A3A" }}>{unit}</span>
      </div>
    </td>
  );

  const renderCriteriaCell = text => (
    <td
      className={cx(fr.cx("fr-p-3w"))}
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #929292",
        width: "240px",
        minHeight: "72px",
        verticalAlign: "middle"
      }}
    >
      <span
        style={{
          fontSize: "14px",
          lineHeight: "24px",
          color: "#3A3A3A",
          display: "block",
          textAlign: "left"
        }}
      >
        {text}
      </span>
    </td>
  );

  const renderLevelGuidanceMessage = () => {
    if (!certificationLevel) {
      return (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#161616",
              margin: "0 0 16px 0"
            }}
          >
            Comment obtenir le premier niveau ?
          </h3>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0 0 16px 0",
              textAlign: "justify"
            }}
          >
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
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#161616",
              margin: "0 0 16px 0"
            }}
          >
            Comment passer au niveau suivant ?
          </h3>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0 0 16px 0",
              textAlign: "justify"
            }}
          >
            Vous êtes sur la bonne voie !
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
      ARGENT: (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#161616",
              margin: "0 0 16px 0"
            }}
          >
            Comment passer au niveau suivant ?
          </h3>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0 0 16px 0",
              textAlign: "justify"
            }}
          >
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
      OR: (
        <div className={cx(fr.cx("fr-mb-4w"))}>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: "28px",
              color: "#161616",
              margin: "0 0 16px 0"
            }}
          >
            Comment passer au niveau suivant ?
          </h3>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
              color: "#3A3A3A",
              margin: "0 0 16px 0",
              textAlign: "justify"
            }}
          >
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
      DIAMANT: null
    };

    return levelMessages[certificationLevel] || null;
  };

  return (
    <div>
      <div style={{ border: "1px solid #929292" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFFFFF"
          }}
        >
          <thead>
            <tr>
              {renderHeaderCell("Critères")}
              {renderHeaderCell("Bronze", false, "BRONZE")}
              {renderHeaderCell("Argent", false, "ARGENT")}
              {renderHeaderCell("Or", false, "OR")}
              {renderHeaderCell("Diamant", false, "DIAMANT")}
              {renderHeaderCell("Votre score", true)}
            </tr>
          </thead>

          <tbody>
            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.logInRealTime)}
              {renderDataCell(
                "BRONZE",
                CERTIFICATE_LEVELS.BRONZE.percentage,
                "%"
              )}
              {renderDataCell(
                "ARGENT",
                CERTIFICATE_LEVELS.ARGENT.percentage,
                "%"
              )}
              {renderDataCell("OR", CERTIFICATE_LEVELS.OR.percentage, "%")}
              {renderDataCell(
                "DIAMANT",
                CERTIFICATE_LEVELS.DIAMANT.percentage,
                "%"
              )}
              {renderScoreCell((calculateScore.logInRealTime * 100).toFixed(0))}
            </tr>

            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.adminChanges)}
              {renderDataCell("BRONZE", null, "%", "adminChanges")}
              {renderDataCell("ARGENT", null, "%", "adminChanges")}
              {renderDataCell("OR", null, "%", "adminChanges")}
              {renderDataCell("DIAMANT", null, "%", "adminChanges")}
              {renderScoreCell((calculateScore.adminChanges * 100).toFixed(0))}
            </tr>

            <tr>
              {renderCriteriaCell(CRITERIA_LABELS.compliancy)}
              {renderDataCell("BRONZE", 1, "/6")}
              {renderDataCell("ARGENT", 2, "/6")}
              {renderDataCell("OR", 4, "/6")}
              {renderDataCell("DIAMANT", 6, "/6")}
              {renderScoreCell(calculateScore.compliancy, "/6")}
            </tr>
          </tbody>
        </table>
      </div>

      <div className={cx(fr.cx("fr-mt-6w"))}>
        {renderLevelGuidanceMessage()}
      </div>
    </div>
  );
}
