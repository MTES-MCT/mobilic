export function setCurrentLocation(setLocation, alerts, askedByUser) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation(position);
      },
      error => {
        if (askedByUser) {
          switch (error.code) {
            case 1:
              alerts.error(
                "L'autorisation de localisation a été refusée. Pour l'activer, allez dans les paramètres de sécurité de votre navigateur.",
                {},
                6000
              );
              break;
            default:
              alerts.error(
                "La localisation est momentanément indisponible sur le téléphone. Veuillez réessayer plus tard.",
                {},
                6000
              );
          }
        }
      }
    );
  }
}
