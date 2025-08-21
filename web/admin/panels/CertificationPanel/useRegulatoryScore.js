import { useCertificationInfo } from "../../utils/certificationInfo";
import { REGULATORY_THRESHOLD_TYPES } from "./regulatoryThresholdConstants";

function createCompliantDetails(allThresholdTypes) {
  return allThresholdTypes.map(type => ({
    type,
    compliant: true,
    totalAlerts: 0,
    significantAlerts: 0,
    alertDetails: []
  }));
}

function createCompliantResult(allThresholdTypes) {
  const details = createCompliantDetails(allThresholdTypes);
  return {
    compliant: allThresholdTypes.length,
    total: allThresholdTypes.length,
    details
  };
}

/**
 * Transform JSONB info data to regulatory score format
 * @param {string} infoString - JSON string from backend
 * @returns {object} Regulatory score with compliant count and details
 */
function transformRegulatoryData(infoString) {
  const allThresholdTypes = Object.values(REGULATORY_THRESHOLD_TYPES).map(
    t => t.backendType
  );

  if (!infoString) {
    return createCompliantResult(allThresholdTypes);
  }

  let parsedInfo;
  try {
    parsedInfo =
      typeof infoString === "string" ? JSON.parse(infoString) : infoString;
  } catch (error) {
    console.warn("Failed to parse regulatory info:", error);
    return createCompliantResult(allThresholdTypes);
  }

  const alertsArray = parsedInfo?.alerts || [];
  const nonCompliantTypes = alertsArray.map(alert => alert.type);

  const details = allThresholdTypes.map(type => {
    const alertsForType = alertsArray.filter(alert => alert.type === type);
    const isCompliant = alertsForType.length === 0;

    return {
      type,
      compliant: isCompliant,
      totalAlerts: alertsForType.length,
      significantAlerts: alertsForType.length,
      alertDetails: alertsForType
    };
  });

  const uniqueNonCompliantTypes = [...new Set(nonCompliantTypes)];

  return {
    compliant: allThresholdTypes.length - uniqueNonCompliantTypes.length,
    total: allThresholdTypes.length,
    details
  };
}

export function useRegulatoryScore() {
  const { companyWithInfo, loadingInfo } = useCertificationInfo();
  const totalThresholds = Object.keys(REGULATORY_THRESHOLD_TYPES).length;

  if (loadingInfo || !companyWithInfo) {
    return { compliant: 0, total: totalThresholds, details: [] };
  }

  const certificateCriterias =
    companyWithInfo?.currentCompanyCertification?.certificateCriterias;

  if (!certificateCriterias) {
    return { compliant: 0, total: totalThresholds, details: [] };
  }

  return transformRegulatoryData(certificateCriterias.info);
}
