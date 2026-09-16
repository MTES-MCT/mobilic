import { gql } from "graphql-tag";

export const TECHNICAL_INCIDENT_FIELDS = `
  id
  technicalType
  category
  nature
  startTime
  endTime
  description
  isOngoing
  effectiveEndTime
`;

export const TECHNICAL_INCIDENTS_QUERY = gql`
  query technicalIncidents {
    technicalIncidents {
      ${TECHNICAL_INCIDENT_FIELDS}
    }
  }
`;

export const CREATE_TECHNICAL_INCIDENT_MUTATION = gql`
  mutation createTechnicalIncident(
    $technicalType: TechnicalIncidentTypeEnum!
    $startTime: TimeStamp!
    $endTime: TimeStamp
    $description: String
  ) {
    technicalIncidents {
      createTechnicalIncident(
        technicalType: $technicalType
        startTime: $startTime
        endTime: $endTime
        description: $description
      ) {
        ${TECHNICAL_INCIDENT_FIELDS}
      }
    }
  }
`;

export const UPDATE_TECHNICAL_INCIDENT_MUTATION = gql`
  mutation updateTechnicalIncident(
    $incidentId: Int!
    $technicalType: TechnicalIncidentTypeEnum
    $startTime: TimeStamp
    $endTime: TimeStamp
    $description: String
  ) {
    technicalIncidents {
      updateTechnicalIncident(
        incidentId: $incidentId
        technicalType: $technicalType
        startTime: $startTime
        endTime: $endTime
        description: $description
      ) {
        ${TECHNICAL_INCIDENT_FIELDS}
      }
    }
  }
`;

export const RESOLVE_TECHNICAL_INCIDENT_MUTATION = gql`
  mutation resolveTechnicalIncident($incidentId: Int!, $endTime: TimeStamp!) {
    technicalIncidents {
      resolveTechnicalIncident(incidentId: $incidentId, endTime: $endTime) {
        ${TECHNICAL_INCIDENT_FIELDS}
      }
    }
  }
`;
