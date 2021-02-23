---
id: how-to
title: Effectuer une requête à l'API
---

## GraphQL

L'API Mobilic est un service web (basé sur le protocole HTTP) qui utilise le standard [GraphQL](https://graphql.org/). Contrairement aux architectures de type REST où le verbe HTTP et l'URI vont caractériser l'opération, toutes les requêtes à l'API GraphQL partageront le même verbe HTTP `POST` et le même URI.

Cet URI unique dépend de l'environnement :

- > https://api.mobilic.beta.gouv.fr/graphql pour l'environnement de production

- > https://api.sandbox.mobilic.beta.gouv.fr/graphql pour l'environnement bac à sable

Le détail de l'opération sera précisé dans le corps JSON de la requête.

## Exemple simple

Toutes les actions réalisables sur l'API nécessitent d'avoir [créé un compte Mobilic](signup.md), et presque toutes requièrent d'être [authentifié](auth.md).

Pour cet exemple basique, nous allons prendre une opération qui ne requiert pas l'authentification : l'opération de `login`.

Le corps de la requête, au format JSON, doit contenir un champ `query` qui précise l'opération. La valeur de ce champ `query` est pour l'opération `login` :

```
mutation {
    auth {
        login(email: "XXX", password: "YYY") {
            accessToken
    	    refreshToken
  	    }
    }
}
```

Pour constituer le corps JSON de la requête, il suffit de mettre le texte de l'opération dans une chaîne de caractères, en échappant les guillemets à l'aide d'un anti-slash et en remplaçant les sauts de ligne par `\n` :

```json
{
  "query": "mutation {\n  auth {\n    login(email: \"XXX\", password: \"YYY\",) {\n      accessToken\n      refreshToken\n    }\n   }\n}\n"
}
```

> Les valeurs XXX et YYY correspondent respectivement à l'addresse mail et au mot de passe du [compte Mobilic](signup.md), et doivent être remplacées par des valeurs correctes (correspondant à un compte inscrit).

Pour soumettre la requête à l'API il est possible d'utiliser :

- le playground pour une expérience interactive. Voir le [guide du playground](playground.md)
- n'importe quelle librairie HTTP (`curl`, `requests` en `python`, ...)

### Via cURL

Il suffit de constituer le corps JSON de la requête à partir du champ `query`.

```bash
curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data "{ \"query\": \"mutation {\n  auth {\n    login(email: \\\"rayann\\\", password: \\\"rayann\\\",) {\n      accessToken\n      refreshToken\n    }\n   }\n}\n\"}" \
  https://api.sandbox.mobilic.beta.gouv.fr/graphql
```

![curl-example.png](assets/curl-example.png)

Pour plus d'informations sur la manière d'écrire des opérations GraphQL vous pouvez consulter notre [guide sur les opérations GraphQL](graphql.md)
