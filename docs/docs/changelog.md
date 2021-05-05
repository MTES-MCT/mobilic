---
id: changelog
title: Changelog
---

# 17/03/2021

### Ajout des lieux de début et prise de service

- ajout de l'entité `BaseAddress` représentant une adresse postale.
- ajout de la mutation `activities.logLocation` pour enregistrer un lieu de début ou fin de mission.
- ajout des champs `startLocation` et `endLocation` sur l'entité `Mission`.

# 02/02/2021

- une mission ne peut plus être validée par un gestionnaire tant qu'elle n'est pas encore terminée par le salarié.
- le salarié est mainetnant notifié par mail lorsque le gestionnaire valide avec modifications une mission.

# 19/01/2021

### Ajout des observations

- nouvelle entité `Comment` représentant une observation faite par un utilisateur à propos d'une mission.
- ajout d'un champ `comments` sur l'entité `Mission`.

### Autres

- ajout d'un paramètre `onlyNonValidatedMissions` du champ `Company.missions`, qui permet de ne récupérer que les missions en attente de validation par un gestionnaire.

# 04/12/2020

### Ajout de champs

- ajout d'un champ `serviceDuration` sur l'entité `WorkDay`, donnant directement l'amplitude de la journée de travail (en secondes).
- ajout d'un champ `totalWorkDuration` sur l'entité `WorkDay`, donnant directement le temps de travail de la journée (en secondes).

# 12/11/2020

### Simplification des types en sortie

- harmonisation des opérations qui ne retournent aucun résultat via la création d'un type `Void`.
- l'opération `logActivity` retourne maintenant uniquement l'activité créée (et non plus la liste des activités de la mission).
- l'opération `editActivity` retourne maintenant uniquement l'activité modifiée (et non plus la liste des activités de la mission).
- l'opération `cancelActivity` ne retourne plus la liste des activités de la mission.
- l'opération `logExpenditure` retourne maintenant uniquement le frais créé (et non plus la liste de tous les frais de la mission).
- l'opération `cancelExpenditure` ne retourne plus la liste des frais de la mission.

# 29/10/2020

### Ajout de champs

- ajout d'un champ `adminedCompanies` sur l'entité `User`, permettant de récupérer la liste des entreprises sur lesquelles l'utilisateur a des droits de gestion.
- ajout d'un champ `workDays` sur l'entité `Company`, pour récupérer les journées de travail des salariés de l'entreprise
- ajout d'un champ `missions` sur l'entité `Company`, pour récupérer les missions de l'entreprise.
- ajout d'un champ `endTime` sur l'entité `Activity`, indiquant la date et l'heure de fin (si renseignées).
- ajout d'un champ `lastUpdateTime` sur l'entité `Activity`, indiquant la date et l'heure de dernière modification.
- ajout d'une opération `mission (id: Int)` de type `query` pour accéder aux informations d'une mission.

### Changement de la logique d'enregistrement

- distinction entre [deux modes d'enregistrement](push-activity.md#enregistrement-dune-activité) : le mode tachygraphe (enregistrement d'un changement d'activité) et le mode classique (enregistrement d'une période d'activité). L'opération `logActivity` prend désormais un paramètre `switch` permettant de préciser le mode.
- les identifiants (id) des activités sont maintenant "persistants".

### Limitation du volume de sortie

- ajout de paramètres pour [restreindre la période d'historique récupérée](read-activities.md#choix-de-la-période-dhistorique-récupérée) (pour un utilisateur ou une entreprise).

### Divers

- gestion des erreurs par des [codes erreurs](errors.md).
- simplification du format d'entrée pour les horodatages : passage d'un format en millisecondes à un format en secondes.
- les horodatages de début et de fin d'activité sont désormais arrondis à la minute (inférieure).
- les jetons d'accès OAuth ont été rendus permanents (jusqu'à révocation par l'utilisateur) : il n'y a plus de date d'expiration.
