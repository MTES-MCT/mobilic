export function parseMissionPayloadFromBackend(missionPayload) {
  return {
    id: missionPayload.id,
    name: missionPayload.name,
    eventTime: missionPayload.eventTime,
    validated: missionPayload.validated,
    expenditures: missionPayload.expenditures
      ? JSON.parse(missionPayload.expenditures)
      : {}
  };
}
