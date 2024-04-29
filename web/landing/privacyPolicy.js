import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { Footer } from "./footer";
import Link from "@mui/material/Link";
import { SimpleTable } from "@dataesr/react-dsfr";
import { usePageTitle } from "../common/UsePageTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const dataCustody = [
  {
    "Catégorie de données": "Données relatives aux salariés",
    "Durée de conservation":
      "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998 ou 3 ans à partir du dernier contact avec les salariés"
  },
  {
    "Catégorie de données": "Données relatives aux gestionnaires",
    "Durée de conservation":
      "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998 ou 3 ans à partir du dernier contact avec les gestionnaires"
  },
  {
    "Catégorie de données":
      "Données relatives au temps de travail et de repos des salariés",
    "Durée de conservation":
      "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998 ou 3 ans à partir du dernier contact avec les salariés"
  },
  {
    "Catégorie de données": "Données relatives à la newsletter",
    "Durée de conservation":
      "Jusqu’à la demande de désinscription ou 2 ans à compter du dernier contact"
  },
  {
    "Catégorie de données": "Données relatives aux webinaires",
    "Durée de conservation":
      "Les données sont conservées 2 ans à compter de la fin du webinaire"
  }
];

const ExternalLink = ({ url, text, title }) => (
  <Link
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    title={text ? text : title}
  >
    {text ? text : url}
  </Link>
);

const scalingoLink =
  "https://scalingo.com/fr/contrat-gestion-traitements-donnees-personnelles";
const ovhLink = "https://us.ovhcloud.com/legal/data-processing-agreement/";
const crispLink =
  "https://help.crisp.chat/en/article/how-to-sign-my-gdpr-data-processing-agreement-dpa-1wfmngo/";
const sentryLink = "https://sentry.io/legal/dpa/";
const metabaseLink = "https://www.metabase.com/license/hosting";
const googleLink = "https://cloud.google.com/terms/data-processing-addendum";
const mailjetLink = "https://www.mailjet.com/fr/legal/dpa/";
const brevoLink = "https://www.brevo.com/legal/termsofuse/#annex";
const livestormLink = "https://livestorm.co/fr/rgpd";

const dataInfra = [
  {
    Partenaire: "Scalingo",
    "Traitement réalisé": "Hébergement de la base de données",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={scalingoLink}
        title="Gestion et traitements des données personnelles de Scalingo"
      />
    )
  },
  {
    Partenaire: "OVH",
    "Traitement réalisé": "Hébergement des logs",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={ovhLink}
        title="Gestion et traitements des données personnelles de OVH"
      />
    )
  },
  {
    Partenaire: "Crisp",
    "Traitement réalisé": "Support / Chat",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={crispLink}
        title="Gestion et traitements des données personnelles de Crisp"
      />
    )
  },
  {
    Partenaire: "Sentry",
    "Traitement réalisé": "Tracking d’erreurs",
    "Pays destinataire": "États-Unis",
    Garanties: (
      <ExternalLink
        url={sentryLink}
        title="Gestion et traitements des données personnelles de Sentry"
      />
    )
  },
  {
    Partenaire: "Metabase",
    "Traitement réalisé": "Mesure d’audience",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={metabaseLink}
        title="Gestion et traitements des données personnelles de Metabase"
      />
    )
  },
  {
    Partenaire: "Google",
    "Traitement réalisé": "Publicité",
    "Pays destinataire": "États-Unis",
    Garanties: (
      <ExternalLink
        url={googleLink}
        title="Gestion et traitements des données personnelles de Google"
      />
    )
  },
  {
    Partenaire: "Mailjet",
    "Traitement réalisé": "Envoi d’e-mails / Newsletter",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={mailjetLink}
        title="Gestion et traitements des données personnelles de Mailjet"
      />
    )
  },
  {
    Partenaire: "Brevo",
    "Traitement réalisé": "Envoi d’e-mails / Newsletter",
    "Pays destinataire": "France",
    Garanties: (
      <ExternalLink
        url={brevoLink}
        title="Gestion et traitements des données personnelles de Brevo"
      />
    )
  },
  {
    Partenaire: "Livestorm",
    "Traitement réalisé": "Webinaires",
    "Pays destinataire": "Irlande",
    Garanties: (
      <ExternalLink
        url={livestormLink}
        title="Gestion et traitements des données personnelles de Livestorm"
      />
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
  usePageTitle("Données personnelles - Mobilic");
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="lg">
      <h1>Protection des données personnelles</h1>
      <Stack direction="column" spacing={4}>
        <Box>
          <h2>Qui est responsable de Mobilic ?</h2>
          <p>
            Mobilic, développé au sein de la Fabrique numérique du Ministère de
            la transition écologique, est sous la responsabilité de la Direction
            générale des infrastructures, des transports et des mobilités
            (DGITM). Elle s&lsquo;engage à assurer un traitement de ces données
            conforme au RGPD et à la loi n°7817 du 6 janvier 1978 relative à
            l'informatique, aux fichiers et aux libertés.
          </p>
          <p>
            Mobilic est un service public numérique qui permet le suivi du temps
            de travail des conducteurs dans le transport routier léger et du
            déménagement.
          </p>
        </Box>
        <Box>
          <h2>Pourquoi traitons-nous des données à caractère personnel ?</h2>
          <p>Mobilic traite des données à caractère personnel pour :</p>
          <ul>
            <li>
              Simplifier le suivi et le respect du temps de travail des
              conducteurs et mettre ces données à disposition des gestionnaires
              administratifs des entreprises du secteur des transports routiers
              légers et aux autorités de contrôle.
            </li>
          </ul>
        </Box>
        <Box>
          <h2>
            Quelles sont les données à caractère personnel traitées par Mobilic
            ?
          </h2>
          <ul>
            <li>
              <b>Données relatives aux salariés</b>: nom, prénom, adresse
              e-mail, identifiants France Connect, numéro de téléphone
              professionnel
            </li>
            <li>
              <b>Données relatives aux gestionnaires</b>: nom, prénom, adresse
              e-mail, identifiants France Connect, numéro de téléphone
              professionnel
            </li>
            <li>
              <b>
                Données relatives au temps de travail et de repos des salariés
              </b>
              : lieu de prise et de fin de service, temps d&lsquo;activité
            </li>
            <li>
              <b>Données relatives à la newsletter</b>: adresse e-mail
            </li>
            <li>
              <b>Données relatives aux webinaires</b>: adresse e-mail
            </li>
          </ul>
        </Box>
        <Box>
          <h2>
            Qu&lsquo;est-ce qui nous autorise à traiter des données à caractère
            personnel ?
          </h2>
          <p>
            Mobilic traite des données à caractère personnel en se basant sur
            l&lsquo;exécution d&lsquo;une mission d&lsquo;intérêt public ou
            relevant de l&lsquo;exercice de l&lsquo;autorité publique dont est
            investi le responsable de traitement au sens de l&lsquo;article 6-1
            e) du RGPD.
          </p>
          <p>
            Cette mission d&lsquo;intérêt public est mise en œuvre par les
            articles{" "}
            <ExternalLink
              url="https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000023086525/LEGISCTA000033450345/#LEGISCTA000033450345"
              text="R. 3312-19 et R. 3312-58 du Code des transports"
            />{" "}
            et par l&lsquo;
            <ExternalLink
              url="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000390680"
              text="arrêté du 20 juillet 1998"
            />
            .
          </p>
        </Box>
        <Box>
          <h2>Pendant combien de temps conservons-nous ces données ?</h2>
          <SimpleTable data={dataCustody} />
        </Box>
        <Box>
          <h2>Qui peut avoir accès à ces données ?</h2>
          <p>
            Les accès aux données à caractère personnel sont strictement
            encadrés et juridiquement justifiés. Les personnes suivantes vont
            avoir accès aux données :
          </p>
          <ul>
            <li>Les membres habilités de l&lsquo;équipe Mobilic</li>
            <li>L&lsquo;API Mobilic</li>
            <li>Les contrôleurs</li>
          </ul>
        </Box>
        <Box>
          <h2>Qui nous aide à traiter vos données à caractère personnel ?</h2>
          <p>
            Certaines données sont envoyées à des sous-traitants. Le responsable
            de traitement s&lsquo;est assuré de la mise en œuvre par ses
            sous-traitants de garanties adéquates et du respect de conditions
            strictes de confidentialité, d&lsquo;usage et de protection des
            données.
          </p>
          <SimpleTable data={dataInfra} />
        </Box>
        <Box>
          <h2>Quels sont vos droits ?</h2>
          <p>
            Vous disposez d&lsquo;un droit d&lsquo;accès et de rectification des
            données à caractère personnel qui vous concernent. Vous disposez
            également d&lsquo;un droit d&lsquo;opposition et de limitation du
            traitement de vos données.
          </p>
          <p>
            Pour exercer vos droits ou pour toute question sur le traitement de
            vos données, vous pouvez nous écrire à l&lsquo;adresse suivante :{" "}
            <Link href="mailto:contact@mobilic.beta.gouv.fr">
              contact@mobilic.beta.gouv.fr
            </Link>
            .
          </p>
          <p>
            Vous pouvez également contacter le délégué à la protection des
            données (DPD) du ministère de la Transition écologique et de la
            cohésion des territoires :
          </p>
          <ul>
            <li>
              par mail à{" "}
              <Link href="mailto:dpd.daj.sg@developpement-durable.gouv.fr">
                dpd.daj.sg@developpement-durable.gouv.fr
              </Link>
            </li>
            <li>ou par courrier à l&lsquo;adresse suivante :</li>
            <address>
              <Typography>
                ministère de la Transition écologique et de la cohésion des
                territoires
              </Typography>
              <Typography>
                À l&lsquo;attention du Délégué à la protection des données (DPD)
              </Typography>
              <Typography>SG/DAJ/AJAG1-2</Typography>
              <Typography>92055 La Défense Cedex</Typography>
              <Typography>France</Typography>
            </address>
          </ul>
          <p>
            Si vous estimez, après nous avoir contacter, que vos droits
            Informatiques et Libertés ne sont pas respectés vous pouvez adresser
            une réclamation à la CNIL :
          </p>
          <address>
            <Typography>
              Commission nationale informatique et libertés
            </Typography>
            <Typography>3 place de Fontenoy</Typography>
            <Typography>TSA 80715</Typography>
            <Typography>75334 PARIS CEDEX 07</Typography>
            <Typography>France</Typography>
          </address>
          <p>
            Les modalités de réclamation sont précisées sur le site de la CNIL :{" "}
            <ExternalLink url="https://www.cnil.fr" title="Site de la CNIL" />.
          </p>
        </Box>
        <Box>
          <h2>Cookies et traceurs</h2>
          <p>
            Un cookie est un fichier déposé sur votre terminal lors de la visite
            d&lsquo;un site. Il a pour but de collecter des informations
            relatives à votre navigation et de vous adresser des services
            adaptés à votre terminal (ordinateur, mobile ou tablette).
          </p>
          <p>
            En application de l&lsquo;article 5(3) de la directive 2002/58/CE
            modifiée concernant le traitement des données à caractère personnel
            et la protection de la vie privée dans le secteur des communications
            électroniques, transposée à l&lsquo;article 82 de la loi n°78-17 du
            6 janvier 1978 relative à l&lsquo;informatique, aux fichiers et aux
            libertés, les traceurs ou cookies suivent deux régimes distincts.
          </p>
          <p>
            Les cookies strictement nécessaires au service ou ayant pour
            finalité exclusive de faciliter la communication par voie
            électronique sont dispensés de consentement préalable au titre de
            l&lsquo;article 82 de la loi n°78-17 du 6 janvier 1978.
          </p>
          <p>
            Les cookies n&lsquo;étant pas strictement nécessaires au service ou
            n&lsquo;ayant pas pour finalité exclusive de faciliter la
            communication par voie électronique doivent être consentis par
            l&lsquo;utilisateur.
          </p>
          <p>
            Ce consentement de la personne concernée pour une ou plusieurs
            finalités spécifiques constitue une base légale au sens du RGPD et
            doit être entendu au sens de l'article 6-a du Règlement (UE)
            2016/679 du Parlement européen et du Conseil du 27 avril 2016
            relatif à la protection des personnes physiques à l'égard du
            traitement des données à caractère personnel et à la libre
            circulation de ces données.
          </p>
          <p>
            Mobilic utilise l&lsquo;outil de mesure d&lsquo;audience Matomo,
            configuré en mode exempté et ne nécessitant pas le recueil de votre
            consentement conformément aux recommandations de la CNIL.
          </p>
          <p>
            Toutefois, votre consentement est nécessaire et se matérialise par
            un bandeau cookies s&lsquo;agissant de Crisp et Google Ads.
          </p>
          <p>
            Pour aller plus loin, vous pouvez consulter les fiches proposées par
            la Commission Nationale de l'Informatique et des Libertés (CNIL) :
          </p>
          <ul>
            <li>
              <ExternalLink
                url="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi"
                text="Cookies & traceurs : que dit la loi ?"
              />
            </li>
            <li>
              <ExternalLink
                url="https://www.cnil.fr/fr/cookies-et-autres-traceurs/comment-se-proteger/maitriser-votre-navigateur"
                text="Cookies : les outils pour les maîtriser"
              />
            </li>
          </ul>
        </Box>
      </Stack>
    </Container>
  );
}
