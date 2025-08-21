import { getMedalDisplayLabel, getMedalCdnUrl } from "./certificationConstants";

// ===== FONCTIONS D'INTERFACE PUBLIQUE =====
// Ces fonctions maintiennent la compatibilité avec l'API existante

/**
 * @deprecated Utiliser getMedalDisplayLabel de certificationConstants
 */
export function getCertificateLevelLabel(level) {
  return getMedalDisplayLabel(level);
}

/**
 * @deprecated Utiliser getMedalCdnUrl de certificationConstants
 */
export function getBadgeCdnUrl(level) {
  return getMedalCdnUrl(level);
}

/**
 * @deprecated Will be implemented after PR merge
 */
export function getCertificateBadgeComponent() {
  return null;
}

export function generateEmbedCodes(level) {
  const badgeUrl = getBadgeCdnUrl(level);
  const levelLabel = getCertificateLevelLabel(level);

  if (!badgeUrl) return { iframe: "", image: "", script: "" };

  const altText = `Certificat Mobilic ${levelLabel || level}`;
  const titleText = `Certificat Mobilic ${levelLabel || level}`;

  return {
    iframe: `<iframe src="${badgeUrl}" width="150" height="150" frameborder="0" style="border: none;" title="${titleText}"></iframe>`,

    image: `<img src="${badgeUrl}" alt="${altText}" width="150" height="150" />`,

    script: `<a href="https://mobilic.beta.gouv.fr" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="${altText}" width="150" height="150" />
</a>`
  };
}
