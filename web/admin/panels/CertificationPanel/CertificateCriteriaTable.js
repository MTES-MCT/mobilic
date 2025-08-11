import React, { useMemo } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const CERTIFICATE_LEVELS = {
  BRONZE: { label: "Bronze", percentage: 60 },
  ARGENT: { label: "Argent", percentage: 70 },
  OR: { label: "Or", percentage: 80 },
  DIAMANT: { label: "Diamant", percentage: 95 }
};

const NOT_TOO_MANY_CHANGES_THRESHOLDS = {
  BRONZE: 30,
  ARGENT: 20,
  OR: 10,
  DIAMANT: 1
};

const CRITERIA_MAPPING = {
  logInRealTime: "Temps de travail enregistrés en temps réel",
  notTooManyChanges: "Temps de travail modifiés par le gestionnaire",
  beCompliant: "Respect des seuils réglementaires"
};

export default function CertificateCriteriaTable({
  companyWithInfo = {},
  regulatoryScore = { compliant: 0, total: 6 }
}) {
  const calculateScore = useMemo(() => {
    if (!companyWithInfo?.certificateCriterias) {
      return { logInRealTime: 0, notTooManyChanges: 0, beCompliant: 0 };
    }

    const scores = {
      logInRealTime:
        companyWithInfo.certificateCriterias.logInRealTimeScore ?? 0,
      notTooManyChanges:
        companyWithInfo.certificateCriterias.notTooManyChangesScore ?? 0,
      beCompliant: regulatoryScore.compliant
    };

    return scores;
  }, [companyWithInfo, regulatoryScore]);

  /**
   * Calculate which certificate levels the company has reached for each criteria
   */
  const calculateReachedLevels = useMemo(() => {
    const { logInRealTime, notTooManyChanges, beCompliant } = calculateScore;

    const reachedLevels = {
      logInRealTime: {
        BRONZE: logInRealTime >= 60,
        ARGENT: logInRealTime >= 70,
        OR: logInRealTime >= 80,
        DIAMANT: logInRealTime >= 95
      },
      notTooManyChanges: {
        BRONZE: notTooManyChanges <= 30,
        ARGENT: notTooManyChanges <= 20,
        OR: notTooManyChanges <= 10,
        DIAMANT: notTooManyChanges <= 1
      },
      beCompliant: {
        BRONZE: beCompliant >= 0, // No minimum for Bronze regulatory
        ARGENT: beCompliant >= 2,
        OR: beCompliant >= 4,
        DIAMANT: beCompliant >= 6
      }
    };

    return reachedLevels;
  }, [calculateScore]);

  /**
   * Calculate overall certificate level reached (all criteria must be met)
   */
  const overallReachedLevel = useMemo(() => {
    const levels = ['BRONZE', 'ARGENT', 'OR', 'DIAMANT'];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const allCriteriaMet = Object.values(calculateReachedLevels).every(
        criteria => criteria[level]
      );
      if (allCriteriaMet) {
        return level;
      }
    }
    return null; // No level reached
  }, [calculateReachedLevels]);

  /**
   * Get Figma-compliant colors for certificate levels based on achievement
   */
  const getLevelColors = (level) => {
    const isLevelReached = level === overallReachedLevel;
    
    const colorSchemes = {
      BRONZE: {
        header: isLevelReached ? "#E9A866" : "#F6F6F6", // Figma bronze color
        body: isLevelReached ? "#F7EBE5" : "#FFFFFF",   // Figma light bronze background
        text: isLevelReached ? "#855D48" : "#3A3A3A",   // Figma bronze badge text color
        textBody: isLevelReached ? "#161616" : "#3A3A3A", // Figma body text color (noir)
        badgeBackground: isLevelReached ? "#FBF5F2" : "#F6F6F6" // Figma badge background
      },
      ARGENT: {
        header: isLevelReached ? "#DBDBDB" : "#F6F6F6", // Figma silver color
        body: isLevelReached ? "#EEEEEE" : "#FFFFFF",   // Figma light silver background
        text: isLevelReached ? "#FFFFFF" : "#3A3A3A",   // Figma silver badge text color
        textBody: isLevelReached ? "#161616" : "#3A3A3A", // Figma body text color (noir)
        badgeBackground: isLevelReached ? "#F8F8F8" : "#F6F6F6" // Figma badge background
      },
      OR: {
        header: isLevelReached ? "#FACE3D" : "#F6F6F6", // Figma gold color
        body: isLevelReached ? "#FEF7DA" : "#FFFFFF",   // Figma light gold background
        text: isLevelReached ? "#66673D" : "#3A3A3A",   // Figma gold badge text color
        textBody: isLevelReached ? "#161616" : "#3A3A3A", // Figma body text color (noir)
        badgeBackground: isLevelReached ? "#FEF7DA" : "#F6F6F6" // Figma badge background
      },
      DIAMANT: {
        header: isLevelReached ? "#CAEDF0" : "#F6F6F6", // Figma diamond color
        body: isLevelReached ? "#E5FBFD" : "#FFFFFF",   // Figma light diamond background
        text: isLevelReached ? "#006A6F" : "#3A3A3A",   // Figma diamond badge text color
        textBody: isLevelReached ? "#161616" : "#3A3A3A", // Figma body text color (noir)
        badgeBackground: isLevelReached ? "#E5FBFD" : "#F6F6F6" // Figma badge background
      }
    };

    return colorSchemes[level] || colorSchemes.BRONZE;
  };

  const renderHeaderCell = (content, isScore = false, level = null) => {
    let backgroundColor = "#F6F6F6";
    let textColor = "#3A3A3A";
    
    if (isScore) {
      backgroundColor = "#3965EA";
      textColor = "#F4F8FF";
    } else if (level && overallReachedLevel === level) {
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
        {level && overallReachedLevel === level ? (
          // Badge avec padding et coins arrondis selon Figma
          <div
            style={{
              display: "inline-block",
              backgroundColor: getLevelColors(level).badgeBackground,
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

  const renderBadgeCell = (level, criteriaType = "default", criteriaName) => {
    // Get Figma colors for this level
    const colors = getLevelColors(level);
    const isOverallReached = overallReachedLevel === level;
    
    return (
      <td
        className={cx(fr.cx("fr-p-3w"))}
        style={{
          backgroundColor: isOverallReached ? colors.body : "#FFFFFF",
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
              fontWeight: isOverallReached ? 700 : 400, 
              color: isOverallReached ? colors.textBody : "#3A3A3A"
            }}
          >
            {criteriaType === "notTooManyChanges"
              ? NOT_TOO_MANY_CHANGES_THRESHOLDS[level]
              : CERTIFICATE_LEVELS[level].percentage}
          </span>
          <span 
            style={{ 
              fontSize: "14px", 
              color: isOverallReached ? colors.textBody : "#3A3A3A"
            }}
          >
            %
          </span>
        </div>
      </td>
    );
  };

  const renderScoreCell = (score, isRegulatory = false) => (
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
        <span style={{ fontSize: "14px", color: "#3A3A3A" }}>
          {isRegulatory ? "/6" : "%"}
        </span>
      </div>
    </td>
  );

  const renderBadgeCellWithScore = (level, score, criteriaName = "beCompliant") => {
    // Get Figma colors for this level
    const colors = getLevelColors(level);
    const isOverallReached = overallReachedLevel === level;
    
    return (
      <td
        className={cx(fr.cx("fr-p-3w"))}
        style={{
          backgroundColor: isOverallReached ? colors.body : "#FFFFFF",
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
              fontWeight: isOverallReached ? 700 : 400, 
              color: isOverallReached ? colors.textBody : "#3A3A3A"
            }}
          >
            {score}
          </span>
          <span 
            style={{ 
              fontSize: "14px", 
              color: isOverallReached ? colors.textBody : "#3A3A3A"
            }}
          >
            /6
          </span>
        </div>
      </td>
    );
  };

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

  /**
   * Render level-specific guidance messages according to Figma specs
   */
  const renderLevelGuidanceMessage = () => {
    if (!overallReachedLevel) {
      // Show Bronze guidance only if no level reached
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
              Demandez aux salariés à l'aise avec l'outil de prendre le temps
              de former les autres ;
            </li>
            <li>
              Expliquez-leur l'importance de saisir en temps réel : respect
              des seuils réglementaires, respect du droit du travail ;
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
              , incitez vos salariés à faire attention aux temps de pause et de repos.
            </li>
          </ul>
        </div>
      );
    }

    // Messages specific to achieved levels according to Figma
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
            <li>
              Formez vos salariés à l'usage de Mobilic ;
            </li>
            <li>
              Assurez-vous en début de journée qu'ils aient bien lancé Mobilic (information vérifiable depuis l'onglet "Activités" de votre espace) ;
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
              Expliquez à vos salariés pourquoi il est dans leur intérêt de saisir en temps réel ;
            </li>
            <li>
              En fin de journée, assurez-vous qu'ils mettent bien fin à leur mission en cours ;
            </li>
            <li>
              Formez-les au respect des seuils réglementaires.
            </li>
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
              Chaque fois que vous communiquez avec vos salariés dans la journée, demandez-leur s'ils ont bien mis à jour Mobilic ;
            </li>
            <li>
              Réservez la modification des missions aux oublis ou aux erreurs des salariés ;
            </li>
            <li>
              Identifiez les critères manquants à l'aide de la section "Respect des seuils réglementaires" ci-dessous et mettez en place une procédure spécifique pour y remédier.
            </li>
          </ul>
        </div>
      ),
      DIAMANT: null // No message for Diamant as it's the maximum level
    };

    return levelMessages[overallReachedLevel] || null;
  };

  return (
    <div>
      {/* Certificate Criteria Table */}
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
              {renderCriteriaCell(CRITERIA_MAPPING.logInRealTime)}
              {renderBadgeCell("BRONZE", "default", "logInRealTime")}
              {renderBadgeCell("ARGENT", "default", "logInRealTime")}
              {renderBadgeCell("OR", "default", "logInRealTime")}
              {renderBadgeCell("DIAMANT", "default", "logInRealTime")}
              {renderScoreCell(calculateScore.logInRealTime)}
            </tr>

            <tr>
              {renderCriteriaCell(CRITERIA_MAPPING.notTooManyChanges)}
              {renderBadgeCell(
                "BRONZE",
                "notTooManyChanges",
                "notTooManyChanges"
              )}
              {renderBadgeCell(
                "ARGENT",
                "notTooManyChanges",
                "notTooManyChanges"
              )}
              {renderBadgeCell("OR", "notTooManyChanges", "notTooManyChanges")}
              {renderBadgeCell(
                "DIAMANT",
                "notTooManyChanges",
                "notTooManyChanges"
              )}
              {renderScoreCell(calculateScore.notTooManyChanges)}
            </tr>

            <tr>
              {renderCriteriaCell(CRITERIA_MAPPING.beCompliant)}
              {renderBadgeCellWithScore("BRONZE", 0, "beCompliant")}
              {renderBadgeCellWithScore("ARGENT", 2, "beCompliant")}
              {renderBadgeCellWithScore("OR", 4, "beCompliant")}
              {renderBadgeCellWithScore("DIAMANT", 6, "beCompliant")}
              {renderScoreCell(calculateScore.beCompliant, true)}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Level-specific guidance messages - avec espacement standard */}
      <div className={cx(fr.cx("fr-mt-6w"))}>
        {renderLevelGuidanceMessage()}
      </div>
    </div>
  );
}
