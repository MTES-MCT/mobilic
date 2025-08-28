/**
 * Certification constants
 * Ensures consistency between backend (English) and frontend (French) naming
 */

const MEDAL_LEVELS_CONFIG = {
  BRONZE: { frontend: "BRONZE", display: "Bronze", filename: "bronze" },
  SILVER: { frontend: "ARGENT", display: "Argent", filename: "argent" },
  GOLD: { frontend: "OR", display: "Or", filename: "or" },
  DIAMOND: { frontend: "DIAMANT", display: "Diamant", filename: "diamant" }
};

export const BACKEND_MEDAL_LEVELS = Object.keys(MEDAL_LEVELS_CONFIG);
export const FRONTEND_MEDAL_LEVELS = Object.values(MEDAL_LEVELS_CONFIG).map(
  config => config.frontend
);

export const BACKEND_TO_FRONTEND_MAPPING = Object.entries(
  MEDAL_LEVELS_CONFIG
).reduce(
  (acc, [backend, config]) => ({ ...acc, [backend]: config.frontend }),
  {}
);

export const MEDAL_DISPLAY_LABELS = Object.entries(MEDAL_LEVELS_CONFIG).reduce(
  (acc, [, config]) => ({ ...acc, [config.frontend]: config.display }),
  {}
);

export const MEDAL_CDN_FILENAMES = Object.entries(MEDAL_LEVELS_CONFIG).reduce(
  (acc, [, config]) => ({ ...acc, [config.frontend]: config.filename }),
  {}
);

// TODO: Change back to @master after PR merge to master branch
export const CDN_BASE_URL =
  "https://cdn.jsdelivr.net/gh/MTES-MCT/mobilic@epic/certificate-rework/common/assets/images/certification/squared";

/**
 * Internal utility to map a level to a specific mapping object
 * @param {string} level - Medal level (backend or frontend)
 * @param {Object} mapping - Target mapping object
 * @returns {string|null} Mapped value or null if level is invalid
 */
function getMappedValue(level, mapping) {
  if (!level) return null;
  const frontendLevel = BACKEND_TO_FRONTEND_MAPPING[level] || level;
  return mapping[frontendLevel] || null;
}

/**
 * Gets the display label for a medal level
 * @param {string} level - Medal level (backend or frontend)
 * @returns {string|null} Display label (Bronze, Argent, Or, Diamant) or null
 */
export function getMedalDisplayLabel(level) {
  return getMappedValue(level, MEDAL_DISPLAY_LABELS);
}

/**
 * Gets the CDN filename for a medal level
 * @param {string} level - Medal level (backend or frontend)
 * @returns {string|null} Filename (bronze, argent, or, diamant) or null
 */
export function getMedalCdnFilename(level) {
  return getMappedValue(level, MEDAL_CDN_FILENAMES);
}

/**
 * Gets the complete CDN URL for a medal badge
 * @param {string} level - Medal level (backend or frontend)
 * @returns {string|null} Complete CDN URL or null if level is invalid
 */
export function getMedalCdnUrl(level) {
  const filename = getMedalCdnFilename(level);
  if (!filename) return null;
  return `${CDN_BASE_URL}/${filename}.png`;
}

/**
 * Validates if a medal level is valid (backend or frontend)
 * @param {string} level - Medal level to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMedalLevel(level) {
  return (
    BACKEND_MEDAL_LEVELS.includes(level) ||
    FRONTEND_MEDAL_LEVELS.includes(level)
  );
}

/**
 * Generates embed codes for website integration (iframe, image, script)
 * @param {string} level - Medal level (backend or frontend)
 * @returns {Object} Object containing iframe, image, and script embed codes
 */
export function generateEmbedCodes(level) {
  const badgeUrl = getMedalCdnUrl(level);
  const levelLabel = getMedalDisplayLabel(level);

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
