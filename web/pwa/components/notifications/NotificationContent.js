import { strToUnixTimestamp, formatDay } from "common/utils/time";

const DEFAULT_NOTIFICATION_FALLBACK = {
  title: "Notification",
  content: "",
  missionId: null
};

export const notificationContent = {
  MISSION_CHANGES_WARNING: data => {
    const date = data.mission_start_date;
    const formattedDate = date
      ? formatDay(strToUnixTimestamp(data.mission_start_date), true)
      : "";
    return {
      title: `Votre gestionnaire a modifié votre mission du ${formattedDate}`,
      content: "Retrouvez le détail des modifications dans votre historique.",
      missionId: data.mission_id
    };
  },
  NEW_MISSION_BY_ADMIN: data => {
    const date = data.mission_start_date;
    const formattedDate = date
      ? formatDay(strToUnixTimestamp(data.mission_start_date), true)
      : "";
    return {
      title: `Mission passée du ${formattedDate} ajoutée par votre gestionnaire`,
      content:
        "Retrouvez le détail de la mission passée dans votre historique.",
      missionId: data.mission_id
    };
  },
  MISSION_AUTO_VALIDATION: data => {
    const date = data.mission_start_date;
    const formattedDate = date
      ? formatDay(strToUnixTimestamp(data.mission_start_date), true)
      : "";
    const missionName = data.mission_name ? data.mission_name : "";
    return {
      title: `Mission ${missionName} du ${formattedDate} validée automatiquement`,
      content:
        "Informez votre gestionnaire de vos horaires réels en laissant une observation dans l'historique.",
      missionId: data.mission_id
    };
  }
};

export function getNotificationContent(type, data) {
  const fn = notificationContent[type];
  return fn ? fn(data) : DEFAULT_NOTIFICATION_FALLBACK;
}
