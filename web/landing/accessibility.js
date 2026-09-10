import React from "react";
import { Link } from "../common/LinkButton";
import { usePageTitle } from "../common/UsePageTitle";
import { FullPageComponent } from "./components/FullPageComponent";

export default function Accessibility() {
  return (
    <FullPageComponent>
      <AccessibilityDeclaration />
    </FullPageComponent>
  );
}

function AccessibilityDeclaration() {
  usePageTitle("Déclaration d'accessibilité - Mobilic");

  return (
    <>
      <h1>Déclaration d'accessibilité</h1>
      <p>
        Le Ministère de l'Aménagement du territoire et de la Décentralisation
        s'engage à rendre son service Mobilic accessible conformément à
        l'article 47 de la loi n° 2005-102 du 11 février 2005.
      </p>
      <p>
        À cette fin, il met en œuvre la stratégie et les actions suivantes
        :&nbsp;
        <Link to="/schema-pluriannuel">schéma pluriannuel</Link>
      </p>
      <p>
        Cette déclaration d'accessibilité s'applique au site Mobilic (
        <Link href="https://mobilic.beta.gouv.fr">https://mobilic.beta.gouv.fr</Link>).
      </p>

      <h2>État de conformité</h2>
      <p>
        Mobilic est non conforme avec le référentiel général d'amélioration de
        l'accessibilité (RGAA), version 4.1.2.
      </p>

      <h2>Résultat des tests</h2>
      <p>
        Aucun audit de conformité RGAA complet n'a été réalisé à ce jour. Le
        service est donc déclaré non conforme.
      </p>
      <p>
        Un audit interne a été mené en février 2025. Cet audit détecte les
        défauts d'accessibilité les plus évidents à partir d'un échantillon
        des grilles d'évaluation officielles (grille d'évaluation Pidila,
        critères et tests du RGAA). Les non-conformités relevées sont listées
        ci-dessous.
      </p>

      <h2>Contenus non accessibles</h2>
      <p>
        Les contenus listés ci-dessous ne sont pas accessibles pour les
        raisons suivantes.
      </p>

      <h3>Non conformité</h3>
      <p>
        Les non-conformités les plus bloquantes pour les utilisateurs
        concernent les intitulés de liens et d'actions (critères 6.1, 6.2 et
        11.9), l'étiquetage des champs de formulaire (critères 11.1, 11.2 et
        11.5) et la navigation au clavier (critères 12.8 et 12.9).
      </p>

      <div>
        <p>
          Critère 6.1 :{" "}
          <i>Chaque lien est-il explicite (hors cas particuliers) ?</i>
        </p>
        <p>
          Sur la page de connexion salarié, les liens « J'ai oublié mon mot de
          passe » et « Je n'ai pas de mot de passe » constituent en réalité un
          seul lien dont les deux lignes sont séparées par un retour à la
          ligne porteur de sens.
        </p>
      </div>

      <div>
        <p>
          Critère 6.2 :{" "}
          <i>Dans chaque page web, chaque lien a-t-il un intitulé ?</i>
        </p>
        <p>
          Sur la page de mission salarié, les boutons d'édition des activités
          n'ont pas de nom accessible (bouton contenant uniquement une icône
          masquée aux technologies d'assistance). Sur la page d'historique de
          mission, le bouton de téléchargement du détail de mission n'a pas de
          nom accessible ; les jours de la frise n'ont pas de rôle approprié,
          si bien que le texte n'est pas correctement regroupé par jour.
        </p>
      </div>

      <div>
        <p>
          Critère 8.1 :{" "}
          <i>
            Chaque page web est-elle définie par un type de document (balise
            doctype) ?
          </i>
        </p>
        <p>Une page au moins n'est pas définie par un type de document.</p>
      </div>

      <div>
        <p>
          Critère 8.2 :{" "}
          <i>
            Pour chaque page web, le code source généré est-il valide selon
            le type de document spécifié ?
          </i>
        </p>
        <p>
          Le code généré comporte des erreurs de validité : des éléments en
          ligne contiennent des éléments de type bloc, certains boutons
          portent des attributs de lien là où un élément de lien serait
          sémantiquement attendu, et des identifiants sont dupliqués.
        </p>
      </div>

      <div>
        <p>
          Critère 9.1 :{" "}
          <i>
            Dans chaque page web, l'information est-elle structurée par
            l'utilisation appropriée de titres ?
          </i>
        </p>
        <p>
          La hiérarchie des titres présente des ruptures de niveau (sauts
          dans la hiérarchie) et une structuration pas toujours pertinente.
          Pages concernées : connexion salarié, historique des missions.
        </p>
      </div>

      <div>
        <p>
          Critère 10.1 :{" "}
          <i>
            Dans le site web, des feuilles de styles sont-elles utilisées
            pour contrôler la présentation de l'information ?
          </i>
        </p>
      </div>

      <div>
        <p>
          Critère 10.2 :{" "}
          <i>
            Dans chaque page web, le contenu visible porteur d'information
            reste-t-il présent lorsque les feuilles de styles sont
            désactivées ?
          </i>
        </p>
      </div>

      <div>
        <p>
          Critère 10.3 :{" "}
          <i>
            Dans chaque page web, l'information reste-t-elle compréhensible
            lorsque les feuilles de styles sont désactivées ?
          </i>
        </p>
        <p>
          Sur la page des saisies à valider, l'information n'est plus
          compréhensible lorsque les feuilles de styles sont désactivées.
        </p>
      </div>

      <div>
        <p>
          Critère 10.4 :{" "}
          <i>
            Dans chaque page web, le texte reste-t-il lisible lorsque la
            taille des caractères est augmentée jusqu'à 200 %, au moins (hors
            cas particuliers) ?
          </i>
        </p>
        <p>
          Lorsque la taille des caractères est portée à 200 %, une partie du
          contenu n'est plus visible. Pages concernées : mission en cours,
          saisies à valider.
        </p>
      </div>

      <div>
        <p>
          Critère 10.11 :{" "}
          <i>
            Pour chaque page web, les contenus peuvent-ils être présentés
            sans avoir recours à un défilement vertical pour une fenêtre
            ayant une hauteur de 256 px ou à un défilement horizontal pour
            une fenêtre ayant une largeur de 320 px (hors cas particuliers) ?
          </i>
        </p>
        <p>
          Sur la page de connexion, un lien ne peut pas être cliqué car il
          est recouvert par le bouton de support.
        </p>
      </div>

      <div>
        <p>
          Critère 11.1 :{" "}
          <i>Chaque champ de formulaire a-t-il une étiquette ?</i>
        </p>
        <p>
          Sur la page des saisies à valider, les filtres « Tous les groupes »
          et « Tous les salariés » n'ont pas d'étiquette associée.
        </p>
      </div>

      <div>
        <p>
          Critère 11.2 :{" "}
          <i>
            Chaque étiquette associée à un champ de formulaire est-elle
            pertinente (hors cas particuliers) ?
          </i>
        </p>
        <p>
          Sur la page de connexion salarié, les astérisques marquant les
          champs requis ne sont jamais explicitées : aucune mention n'en
          indique la signification.
        </p>
      </div>

      <div>
        <p>
          Critère 11.5 :{" "}
          <i>
            Dans chaque formulaire, les champs de même nature sont-ils
            regroupés, si nécessaire ?
          </i>
        </p>
        <p>
          Les groupes de cases à cocher et de boutons radio (par exemple «
          Qui sont vos coéquipiers ? ») ne sont pas regroupés dans une liste
          de champs porteuse de sens avec sa légende.
        </p>
      </div>

      <div>
        <p>
          Critère 11.9 :{" "}
          <i>
            Dans chaque formulaire, l'intitulé de chaque bouton est-il
            pertinent (hors cas particuliers) ?
          </i>
        </p>
        <p>
          Sur la page de connexion salarié, le bouton de connexion est
          désactivé tant que le formulaire n'est pas rempli, ce qui empêche
          l'utilisateur d'accéder aux messages d'erreur avant la saisie. Sur
          la page des saisies à valider, les lignes de mission cliquables
          contiennent aussi le bouton « Valider », produisant un intitulé peu
          clair qui regroupe le libellé de la mission et l'action (« Mission
          … Valider »).
        </p>
      </div>

      <div>
        <p>
          Critère 12.6 :{" "}
          <i>
            Les zones de regroupement de contenus présentes dans plusieurs
            pages web (zones d'en-tête, de navigation principale, de contenu
            principal, de pied de page et de moteur de recherche)
            peuvent-elles être atteintes ou évitées ?
          </i>
        </p>
      </div>

      <div>
        <p>
          Critère 12.7 :{" "}
          <i>
            Dans chaque page web, un lien d'évitement ou d'accès rapide à la
            zone de contenu principal est-il présent (hors cas
            particuliers) ?
          </i>
        </p>
        <p>
          Aucun lien d'évitement ou d'accès rapide à la zone de contenu
          principal n'est présent. Cette non-conformité concerne l'ensemble
          du service.
        </p>
      </div>

      <div>
        <p>
          Critère 12.8 :{" "}
          <i>Dans chaque page web, l'ordre de tabulation est-il cohérent ?</i>
        </p>
        <p>
          Sur la page d'accueil, l'ordre de tabulation est incohérent : le
          menu est sauté lors de la navigation au clavier. Côté gestionnaire,
          dans le détail d'une mission, lors du passage en édition d'un
          champ, le focus reste sur le bouton au lieu de revenir sur le champ
          concerné, qui le précède pourtant dans l'ordre de lecture.
        </p>
      </div>

      <div>
        <p>
          Critère 12.9 :{" "}
          <i>
            Dans chaque page web, la navigation ne doit pas contenir de piège
            au clavier. Cette règle est-elle respectée ?
          </i>
        </p>
        <p>
          Sur la page de création de mission salarié, le focus est perdu lors
          de la sélection d'un lieu dans la liste déroulante.
        </p>
      </div>

      <p>
        <em>Point d'attention (hors RGAA)</em> : Pour le parcours contrôleur,
        l'accès aux informations repose sur la lecture d'un QR code, ce qui
        suppose une vue suffisante et le matériel approprié. Une alternative
        devrait être proposée.
      </p>

      <h2>Établissement de cette déclaration d'accessibilité</h2>
      <p>Cette déclaration a été établie le 10 septembre 2026.</p>

      <h2>Technologies utilisées pour la réalisation du service</h2>
      <ul>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
        <li>React</li>
        <li>Système de Design de l'État (DSFR)</li>
      </ul>

      <h2>Environnement de test</h2>
      <p>
        Les vérifications de l'audit interne ont été réalisées avec le
        navigateur Chrome.
      </p>

      <h2>Les outils utilisés lors de l'évaluation</h2>
      <ul>
        <li>WAVE (extension et version en ligne)</li>
        <li>Bookmarklet ANDI</li>
        <li>Plugin HeadingsMap</li>
        <li>Bookmarklet a11y-outline</li>
      </ul>

      <h2>Pages du site ayant fait l'objet de la vérification de conformité</h2>
      <ul>
        <li>Page d'accueil</li>
        <li>Connexion salarié</li>
        <li>Mission en cours (salarié)</li>
        <li>Historique de missions (salarié)</li>
        <li>Saisies à valider (gestionnaire)</li>
        <li>Activités (gestionnaire)</li>
        <li>Informations salarié (contrôleur)</li>
        <li>Infractions (contrôleur)</li>
      </ul>

      <h2>Retour d'information et contact</h2>
      <p>
        Si vous n'arrivez pas à accéder à un contenu ou à un service, vous
        pouvez contacter le responsable de Mobilic pour être orienté vers une
        alternative accessible ou obtenir le contenu sous une autre forme.
      </p>

      <p>
        Envoyer un message&nbsp;:{" "}
        <Link href="mailto:contact@mobilic.beta.gouv.fr">
          contact@mobilic.beta.gouv.fr
        </Link>
      </p>

      <h2>Voies de recours</h2>
      <p>Cette procédure est à utiliser dans le cas suivant.</p>
      <p>
        Vous avez signalé au responsable du site internet un défaut
        d'accessibilité qui vous empêche d'accéder à un contenu ou à un des
        services du portail et vous n'avez pas obtenu de réponse
        satisfaisante.
      </p>
      <ul>
        <li>
          Écrire un message au{" "}
          <Link href="https://www.defenseurdesdroits.fr/nous-contacter-355">Défenseur des droits</Link>
        </li>
        <li>
          Contacter{" "}
          <Link href="https://www.defenseurdesdroits.fr/carte-des-delegues">
            le délégué du Défenseur des droits près de chez vous
          </Link>
        </li>
        <li>
          Envoyer un courrier par la poste (gratuit, ne pas mettre de
          timbre)&nbsp;:
          <br />
          Défenseur des droits
          <br />
          Libre réponse 71120
          <br />
          75342 Paris CEDEX 07
        </li>
      </ul>
    </>
  );
}
