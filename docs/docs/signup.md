---
id: signup
title: Inscription et rattachement des salariés
---

L'accès aux services de l'API Mobilic nécessite de disposer d'un compte.

## Création de compte

Mobilic met à disposition une plate-forme d'inscription qui sert deux objecifs :

- inscrire des entreprises
- inscrire des personnes

Il n'y a pas besoin pour un logiciel tiers de gérer cette partie, tout se fera sur la plate-forme. Ce choix a été motivé par deux raisons :

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
