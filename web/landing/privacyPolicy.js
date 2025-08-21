import React from "react";
import Link from "@mui/material/Link";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { usePageTitle } from "../common/UsePageTitle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ExternalLink } from "../common/ExternalLink";
import { FullPageComponent } from "./components/FullPageComponent";

const dataCustodyHeaders = ["Catégorie de données", "Durée de conservation"];
const dataCustody = [
  [
    "Données d’état civil, de coordonnées, identifiant FranceConnect des personnels roulants et des gestionnaires",
    "Les données sont conservées pendant 3 ans, conformément à l’article 4 de l’arrêté du 6 mars 2025"
  ],
  [
    "Données d’état civil, de coordonnées, identifiant ProConnect des agents de contrôle",
    "Les données sont conservées jusqu’à la désinscription du contrôleur ou un an à compter du dernier contact"
  ],
  [
    "Données des entreprises (SIRET, raison sociale)",
    "Les données sont conservées pendant 3 ans, conformément à l’article 4 de l’arrêté du 6 mars 2025"
  ],
  [
    "Données relatives au temps de travail et de repos des salariés",
    "Les données sont conservées pendant 3 ans, conformément à l’article 4 de l’arrêté du 6 mars 2025"
  ],
  [
    "Données relatives au contrôle",
    <>
      Les données sont conservées :
      <ul>
        <li>un an en cas d’absence d’infraction</li>
        <li>
          trois ans en cas d’infraction donnant lieu à une amende forfaitaire
        </li>
        <li>
          cinq ans en cas d’établissement d’un procès-verbal à compter du
          dernier acte de procédure
        </li>
      </ul>
    </>
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
const scalewayLink =
  "https://www-uploads.scaleway.com/DPA_2024_ENG_b0abb5cc26.pdf";
const crispLink =
  "https://help.crisp.chat/en/article/how-to-sign-my-gdpr-data-processing-agreement-dpa-1wfmngo/";
const sentryLink = "https://sentry.io/legal/dpa/";
const metabaseLink = "https://www.metabase.com/license/hosting";
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
    "Scaleway",
    "Hébergement de photographies des documents",
    "France",
    // eslint-disable-next-line react/jsx-key
    <ExternalLink url={scalewayLink} title="Garantie Scaleway" />
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

export default function PrivacyPolicy() {
  return (
    <FullPageComponent>
      <PrivacyPolicyContent />
    </FullPageComponent>
  );
}

function PrivacyPolicyContent() {
  usePageTitle("Données personnelles - Mobilic");

  return (
    <>
      <h1>Protection des données personnelles</h1>
      <Stack direction="column" spacing={4}>
        <Box>
          <h2>Qui est responsable de Mobilic&nbsp;?</h2>
          <p>
            Mobilic, développé au sein de la Fabrique numérique du Ministère de
            la transition écologique, est sous la responsabilité de la Direction
            générale des infrastructures, des transports et des mobilités
            (DGITM), sous-direction du droit social des transports.
          </p>
          <p>
            Elle s’engage à assurer un traitement de ces données conforme au
            RGPD et à la loi n°7817 du 6 janvier 1978 relative à l'informatique,
            aux fichiers et aux libertés.
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
          <p>
            Mobilic traite des données à caractère personnel en tant que moyen
            de lutter contre le travail dissimulé par un enregistrement certifié
            des temps de travail des personnels roulants de transports routiers
            dont le véhicule n’est pas soumis à un dispositif d’enregistrement
            automatique par tachygraphe.
          </p>
        </Box>
        <Box>
          <h2>
            Quelles sont les données à caractère personnel traitées par Mobilic
            &nbsp;?
          </h2>
          <ul>
            <li>
              <b>
                Données d’état civil, de coordonnées, identifiant FranceConnect,
                identifiant ProConnect
              </b>{" "}
              (des personnels roulants, des gestionnaires et des agents de
              contrôle)&nbsp;;
            </li>
            <li>
              <b>Données des entreprises</b> (SIRET, raison sociale)&nbsp;;
            </li>
            <li>
              <b>
                Données relatives au temps de travail et de repos des salariés
              </b>
              &nbsp;: lieu de prise et de fin de service, date et heure du début
              et fin des différentes tâches (temps de conduite, temps de travail
              autres que la conduite, temps de pause et de repos), numéro
              d’immatriculation, les relevés kilométriques en début et fin de
              service des véhicules utilisés ; les coordonnées GPS ; les notes
              de frais ; les indisponibilités&nbsp;;
            </li>
            <li>
              <b>Données relatives au contrôle</b>&nbsp;: désignation de
              l’opération de contrôle (numéro du bulletin de contrôle, date et
              heure du contrôle), nationalité du personnel roulant ;
              identification du véhicule (plaque d’immatriculation et poids) ;
              immobilisation du véhicule ; nature des infractions ; photographie
              des documents devant se trouver à bord des véhicules de transport
              routier de marchandises ou de voyageurs&nbsp;;
            </li>
            <li>
              <b>Les cookies</b> d’authentification, d’interconnexion avec les
              services gouvernementaux, de mesure d’audience et d’infrastructure
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
            <li>
              les agents de contrôle mentionnés à l’article L.3315-1 du code des
              transports, à l’occasion de contrôles en bord de route, de
              contrôles en entreprise ou suite à une demande expresse adressée à
              l’entreprise&nbsp;;
            </li>
            <li>
              les agents de contrôle mentionnés à l’article L.8271-1-2 du code
              du travail dans la limite de leurs compétences respectives en
              matière de lutte contre travail illégal&nbsp;;
            </li>
            <li>
              les chefs d’entreprise ou leurs représentants assurant le suivi du
              temps de travail&nbsp;;
            </li>
            <li>
              les agents de la direction générale des infrastructures, des
              transports et des mobilités habilités à des fins de maintenance de
              l’application
            </li>
          </ul>
        </Box>
        <Box>
          <h2>Quelles mesures de sécurité mettons-nous en place&nbsp;?</h2>
          <p>
            Nous mettons en place plusieurs mesures pour sécuriser les
            données&nbsp;:
          </p>
          <ul>
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
              personnel&nbsp;: accès aux données par les agents habilités dans
              les conditions réglementaires prévues
            </li>
          </ul>
        </Box>
        <Box>
          <h2>
            Qui nous aide à traiter vos données à caractère personnel&nbsp;?
          </h2>
          <p>
            Certaines des données sont envoyées à d’autres acteurs, appelés
            “sous-traitants”, pour qu’ils nous aident à les manipuler.
            Conformément à l’article 28 du RGPD, nous nous assurons qu’ils
            respectent strictement leurs obligations en matière de protection
            des données et qu’ils apportent des garanties suffisantes en matière
            de sécurité des données.
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
                Ministère de l’Aménagement du territoire et de la
                Décentralisation
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
            un bandeau cookies s&lsquo;agissant de Crisp.
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
    </>
  );
}
