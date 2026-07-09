import React from "react";
import { ManagerImage, WorkerImage } from "common/utils/icons";
import { Header } from "../common/Header";
import { RoleCard } from "../common/RoleCard";
import { RoleSelection } from "../common/RoleSelection";
import { usePageTitle } from "../common/UsePageTitle";
import { Main } from "../common/semantics/Main";

export function SignupSelection() {
  usePageTitle("Inscription - Mobilic");

  return (
    <>
      <Header />
      <Main>
        <RoleSelection title="Quel est votre métier ?">
          <RoleCard
            destination="/signup/user"
            title="Travailleur mobile"
            description="Je suis travailleur mobile et je dois remplir le LIC"
            image={<WorkerImage />}
          />
          <RoleCard
            destination="/signup/admin"
            title="Gestionnaire"
            description="Je suis gestionnaire d'une entreprise de transport"
            image={<ManagerImage />}
          />
        </RoleSelection>
      </Main>
    </>
  );
}
