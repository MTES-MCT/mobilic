---
id: graphql
title: Syntaxe des opérations GraphQL
---

Nous avons déjà vu comment [construire à partir d'une opération une requête à l'API GraphQL](graphql.md). Nous allons maintenant détailler l'écriture d'une opération.

> Cette page donne un aperçu très condensé du langage de requêtes GraphQL. Pour des informations plus détaillées vous pouvez consulter la [documentation officielle](https://graphql.org/).

Une opération est constituée des éléments suivants :

1. le type de l'opération, toujours précisé en premier
2. l'identifiant de l'opération, c'est-à-dire son chemin dans le graphe des opérations
3. les variables d'opération et leurs valeurs
4. le schéma de la réponse, qui permet de sélectionner le niveau d'informations retournées par l'API.

> La distinction entre 2 et 4 n'existe pas vraiment dans GraphQL, une opération étant vue comme la sélection d'un certain champ dans le graphe entier des opérations

Nous nous servirons de l'opération de `login` pour illustrer chacun de ces constituants :

```gql
mutation {
  auth {
    login(email: "XXX", password: "YYY") {
      accessToken
      refreshToken
    }
  }
}
```

## Type d'opération

L'API Mobilic utilise deux types d'opération définis par le standard GraphQL :

- `query` pour toutes les opérations de lecture qui ne modifient pas l'état du système
- `mutation` pour toutes les opérations qui vont modifier l'état du système (création, édition, suppression)

L'opération de `login` crée un nouveau jeton d'accès, elle est logiquement une `mutation`.

## Identifiant de l'opération

L'opération de `login` a été regroupée avec les autres opérations relatives à l'authentification. Son chemin complet dans les opérations de mutation est `auth -> login`.

## Variables d'opération

Elles sont précisées entre parenthèses à côté de l'opération concernée. Dans le cas de l'opération de `login` il y a deux variables, `email` et `password`.

> Une opération GraphQL peut très bien inclure des variables à plusieurs niveaux de "nesting".

La syntaxe GraphQL permet de définir les variables dans l'opération mais de préciser leurs valeurs en dehors. Par exemple l'opération de `login` peut s'écrire :

```gql
mutation($email: String!, $password: String!) {
  auth {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
}
```

Le corps JSON de la requête HTTP doit alors contenir un champ `variables` qui définit pour chaque variable la valeur à injecter.

## Schéma de la réponse

C'est une fonctionnalité très puissante de GraphQL : la possibilité de personnaliser la réponse de l'API parmi le graphe des objets.

Par exemple pour l'opération de `login` on pourrait ne demander que le jeton d'accès sans le jeton de rafraichissement, comme ceci :

```gql
mutation {
  auth {
    login(email: "XXX", password: "YYY") {
      accessToken
    }
  }
}
```

Ce fonctionnement prend tout son sens pour les objets complexes avec un fort niveau d'imbrication : par exemple une entreprise, auxquels sont rattachés des utilisateurs, qui effectuent des missions, qui elles-mêmes regroupent plusieurs activités. En fonction de ses besoins l'appelant est libre de récupérer un graphe d'objets plus ou moins profond.
