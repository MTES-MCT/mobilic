---
id: errors
title: Gestion des erreurs
---

## Convention GraphQL

[Les spécifications GraphQL](https://spec.graphql.org/June2018/#sec-Response-Format) précisent le format général de retour des erreurs : lorsque une requête cause une ou plusieurs erreurs la réponse JSON contiendra un champ `errors`, qui sera une liste non vide des erreurs recontrées.

Si la requête a donné lieu à une exécution la réponse contiendra également un champ `data`, comme dans le cas d'une requête sans erreurs.

On peut distinguer 3 types d'erreurs :

- les erreurs de syntaxe
- les erreurs de schéma
- les erreurs applicatives, qui arrivent pendant l'exécution de la requête

Les erreurs de syntaxe et les erreurs de schéma bloquent l'exécution de la requête : la réponse ne contiendra pas de champ `data`.

## Erreurs de syntaxe

Les erreurs de syntaxe recouvrent toutes les erreurs qui empêchent le parser GraphQL d'interpréter la requête. Le code HTTP de la réponse sera toujours `400`.

On y trouve par exemple les erreurs dans la constitution du JSON :

```http request
POST /api/graphql HTTP/1.1
Host: sandbox.mobilic.beta.gouv.fr
Content-Type: application/json

{"Mauvais JSON"}
```

qui donnera cette réponse :

```http request
HTTP/1.1 400 BAD REQUEST
Content-Type: application/json

{
  "errors": [
    {
      "message":"POST body sent invalid JSON."
    }
  ]
{
```

Il y a également les erreurs de syntaxe GraphQL :

```http request
POST /api/graphql HTTP/1.1
Host: sandbox.mobilic.beta.gouv.fr
Content-Type: application/json

{
  "query": "wrongKeyword"
}
```

Réponse :

```http request
HTTP/1.1 400 BAD REQUEST
Content-Type: application/json

{
  "errors": [
    {
      "message":"Syntax Error GraphQL (1:1) Unexpected Name \"wrongKeyword\"\n\n1: wrongKeyword\n   ^\n",
      "locations": [
        {
          "line":1,
          "column":1
        }
      ]
    }
  ]
}
```

> Dans le [playground](playground.md) les erreurs de syntaxe sont détectées en direct et empêchent la requête d'être soumise à l'API.

## Erreurs de schéma

Les erreurs de schéma concernent les requêtes syntaxiquement correctes mais qui ne respectent pas le schéma des opérations.

Comme la syntaxe est correcte nous ne montrons dans la suite que l'opération GraphQL plutôt que de montrer tout le corps de la requête HTTP. Pour rappel le passage de l'opération GraphQL à la requête `POST` HTTP est expliqué [ici](how-to.md#exemple-simple).

Comme pour les erreurs de syntaxe le code HTTP de la réponse est `400`.

Exemple

```gql
query {
  wrongOperation {
    someField
  }
}
```

Réponse

```json
{
  "errors": [
    {
      "message": "Cannot query field \"wrongOperation\" on type \"Queries\".",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ]
    }
  ]
}
```

### Erreurs de validation des variables

Les erreurs de type sur les variables d'opération sont également considérées comme des erreurs de schéma et donnent lieu aux mêmes réponses.

Exemple

```gql
query {
  user(id: "pas un entier") {
    firstName
  }
}
```

Réponse

```json
{
  "errors": [
    {
      "message": "Argument \"id\" has invalid value \"pas un entier\".\nExpected type \"Int\", found \"pas un entier\".",
      "locations": [
        {
          "line": 2,
          "column": 12
        }
      ]
    }
  ]
}
```

> ⚠ Dans le [playground](playground.md) la réponse retournée par l'API à une requête qui cause une erreur de schéma se retrouve à l'affichage encapsulée dans un champ supplémentaire `error`.

## Erreurs applicatives

Les erreurs applicatives désignent toutes les erreurs qui arrivent lors de l'exécution de la requête.

Le code HTTP de la réponse est `200` pour ce type d'erreurs.

### Résultats partiels

Lorsque des erreurs arrivent à l'exécution la réponse comporte également un champ `data`, qui peut contenir des résultats partiels, en fonction des endroits où sont apparues les erreurs.

Exemple

```gql
query {
  company(id: 1) {
    id
    name
    missions {
      id
    }
  }
}
```

Réponse

```json
{
  "errors": [
    {
      "message": "Unauthorized access to field 'missions' of company object. Actor must be company admin.",
      "locations": [
        {
          "line": 5,
          "column": 5
        }
      ],
      "path": ["company", "missions"],
      "extensions": {
        "code": "AUTHORIZATION_ERROR"
      }
    }
  ],
  "data": {
    "company": {
      "id": 8,
      "name": "Mobilic Team",
      "missions": null
    }
  }
}
```

Dans le cas ci-dessus la réponse a retourné des résultats partiels car une partie de l'opération n'a pas déclenché d'erreur. Pour les parties qui causent des erreurs le champ correspondant dans la réponse aura toujours la valeur `null`.

### Codes erreurs

Chaque erreur applicative comprend un code, situé dans le champ `extensions.code` du dictionnaire de l'erreur. Ces codes servent à classer les erreurs. Voici la liste des codes :

- `INVALID_INPUTS` : mauvaises valeurs prises par les variables d'opération, sans erreurs de type.

- `AUTHENTICATION_ERROR` : données d'authentification manquantes (pas d'en-tête d'autorisation par exemple) ou invalides (mauvais mot de passe, jeton d'accès invalide).

- `AUTHORIZATION_ERROR` : accès interdit à une ressource ou exécution d'une opération pour laquelle l'utilisateur n'a pas les droits.

- `INVALID_TOKEN` : le jeton d'invitation n'est pas valide (dans le cas d'une invitation de rattachement à une entreprise).

- `OVERLAPPING_MISSIONS` : chevauchement de deux missions dans le temps pour un travailleur mobile.

- `ACTIVITY_SEQUENCE_ERROR` : incohérence dans la succession des activités d'une mission pour un travailleur mobile. Exemple : enregistrement d'une activité après la fin de la mission.

- `DUPLICATE_EXPENDITURES` : enregistrement d'un frais en double sur la mission pour un travailleur mobile.

- `OVERLAPPING_EMPLOYMENTS` : chevauchement de deux rattachements à une entreprise pour un travailleur mobile.

- `INVALID_RESOURCE` : impossibilité d'effectuer l'opération demandée sur l'objet. Exemple : suppression d'une activité qui est déjà supprimée.

- `INTERNAL_ERROR` : erreur interne du serveur
