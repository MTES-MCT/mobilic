import React from "react";
import { usePageTitle } from "../common/UsePageTitle";
import { FullPageComponent } from "./components/FullPageComponent";

export default function SchemaPluriannuel() {
  return (
    <FullPageComponent>
      <SchemaPluriannuelContent />
    </FullPageComponent>
  );
}

function SchemaPluriannuelContent() {
  usePageTitle("Schéma pluriannuel d'accessibilité - Mobilic");

  return (
    <>
      <h1>Schéma pluriannuel d'accessibilité</h1>

      <h2>Introduction</h2>
      <p>
        Ce document présente la politique d'accessibilité de la start-up
        d'État <b>Mobilic</b> pour les années <b>2026 à 2029</b>. L'objectif
        principal est d'ancrer l'accessibilité au cœur des pratiques de
        l'équipe produit pour garantir l'accès de nos services à tous,
        conformément à l'article 47 de la loi n° 2005-102.
      </p>
      <p>
        Mobilic permet de lutter contre le travail dissimulé dans le secteur
        du transport routier léger en offrant un outil numérique de suivi du
        temps de travail réglementaire (prévu par l'arrêté du 6 mars 2025) aux
        personnels roulants. Mobilic certifie les temps de travail et assure
        la traçabilité des actions effectuées par les personnels roulants et
        les gestionnaires des entreprises du secteur. Lors d'un contrôle, les
        agents récupèrent les données et peuvent constater les infractions au
        droit social applicable dans le secteur du transport routier léger.
      </p>

      <h2>Périmètre</h2>
      <p>
        L'accessibilité de Mobilic est mesurée et travaillée sur trois
        interfaces distinctes :
      </p>
      <ul>
        <li>
          L'espace <b>salarié</b> est l'outil de saisie des temps de travail
          pour les chauffeurs ;
        </li>
        <li>
          L'espace <b>gestionnaire</b> est l'interface de suivi, de
          validation et de gestion des temps de travail pour les
          gestionnaires d'entreprise ;
        </li>
        <li>
          L'espace <b>de contrôle</b> est l'interface dédiée aux agents de
          contrôle pour vérifier le respect de la réglementation en bord de
          route et en entreprise.
        </li>
      </ul>

      <h2>Ressources humaines et techniques</h2>
      <p>
        Pour construire un service accessible, Mobilic dispose des ressources
        suivantes :
      </p>

      <h3>L'équipe produit</h3>
      <p>
        Les différents membres de la startup d'État interviennent à chaque
        étape du produit selon leur expertise :
      </p>
      <ul>
        <li>
          L'<b>intrapreneur</b> garantit le portage politique auprès de la
          DGITM et sanctuarise le budget nécessaire aux audits et
          développements liés à l'accessibilité.
        </li>
        <li>
          Le <b>chef de produit</b> arbitre et priorise les correctifs
          d'accessibilité directement dans le backlog produit.
        </li>
        <li>
          Le <b>designeur</b> intègre les critères du RGAA (Référentiel
          général d'amélioration de l'accessibilité) dès la phase de
          maquettage (contrastes, hiérarchie visuelle, utilisation de
          composants accessibles).
        </li>
        <li>
          Les <b>développeurs</b> assurent la conformité technique du code
          (accessibilité sémantique, navigation clavier, compatibilité
          lecteurs d'écran).
        </li>
      </ul>

      <h3>Aides externes</h3>
      <p>Mobilic a fait appel et peut s'aider ressources suivantes :</p>
      <ul>
        <li>
          Des <b>prestataires externes</b>, via l'activation des marchés
          publics de la DINUM et de la DNUM du MTEATTL, pour la réalisation
          d'un l'audit de conformité officiel au RGAA.
        </li>
        <li>
          L'appui de la DINUM pour la réalisation d'un{" "}
          <b>diagnostic flash</b> permettant d'estimer de manière partielle
          l'accessibilité du service.
        </li>
        <li>
          Les <b>fonds de financement d'accessibilité</b> de la DINUM (en
          cours)
        </li>
        <li>
          L'écosystème <b>beta.gouv</b>, notamment les canaux d'entraide pour
          l'échange de bonnes pratiques, le partage de retours d'expérience
          et la résolution des blocages techniques ayant été rencontrées par
          d'autres startups d'État.
        </li>
      </ul>

      <h3>Moyens techniques</h3>
      <p>
        Mobilic propose les moyens techniques suivants pour gérer et tester
        l'accessibilité numérique :
      </p>
      <ul>
        <li>
          Le <b>DSFR</b> (le Design System de l'État) : l'utilisation de
          composants standards (formulaires, boutons, navigation) réduit
          l'apparition de défauts d'accessibilité dès la conception.
        </li>
        <li>
          Les <b>tests automatisés</b> : des outils de vérification
          automatiques garantissent la stabilité du site et bloquent les
          éventuels bugs avant de nouvelles mises en production.
        </li>
      </ul>

      <h2>Stratégie de mise en œuvre</h2>

      <h3>Sensibilisation de l'équipe</h3>
      <p>
        L'équipe est pleinement sensibilisée aux contraintes d'accessibilité
        du produit ainsi qu'à l'obligation réglementaire de les appliquer. Au
        quotidien, chacun intègre ces exigences dans son travail et l'équipe
        s'appuie sur la documentation officielle pour prévenir ou résoudre
        les problèmes d'accessibilité dans Mobilic.
      </p>

      <h3>Intégration de l'accessibilité dans le cycle produit</h3>
      <p>
        L'équipe fonctionne selon une organisation agile, structurée autour
        de périodes de développement courtes de quinze jours. Ce cadre permet
        une adaptation régulière des priorités et une réévaluation continue
        de la valeur livrée.
      </p>
      <p>
        En phase de <b>planification</b>, les problèmes d'accessibilité
        identifiés par l'équipe ou issues des audits sont traduits en
        tickets. Ces tickets sont priorisés et intégrés de manière ciblée
        dans les périodes de développement courtes, permettant de concentrer
        l'effort de développement sur la résorption de la dette
        d'accessibilité.
      </p>
      <p>
        En phase de <b>design</b>, le designer utilise les spécifications du
        DSFR et vérifie l'accessibilité des maquettes (contrastes, hiérarchie
        des titres) avant la mise en développement.
      </p>
      <p>
        En phase de <b>développement</b>, les développeurs s'assurent de la
        sémantique HTML et testent la navigation au clavier sur les nouvelles
        fonctionnalités.
      </p>

      <h3>Méthodes de contrôle</h3>
      <p>
        La mise en œuvre de notre stratégie et son évaluation se font de
        manière progressive :
      </p>
      <ul>
        <li>
          En 2025, un premier état des lieux a été dressé grâce à un audit
          interne réalisé avec l'appui de la DINUM.
        </li>
        <li>
          L'équipe est actuellement engagée dans une phase de remédiation
          technique et graphique afin de corriger les défauts
          d'accessibilité prioritaires identifiés.
        </li>
        <li>
          À terme, un audit officiel de certification sera lancé avec un
          prestataire externe spécialisé (via les marchés de la Fabrique
          Numérique) pour valider nos trois espaces (salarié, gestionnaire,
          contrôle). Cet audit vise un objectif de conformité réglementaire
          de 95 % avant la publication de la déclaration d'accessibilité.
        </li>
      </ul>

      <h2>Traitement des retours usagers</h2>
      <p>
        Conformément aux exigences du RGAA, Mobilic permet à tout utilisateur
        de signaler un défaut d'accessibilité afin d'obtenir une alternative
        ou un correctif :
      </p>
      <ul>
        <li>
          Un lien « Accessibilité » est intégré de manière visible dans le
          pied de page de l'application afin de diriger directement
          l'utilisateur vers l'adresse de contact de Mobilic.
        </li>
        <li>
          L'équipe réceptionne et traite l'ensemble des signalements liés à
          un handicap. En cas de blocage technique avéré sur l'outil,
          l'équipe s'engage à fournir une solution alternative ou à
          prioriser la correction de l'anomalie dans les plus brefs délais.
        </li>
        <li>
          Si un utilisateur constate un défaut d'accessibilité qui l'empêche
          d'accéder à un contenu ou à une fonctionnalité essentielle de
          l'application, et qu'il n'obtient pas de réponse rapide après nous
          avoir contactés, il conserve la faculté de saisir le Défenseur des
          droits.
        </li>
      </ul>

      <h2>Bilan des actions passées</h2>
      <p>
        Depuis 2024, l'équipe mobilise ses compétences internes et s'appuie
        sur les outils à sa disposition pour améliorer l'accessibilité du
        service :
      </p>
      <ul>
        <li>
          Une mention d'accessibilité affichant le statut légal{" "}
          <b>non conforme</b> a été publiée dans le pied de page de
          l'application en attendant l'audit réglementaire.
        </li>
        <li>
          La bascule complète sur la bibliothèque <b>React DSFR</b> a permis
          d'automatiser l'accessibilité de la majorité des composants,
          tandis que des développements sont en cours pour finaliser la
          transition sur les parties restantes du produit.
        </li>
        <li>
          L'affichage des <b>messages d'erreur</b> et des astérisques pour
          les champs obligatoires a été amélioré, même si des manques
          persistent sur certains parcours.
        </li>
        <li>La <b>navigation au clavier</b> a été fluidifiée.</li>
        <li>
          La <b>hiérarchie des titres</b> ainsi que les balises des pages ont
          été mises en conformité grâce à une restructuration du code.
        </li>
        <li>
          Les <b>contrastes</b> ont été corrigés et l'affichage des contenus
          lors de l'utilisation du <b>zoom</b> d'écran optimisé pour
          améliorer la lisibilité générale.
        </li>
      </ul>
      <p>
        Un <b>audit interne</b> a été mené par la DINUM en février 2025 sur
        un échantillon représentatif de huit pages clés couvrant nos trois
        profils d'utilisateurs. Ce diagnostic sert de base pour orienter les
        chantiers de développement du plan d'action 2027.
      </p>

      <h2>Plan d'action</h2>
      <p>
        Les chantiers de développement de l'année 2027 se concentreront sur
        la résolution des défauts d'accessibilité identifiées par le
        diagnostic flash de la DINUM, en étendant cette fois l'analyse de
        l'échantillon initial à l'intégralité des écrans de l'outil, afin de
        préparer l'audit de conformité officiel :
      </p>
      <ul>
        <li>
          Les <b>formulaires</b> sont repris pour s'assurer que tous les
          filtres et champs de saisie possèdent une étiquette valide et des
          mentions explicités.
        </li>
        <li>
          Des <b>liens d'évitement</b> et d'accès rapide au contenu
          principal sont intégrés de manière globale sur l'ensemble des
          pages pour faciliter la navigation.
        </li>
        <li>
          Les incohérences de la <b>navigation au clavier</b> sont corrigées
          pour éviter les pertes de focus ou sauts de menus.
        </li>
        <li>
          Les <b>boutons et liens d'action</b> sont modifiés pour s'assurer
          qu'aucun bouton contenant uniquement une icône ne reste masqué aux
          technologies d'assistance.
        </li>
      </ul>
      <p>
        Suite à cette phrase de remédiation, un audit de conformité sera
        planifié auprès d'un prestataire externe spécialisé afin d'évaluer
        le taux de conformité de Mobilic.
      </p>
      <p>
        Une première déclaration d'accessibilité officielle de Mobilic sera
        publiée dès la livraison du rapport d'audit pour atteindre notre
        objectif de 95 % de conformité.
      </p>
    </>
  );
}
