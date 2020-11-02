---
id: changelog
title: Changelog
---

## 29/10/2020

- ajout de paramètres pour [restreindre la période d'historique récupérée](read-activities.md##choix-de-la-période-dhistorique-récupérée) (pour un utilisateur ou une entreprise).
- gestion des erreurs par des [codes erreurs](errors.md).
- simplification du format d'entrée pour les horodatages : passage d'un format en millisecondes à un format en secondes.
- les horodatages de début et de fin d'activité sont désormais arrondis à la minute (inférieure).
- ajout d'un champ `adminedCompanies` sur l'utilisateur, permettant de récupérer la liste des entreprises sur lesquelles l'utilisateur a des droits de gestion.
- ajout d'un champ `workDays` sur l'entreprise, pour récupérer les journées de travail des salariés de l'entreprise
- ajout d'un champ `missions` sur l'entreprise, pour récupérer les missions de l'entreprise.
- les jetons d'accès OAuth ont été rendus permanents (jusqu'à révocation par l'utilisateur) : il n'y a plus de date d'expiration.
- harmonisation des opérations qui ne retournent aucun résultat via la création d'un type `Void`.
- changement de la logique d'enregistrement :
  - distinction entre [deux modes d'enregistrement](push-activity.md#enregistrement-dune-activité) : le mode tachygraphe (enregistrement d'un changement d'activité) et le mode classique (enregistrement d'une période d'activité). L'opération `logActivity` prend désormais un paramètre `switch` permettant de préciser le mode.
  - les identifiants (id) des activités sont maintenant "persistants".
  - l'opération `logActivity` retourne maintenant uniquement l'activité créée (et non plus la liste des activités de la mission).
  - l'opération `editActivity` retourne maintenant uniquement l'activité modifiée (et non plus la liste des activités de la mission).
  - l'opération `cancelActivity` ne retourne plus la liste des activités de la mission.
  - l'opération `logExpenditure` retourne maintenant uniquement le frais créé (et non plus la liste de tous les frais de la mission).
  - l'opération `cancelExpenditure` ne retourne plus la liste des frais de la mission.
- ajout d'un champ `endTime` sur les activités, indiquant la date et l'heure de fin (si renseignées).
- ajout d'un champ `lastUpdateTime` sur les activités, indiquant la date et l'heure de dernière modification.
- ajout d'une opération `mission (id: Int)` de type `query` pour accéder aux informations d'une mission.
