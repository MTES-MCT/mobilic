import React from "react";
import Container from "@mui/material/Container";
import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import { Footer } from "./footer";
import Link from "@mui/material/Link";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { usePageTitle } from "../common/UsePageTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ExternalLink } from "../common/ExternalLink";

const dataCustodyHeaders = ["Catégorie de données", "Durée de conservation"];
const dataCustody = [
  [
    "Données relatives aux salariés",
    "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998"
  ],
  [
    "Données relatives aux gestionnaires",
    "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998"
  ],
  [
    "Données relatives au temps de travail et de repos des salariés",
    "Les données sont conservées pendant 5 ans, conformément à l’article 5 de l’arrêté du 20 juillet 1998"
  ],
  [
    "Données relatives à la newsletter",
    "Jusqu’à la demande de désinscription ou 2 ans à compter du dernier contact"
  ],
  [
    "Données relatives aux webinaires",
    "Les données sont conservées 2 ans à compter de la fin du webinaire"
  ]
];

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

const dataInfraHeaders = [
  "Partenaire",
  "Traitement réalisé",
  "Pays destinataire",
  "Garanties"
];
const dataInfra = [
  [
    "Scalingo",
    "Hébergement de la base de données",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={scalingoLink} title="Garantie Scalingo" />
  ],
  [
    "OVH",
    "Hébergement des logs",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={ovhLink} title="Garantie OVH" />
  ],
  [
    "Crisp",
    "Support / Chat",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={crispLink} title="Garantie Crisp" />
  ],
  [
    "Sentry",
    "Tracking d’erreurs",
    "États-Unis",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={sentryLink} title="Garantie Sentry" />
  ],
  [
    "Metabase",
    "Mesure d’audience",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={metabaseLink} title="Garantie Metabase" />
  ],
  [
    "Google",
    "Publicité",
    "États-Unis",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={googleLink} title="Garantie Google" />
  ],
  [
    "Mailjet",
    "Envoi d’e-mails / Newsletter",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={mailjetLink} title="Garantie Mailjet" />
  ],
  [
    "Brevo",
    "Envoi d’e-mails / Newsletter",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={brevoLink} title="Garantie Brevo" />
  ],
  [
    "Livestorm",
    "Webinaires",
    "Irlande",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={livestormLink} title="Garantie Livestorm" />
  ]
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
    <Container className={classes.container} maxWidth="xl">
      <h1>Protection des données personnelles</h1>
      <Stack direction="column" spacing={4}>
        <Box>
          <h2>Qui est responsable de Mobilic&nbsp;?</h2>
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
            déménagement afin de lutter contre le travail dissimulé.
          </p>
        </Box>
        <Box>
          <h2>
            Pourquoi traitons-nous des données à caractère personnel&nbsp;?
          </h2>
          <p>Mobilic traite des données à caractère personnel pour&nbsp;:</p>
          <ul>
            <li>
              Lutter contre le travail illégal par un enregistrement certifié
              des temps de travail des personnels roulants de transports
              routiers n&lsquo;entrant pas dans le champ d&lsquo;application du
              règlement (CE) n°561/2006&nbsp;;
            </li>
            <li>
              Enregistrer et assurer le suivi du temps de travail des personnels
              roulants conformément aux obligations énoncées aux articles
              R.3312-19 et R.3312-58 du code des transports&nbsp;;
            </li>
            <li>
              Contrôler le respect des seuils en matière de durée du travail et
              de repos et sanctionner les éventuels dépassements&nbsp;;
            </li>
            <li>
              Permettre la mise en place d&lsquo;une API pour assurer la gestion
              administrative et financière des entreprises, la réception des
              données par les agents habilités conformément à l&lsquo;article
              L3315- 1 du code des transports et l&lsquo;interfaçage avec les
              logiciels tiers de logistiques.
            </li>
          </ul>
        </Box>
        <Box>
          <h2>
            Quelles sont les données à caractère personnel traitées par Mobilic
            &nbsp;?
          </h2>
          <ul>
            <li>
              <b>Données d'état civil, de coordonnées</b> (des personnels
              roulants et gestionnaires)&nbsp;;
            </li>
            <li>
              <b>Données des entreprises</b> (SIRET, raison sociale)&nbsp;;
            </li>
            <li>
              <b>
                Données relatives au temps de travail et de repos des salariés
              </b>
              &nbsp;: lieu de prise et de fin de service, temps
              d&lsquo;activité.
            </li>
          </ul>
        </Box>
        <Box>
          <h2>
            Qu&lsquo;est-ce qui nous autorise à traiter des données à caractère
            personnel&nbsp;?
          </h2>
          <p>
            Le traitement Mobilic est fondé sur l&lsquo;exécution d&lsquo;une
            mission d&lsquo;intérêt public ou relevant de l&lsquo;exercice de
            l&lsquo;autorité publique dont est investi le responsable de
            traitement au sens de l&lsquo;article 6-1 e) du RGPD.
          </p>
        </Box>
        <Box>
          <h2>Pendant combien de temps conservons-nous ces données&nbsp;?</h2>
          <Table data={dataCustody} headers={dataCustodyHeaders} />
        </Box>
        <Box>
          <h2>Qui peut avoir accès à ces données&nbsp;?</h2>
          <p>
            Les accès aux données à caractère personnel sont strictement
            encadrés et juridiquement justifiés. Les personnes suivantes vont
            avoir accès aux données&nbsp;:
          </p>
          <ul>
            <li>Les membres habilités de l&lsquo;équipe Mobilic&nbsp;;</li>
            <li>
              Les chefs d&lsquo;entreprise et les personnels habilités de ces
              entreprises&nbsp;;
            </li>
            <li>
              Les agents mentionnés à l&lsquo;article L.3315-1 du code des
              transports dans les conditions prévues aux articles R.3312-19 et
              R.3312-58 du code des transports&nbsp;;
            </li>
            <li>
              Les personnels habilités des sous-traitants de l&lsquo;équipe
              Mobilic.
            </li>
          </ul>
        </Box>
        <Box>
          <h2>Quelles mesures de sécurité mettons-nous en place&nbsp;?</h2>
          <p>
            Nous mettons en place plusieurs mesures pour sécuriser les
            données&nbsp;:
          </p>
          <li>Chiffrage des documents&nbsp;;</li>
          <li>Cloisonnement des données&nbsp;;</li>
          <li>Mesures de traçabilité&nbsp;;</li>
          <li>Surveillance via un monitoring&nbsp;;</li>
          <li>
            Protection contre les virus, malwares et logiciels espions&nbsp;;
          </li>
          <li>
            Protection des réseaux&nbsp;: mesures de protection de nos
            hébergeurs et connexion SSL (https)&nbsp;;
          </li>
          <li>Sauvegarde&nbsp;;</li>
          <li>
            Mesures restrictives d&lsquo;accès aux données à caractère
            personnel&nbsp;: accès aux données par les agents habilités dans les
            conditions réglementaires prévues.
          </li>
        </Box>
        <Box>
          <h2>
            Qui nous aide à traiter vos données à caractère personnel&nbsp;?
          </h2>
          <p>
            Certaines données sont envoyées à d'autres acteurs, appelés
            "sous-traitants", pour qu'ils nous aident à les manipuler.
            Conformément à l&lsquo;article 28 du RGPD, nous nous assurons
            qu&lsquo;ils respectent strictement leurs obligations en matière de
            protection des données et qu&lsquo;ils apportent des garanties
            suffisantes en matière de sécurité des données.
          </p>
          <Table headers={dataInfraHeaders} data={dataInfra} />
        </Box>
        <Box>
          <h2>Quels sont vos droits&nbsp;?</h2>
          <p>
            Vous disposez d&lsquo;un droit d&lsquo;accès, de rectification et
            d&lsquo;opposition en vertu des articles 15, 16, 18 et 21 du RGPD
            ainsi que les droits prévus par l&lsquo;article 85 de la loi n°78-17
            du 6 janvier 1978 auprès du responsable de traitement, par courriel
            à l&lsquo;adresse suivante{" "}
            <Link href="mailto:contact@mobilic.beta.gouv.fr">
              contact@mobilic.beta.gouv.fr
            </Link>
            .
          </p>
          <p>
            Nous nous engageons à vous répondre dans un délai raisonnable qui ne
            saurait dépasser 1 mois à compter de la réception de votre demande.
          </p>
          <p>
            Pour toute question concernant le traitement de vos données à
            caractère personnel, vous pouvez également contacter le délégué à la
            protection des données du ministère à l&lsquo;adresse
            suivante&nbsp;:
          </p>
          <ul>
            <li>
              par mail à{" "}
              <Link href="mailto:dpd.daj.sg@developpement-durable.gouv.fr">
                dpd.daj.sg@developpement-durable.gouv.fr
              </Link>
              &nbsp;; ou
            </li>
            <li>par courrier à l&lsquo;adresse suivante&nbsp;:</li>
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
            </address>
          </ul>
          <p>
            Dans le cadre de l&lsquo;exercice de vos droits, vous devez
            justifier de votre identité par tout moyen. En cas de doute sur
            votre identité, les services chargés du droit d&lsquo;accès et le
            délégué à la protection des données se réservent le droit de vous
            demander les informations supplémentaires qui leur apparaissent
            nécessaires, y compris la photocopie d&lsquo;un titre
            d&lsquo;identité portant votre signature.
          </p>
          <p>
            Si vous estimez, même après avoir introduit une réclamation auprès
            du responsable de traitement, que vos droits en matière de
            protection des données à caractère personnel ne sont pas respectés,
            vous avez la possibilité d&lsquo;introduire une réclamation auprès
            de la Commission nationale de l&lsquo;informatique et des libertés
            (CNIL) à l&lsquo;adresse suivante&nbsp;:{" "}
            <address>
              3 Place de Fontenoy &#8211; TSA 80715 &#8211; 75334 Paris Cedex 07
            </address>
          </p>
          <p>
            Pour vous aider dans votre démarche, vous trouverez un modèle de
            courrier élaboré par la CNIL ici&nbsp;:{" "}
            <ExternalLink url="https://www.cnil.fr/fr/modele/courrier/exercer-son-droit-dacces" />
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
            doit être entendu au sens de l&#39;article 6-a du Règlement (UE)
            2016/679 du Parlement européen et du Conseil du 27 avril 2016
            relatif à la protection des personnes physiques à l&#39;égard du
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
            la Commission Nationale de l'Informatique et des Libertés
            (CNIL)&nbsp;:
          </p>
          <ul>
            <li>
              <ExternalLink
                url="https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies/que-dit-la-loi"
                text="Cookies & traceurs&nbsp;: que dit la loi&nbsp;?"
              />
            </li>
            <li>
              <ExternalLink
                url="https://www.cnil.fr/fr/cookies-et-autres-traceurs/comment-se-proteger/maitriser-votre-navigateur"
                text="Cookies&nbsp;: les outils pour les maîtriser"
              />
            </li>
          </ul>
        </Box>
      </Stack>
    </Container>
  );
}
