import React from "react";

import WebinardsSvg from "common/assets/images/webinars.svg";
import { Card } from "./Cards";

export function JoinWebinarsCard() {
  return (
    <Card
      onClick={() => console.log("click")}
      svg={WebinardsSvg}
      buttonTitle="S’inscrire à un webinaire"
    />
  );
}
