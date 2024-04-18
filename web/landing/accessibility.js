import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { Footer } from "./footer";
import Link from "@mui/material/Link";
import { usePageTitle } from "../common/UsePageTitle";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    textAlign: "left"
  }
}));

export default function Accessibility() {
  return [
    <Header key={1} />,
    <AccessibilityDeclaration key={2} />,
    <Footer key={3} />
  ];
}

function AccessibilityDeclaration() {
  usePageTitle("Déclaration d'accessibilité - Mobilic");
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="lg">
      <h1>Déclaration d’accessibilité</h1>
      <p>
        Établie le <span>27 mars 2023</span>.
      </p>
      <p>
        <span>
          Ministère de la Transition écologique, chargé des Transports
        </span>{" "}
        s’engage à rendre son service accessible, conformément à l’article 47 de
        la loi n° 2005-102 du 11 février 2005.
      </p>
      <p>
        Cette déclaration d’accessibilité s’applique à <strong>Mobilic</strong>
        <span>
          {" "}
          (<span>https://mobilic.beta.gouv.fr</span>)
        </span>
        .
      </p>
      <h2>État de conformité</h2>
      <p>
        <strong>Mobilic</strong> est{" "}
        <strong>
          <span data-printfilter="lowercase">non conforme</span>
        </strong>{" "}
        avec le{" "}
        <abbr title="Référentiel général d’amélioration de l’accessibilité">
          RGAA
        </abbr>
        . <span>Le site n’a encore pas été audité.</span>
      </p>
      <h2>Amélioration et contact</h2>
      <p>
        Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
        pouvez contacter le responsable de <span>Mobilic</span> pour être
        orienté vers une alternative accessible ou obtenir le contenu sous une
        autre forme.
      </p>
      <ul className="basic-information feedback h-card">
        <li>
          E-mail&nbsp;:{" "}
          <Link href="mailto:assistance@mobilic.beta.gouv.fr">
            assistance@mobilic.beta.gouv.fr
          </Link>
        </li>

        <li>
          Adresse&nbsp;:{" "}
          <span>
            Ministère de la Transition écologique Direction générale des
            infrastructures, des transports et des mobilités, Bureau du droit
            social dans les transports routiers 1 place Carpeaux, 92800 Puteaux
          </span>
        </li>
      </ul>
      <p>
        Nous essayons de répondre dans les{" "}
        <span>1 jour ouvré via email ou chat</span>.
      </p>
      <h2>Voie de recours</h2>
      <p>
        Cette procédure est à utiliser dans le cas suivant&nbsp;: vous avez
        signalé au responsable du site internet un défaut d’accessibilité qui
        vous empêche d’accéder à un contenu ou à un des services du portail et
        vous n’avez pas obtenu de réponse satisfaisante.
      </p>
      <p>Vous pouvez&nbsp;:</p>
      <ul>
        <li>
          Écrire un message au{" "}
          <Link href="https://formulaire.defenseurdesdroits.fr/">
            Défenseur des droits
          </Link>
        </li>
        <li>
          Contacter{" "}
          <Link href="https://www.defenseurdesdroits.fr/saisir/delegues">
            le délégué du Défenseur des droits dans votre région
          </Link>
        </li>
        <li>
          Envoyer un courrier par la poste (gratuit, ne pas mettre de
          timbre)&nbsp;:
          <br />
          Défenseur des droits
          <br />
          Libre réponse 71120 75342 Paris CEDEX 07
        </li>
      </ul>
      <hr />
      <p>
        Cette déclaration d’accessibilité a été créé le{" "}
        <span>27 mars 2023</span> grâce au{" "}
        <Link href="https://betagouv.github.io/a11y-generateur-declaration/#create">
          Générateur de Déclaration d’Accessibilité de BetaGouv
        </Link>
        .
      </p>
    </Container>
  );
}
