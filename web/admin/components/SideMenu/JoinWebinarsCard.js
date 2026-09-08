import React from "react";
import { useModals } from "common/utils/modals";
import WebinardsSvg from "common/assets/images/picto-community.svg";

export function JoinWebinarsCard() {
  const modals = useModals();

  const onClick = () => modals.open("webinars", {});

  return (

    <div 
      onClick={onClick}
      style={{
        border: "1px solid #dddddd",
        cursor: "pointer",
        width: "222px",
      }}
    >
      <img
        alt=""
        src={WebinardsSvg}
        style={{
          display: "block",
          backgroundColor: "var(--background-alt-blue-france)",
          width: "100%"
        }}
        height={120}
      />
      <p
        className="
          fr-text--sm
          fr-icon-arrow-right-line
          fr-btn--icon-right
          fr-icon--xs
          webinar-card-cta
        "
        fontWeight="500"
        style={{
          margin: 0,
          padding: "16px",
          backgroundColor: "white",
          color: "var(--text-action-high-blue-france)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          whiteSpace: "nowrap"
        }}
      >
        S’inscrire à un webinaire
      </p>
    </div>
  );
}
