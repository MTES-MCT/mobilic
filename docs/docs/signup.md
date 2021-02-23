---
id: signup
title: Inscription et rattachement des salariés
---

L'accès aux services de l'API Mobilic nécessite de disposer d'un compte.

## Création de compte

L'inscription se fait sur le site Mobilic, depuis les liens suivants

- [https://mobilic.beta.gouv.fr/signup/admin](https://mobilic.beta.gouv.fr/logout?next=/signup/admin) pour créer des comptes correspondant à de vrais utilisateurs sur l'environnement de production
- [https://sandbox.mobilic.beta.gouv.fr/signup/admin](https://sandbox.mobilic.beta.gouv.fr/logout?next=/signup/admin) pour créer des comptes de test sur l'environnement bac à sable

Il y a 3 étapes à l'inscription :

1. le gestionnaire crée son compte individuel et inscrit son entreprise (depuis les liens ci-dessus).
2. le gestionnaire invite ses salariés en renseignant leurs adresses email depuis son espace entreprise.
3. le salarié crée son compte individuel en suivant les instructions contenues dans l'email d'invitation.

Il est à noter que l'inscription ne peut pas se faire directement par API. Ce choix a été motivé par deux raisons :

- Mobilic a besoin de vérifier par une méthode fiable l'identité des personnes qui s'inscrivent
- Mobilic souhaite que les comptes utilisateurs soient sous la responsabilité des utilisateurs eux-mêmes, et que ce soit eux qui décident d'octroyer aux logiciels métier un droit d'accès via [des protocoles de délégation d'authentification](auth.md)

## Accès API au compte

Pour accéder aux comptes des utilisateurs et effectuer des opérations en leur nom les logiciels métier peuvent avoir besoin de deux éléments :

- [des jetons d'accès à l'API](auth.md)
- les identifiants (ID) Mobilic des comptes, qui peuvent être obtenus par les titulaires des comptes depuis la plate-forme Mobilic

## Rattachement des salariés

Les comptes utilisateurs sont liés à la personne titulaire du compte, indépendemment de son entreprise ou de son métier (travailleur mobile ou gestionnaire). Ainsi une personne qui change d'entreprise garde quand même un seul et même compte.

L'appartenance (variable dans le temps) d'une personne à une entreprise est représentée par un rattachement. Un compte peut avoir plusieurs rattachements dans le temps, au fur et à mesure que la personne passe d'une entreprise à l'autre.

Un compte peut également être rattaché simultanément à plusieurs entreprises, pour répondre au cas fréquent de sociétés soeurs qui peuvent occasionnellement mutualiser leurs travailleurs.

> Par défaut le temps de travail enregistré par un compte travailleur mobile sera associé à l'entreprise à laquelle il est rattaché au moment de l'activité. Si il y a plusieurs rattachements simultanés le rattachement principal (unique) prévaut en l'absence de précision supplémentaire.

Pour des raisons de sécurité le rattachement d'une personne à une entreprise doit être approuvé à la fois par l'entreprise et par le salarié. Cela se fait dans l'ordre suivant :

1. L'entreprise (c'est-à-dire un utilisateur Mobilic qui a les droits d'administration de cette entreprise) effectue une demande de rattachement du salarié par API, en précisant une date de début du rattachement (et optionnellement une date de fin)
2. La demande de rattachement est enregistrée mais reste inactive tant qu'elle n'a pas été approuvée par le salarié
3. Le compte salarié approuve par API la demande de rattachement. Les anciens rattachements sont éventuellement terminés si besoin.
