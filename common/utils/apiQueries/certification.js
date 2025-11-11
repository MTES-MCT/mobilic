import { gql } from "graphql-tag";

export const COMPANY_CERTIFICATION_COMMUNICATION_QUERY = gql`
  query certificationInfo($companyId: Int!) {
    company(id: $companyId) {
      id
      name
      hasNoActivity
      currentCompanyCertification {
        isCertified
        certificationMedal
        lastDayCertified
        startLastCertificationPeriod
        badgeUrl
        certificateCriterias {
          compliancy
          adminChanges
          logInRealTime
          attributionDate
          expirationDate
          info
        }
      }
    }
  }
`;

export const COMPANY_REGULATORY_SCORE_QUERY = gql`
  query companyRegulatoryScore(
    $companyId: Int!
    $fromDate: Date
    $toDate: Date
  ) {
    company(id: $companyId) {
      id
      companyRegulatoryScore(fromDate: $fromDate, toDate: $toDate) {
        compliant
        total
        details {
          type
          totalAlerts
          significantAlerts
          compliant
          complianceRate
        }
      }
    }
  }
`;
