import { createUpdateTimeManager } from "./updateTimeManager";

/**
 * Factory function to create modal managers with business logic
 * @param {Object} config - Manager configuration
 * @param {string} config.cookieBaseName - Base name for the cookie
 * @param {number} config.defaultDelayDays - Default delay in days
 * @param {boolean} config.isPerCompany - If true, adds company ID to cookie name
 * @param {Function} config.businessCondition - Function that determines if business condition is met
 */
export function createModalManager(config) {
  const {
    cookieBaseName,
    defaultDelayDays = 1,
    isPerCompany = false,
    businessCondition = () => true
  } = config;

  const getCookieName = entity => {
    if (!isPerCompany) return cookieBaseName;
    const id = entity?.id;
    return id ? `${cookieBaseName}_${id}` : cookieBaseName;
  };

  return {
    shouldUpdate: entity => {
      if (isPerCompany && !entity?.id) return false;

      const { shouldUpdate } = createUpdateTimeManager(
        getCookieName(entity),
        defaultDelayDays
      );

      const needsUpdate = businessCondition(entity);
      return shouldUpdate(needsUpdate);
    },

    snooze: entity => {
      if (isPerCompany && !entity?.id) return;
      const { snooze } = createUpdateTimeManager(
        getCookieName(entity),
        defaultDelayDays
      );
      snooze();
    },

    clearUpdateTimeCookie: entity => {
      if (isPerCompany && !entity?.id) return;
      const { clearUpdateTimeCookie } = createUpdateTimeManager(
        getCookieName(entity),
        defaultDelayDays
      );
      clearUpdateTimeCookie();
    },

    checkUpdateTimeCookieExists: entity => {
      if (isPerCompany && !entity?.id) return false;
      const { checkUpdateTimeCookieExists } = createUpdateTimeManager(
        getCookieName(entity),
        defaultDelayDays
      );
      return checkUpdateTimeCookieExists();
    },

    initUpdateTimeCookie: entity => {
      if (isPerCompany && !entity?.id) return;
      const { initUpdateTimeCookie } = createUpdateTimeManager(
        getCookieName(entity),
        defaultDelayDays
      );
      initUpdateTimeCookie();
    }
  };
}
