import React from "react";
import { ControllerImage, WorkerImage } from "common/utils/icons";
import { Header } from "../common/Header";
import { usePageTitle } from "../common/UsePageTitle";
import { RoleCard } from "../common/RoleCard";
import { RoleSelection } from "../common/RoleSelection";
import { RegistrationLink } from "../common/RegistrationLink";
import { Main } from "../common/semantics/Main";

export default function LoginSelection() {
  usePageTitle("Connexion - Mobilic");

  return (
    <>
      <Header />
      <Main style={{ textAlign: "center" }}>
        <RoleSelection title="Se connecter en tant que">
          <RoleCard
            destination="/login"
            title="Entreprise ou salarié"
            description="Je suis travailleur mobile ou gestionnaire d'une entreprise de transport"
            image={<WorkerImage />}
          />
          <RoleCard
            destination="/controller-login"
            title="Contrôleur"
            description="Je suis Agent public de l'État et je me connecte à mon espace dédié"
            image={<ControllerImage />}
          />
        </RoleSelection>
        <RegistrationLink />
      </Main>
    </>
  );
}
