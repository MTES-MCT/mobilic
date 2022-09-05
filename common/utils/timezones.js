export const TIMEZONES = [
  { name: "Europe/Paris", label: "France Métropolitaine" },
  { name: "America/Guadeloupe", label: "Guadeloupe" },
  { name: "America/Martinique", label: "Martinique" },
  { name: "America/Guyana", label: "Guyane" },
  { name: "Indian/Reunion", label: "La Réunion" },
  { name: "America/Miquelon", label: "Saint-Pierre-et-Miquelon" },
  { name: "Indian/Mayotte", label: "Mayotte" },
  { name: "Pacific/Noumea", label: "Nouvelle-Calédonie" }
];

export const getClientTimezone = () => {
  const clientTimezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return getTimezone(clientTimezoneName);
};

export const getTimezone = timezoneName => {
  return (
    TIMEZONES.find(timezone => timezone.name === timezoneName) || TIMEZONES[0]
  );
};

export const getTimezonePrettyName = timezoneName => {
  return getTimezone(timezoneName).label;
};
