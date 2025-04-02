import React from "react";

import WebinardsSvg from "common/assets/images/webinars.svg";
import { Card } from "./Cards";
import { useModals } from "common/utils/modals";

export function JoinWebinarsCard() {
  const modals = useModals();

  return (
    <Card
      onClick={() => modals.open("webinars", {})}
      svg={WebinardsSvg}
      buttonTitle="S’inscrire à un webinaire"
    />
  );
}
