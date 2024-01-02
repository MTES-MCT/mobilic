import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { Footer } from "./footer";
import Link from "@mui/material/Link";
import { SimpleTable } from "@dataesr/react-dsfr";
import { usePageTitle } from "../common/UsePageTitle";

const dataCookies = [
  {
    Cookies: "Matomo",
    "Traitement réalisé": "Analyse statistique des activités.",
    "Base juridique": "Article 82 de la loi n°78-17 du 6 janvier 1978 modifiée",
    Garanties: (
      <Link
        href="https://fr.matomo.org/privacy-policy/"
        target="_blank"
        rel="noreferrer"
      >
        https://fr.matomo.org/privacy-policy/
      </Link>
    )
  },
  {
    Cookies: "Typeform",
    "Traitement réalisé":
      "Outil de création de formulaires et d'enquêtes, centrés sur l'expérience utilisateur.",
    "Base juridique": "Consentement",
    Garanties: (
      <Link
        href="https://www.typeform.com/help/s/legal-compliance-8911275305876/"
        target="_blank"
        rel="noreferrer"
      >
        https://www.typeform.com/help/s/legal-compliance-8911275305876/
      </Link>
    )
  },
  {
    Cookies: "Google Ads",
    "Traitement réalisé":
      "Outil de gestion de balises permettant de suivre et mesurer les publicités. Il mesure l'efficacité des campagnes sponsorisées.",
    "Base juridique": "Consentement",
    Garanties: (
      <Link
        href="https://privacy.google.com/intl/fr_fr/businesses/compliance/#!?modal_active=none"
        target="_blank"
        rel="noreferrer"
      >
        https://privacy.google.com/intl/fr_fr/businesses/compliance/#!?modal_active=none
      </Link>
    )
  }
];

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    textAlign: "left"
  }
}));

export default function PrivacyPolicy() {
  return [
    <Header key={1} />,
    <PrivacyPolicyContent key={2} />,
    <Footer key={3} />
  ];
}

function PrivacyPolicyContent() {
  usePageTitle("Gestion des cookies - Mobilic");
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="lg">
      <h1>Gestion des cookies</h1>
      <h2>Cookies</h2>
      <p>
        Un cookie est un fichier déposé sur votre terminal lors de la visite
        d&lsquo;un site. Il a pour but de collecter des informations relatives à
        votre navigation et de vous adresser des services adaptés à votre
        terminal (ordinateur, mobile ou tablette).
      </p>
      <p>
        En application de l’article 5(3) de la directive 2002/58/CE modifiée
        concernant le traitement des données à caractère personnel et la
        protection de la vie privée dans le secteur des communications
        électroniques, transposée à l’article 82 de la loi n°78-17 du 6 janvier
        1978 relative à l’informatique, aux fichiers et aux libertés, les
        traceurs ou cookies suivent deux régimes distincts.
      </p>
      <p>
        Les cookies strictement nécessaires au service ou ayant pour finalité
        exclusive de faciliter la communication par voie électronique sont
        dispensés de consentement préalable au titre de l’article 82 de la loi
        n°78-17 du 6 janvier 1978. Les cookies n’étant pas strictement
        nécessaires au service ou n’ayant pas pour finalité exclusive de
        faciliter la communication par voie électronique doivent être consenti
        par l’utilisateur.
      </p>
      <p>
        Ce consentement de la personne concernée pour une ou plusieurs finalités
        spécifiques constitue une base légale au sens du RGPD et doit être
        entendu au sens de l’article 6-a du Règlement (UE) 2016/679 du Parlement
        européen et du Conseil du 27 avril 2016 relatif à la protection des
        personnes physiques à l’égard du traitement des données à caractère
        personnel et à la libre circulation de ces données.
      </p>
      <p>
        Le site dépose des cookies de mesure d&lsquo;audience (nombre de
        visites, pages consultées), respectant les conditions d&lsquo;exemption
        du consentement de l&lsquo;internaute définies par la recommandation
        &laquo; Cookies &raquo; de la Commission nationale informatique et
        libertés (CNIL). Cela signifie, notamment, que ces cookies ne servent
        qu&lsquo;à la production de statistiques anonymes et ne permettent pas
        de suivre la navigation de l&lsquo;internaute sur d&lsquo;autres sites.
        Le site dépose également des cookies de navigation, aux fins strictement
        techniques, qui ne sont pas conservés. La consultation du site
        n&lsquo;est pas affectée lorsque les utilisateurs utilisent des
        navigateurs désactivant les cookies.
      </p>
      <h2>Quels sont les cookies et traceurs que nous utilisons ?</h2>
      <SimpleTable data={dataCookies} />
      <p style={{ marginTop: "1.5rem" }}>
        <Link
          href="https://matomo.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Matomo
        </Link>{" "}
        est un outil de mesure d&lsquo;audience web{" "}
        <Link
          href="https://matomo.org/free-software/"
          target="_blank"
          rel="noopener noreferrer"
        >
          libre
        </Link>
        , paramétré pour être en conformité avec la{" "}
        <Link
          href="https://www.cnil.fr/fr/solutions-pour-la-mesure-daudience"
          target="_blank"
          rel="noopener noreferrer"
        >
          recommandation « Cookies »
        </Link>{" "}
        de la{" "}
        <abbr title="Commission Nationale de l'Informatique et des Libertés">
          CNIL
        </abbr>
        {/* */}. Cela signifie que votre adresse IP, par exemple, est anonymisée
        avant d&lsquo;être enregistrée. Il est donc impossible d&lsquo;associer
        vos visites sur ce site à votre personne.
      </p>
      <p>Il convient d&lsquo;indiquer que :</p>
      <ul className="fr-list">
        <li>
          Les données collectées ne sont pas recoupées avec d&lsquo;autres
          traitements.
        </li>
        <li>
          Les cookies ne permettent pas de suivre la navigation de
          l&lsquo;internaute sur d&lsquo;autres sites.
        </li>
      </ul>
      <h2>Droit au retrait</h2>

      <p>
        Pour refuser les cookies de Matomo directement sur notre plateforme :
      </p>
      <iframe
        title="matomo-opt-out"
        style={{ border: 0, height: 120, width: "100%" }}
        src="https://stats.beta.gouv.fr/index.php?module=CoreAdminHome&action=optOut&language=fr&backgroundColor=&fontColor=&fontSize=&fontFamily=%22Marianne%22%2C%20arial%2C%20sans-serif"
      />
      <p>
        À tout moment, vous pouvez refuser l&lsquo;utilisation des cookies et
        désactiver le dépôt sur votre ordinateur en utilisant la fonction dédiée
        de votre navigateur (fonction disponible notamment sur Microsoft
        Internet Explorer 11, Google Chrome, Mozilla Firefox, Apple Safari et
        Opera).
      </p>
      <p>
        Pour aller plus loin, vous pouvez consulter les fiches proposées par la
        Commission Nationale de l&lsquo;Informatique et des Libertés (CNIL) :
      </p>
      <ul className="fr-list">
        <li>
          <Link
            href="https://www.cnil.fr/fr/cookies-traceurs-que-dit-la-loi"
            target="_blank"
            rel="noreferrer"
          >
            Cookies et traceurs : que dit la loi ?
          </Link>
        </li>
        <li>
          <Link
            href="https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser"
            target="_blank"
            rel="noreferrer"
          >
            Cookies : les outils pour les maîtriser
          </Link>
        </li>
      </ul>
    </Container>
  );
}
