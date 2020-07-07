---
id: push-activity
title: Enregistrement des activités en temps réel
---

L'enregistrement en temps réel des activites consiste à transmettre les changements d'activité dès qu'ils se produisent, comme sur un tachygraphe. C'est le principal flux entrant de données de l'API Mobilic.

Nous allons détailler ici les différentes opérations qui permettent de réaliser ces enregistrements.

> Toutes les opérations explicitées ci-après nécessitent une authentification

## Création d'une nouvelle mission

Avant d'enregistrer les activités il est indispensable de créer une mission à laquelle seront rattachées les activités.

L'opération de création de la mission est la suivante :

```gql
mutation {
    activities {
        createMission(name: "XXX", "companyId: YYY) {
            id
            name
        }
    }
}
```

Il y a deux variables, optionnelles toutes les deux :

- `name`
- `companyId`, qui permet de préciser l'entreprise associée à la mission dans le cas où l'auteur est rattaché à plusieurs entreprises.

> Si une entreprise est donnée via `companyId` il faut que l'auteur y soit rattaché, soit en tant que gestionnaire soit en tant que travailleur. Dans le cas où aucune entreprise n'est précisée la mission est associée à l'entreprise de rattachement principale de l'auteur.

La création de la mission ne déclenche pas le démarrage du chrono de temps de travail : les deux moments sont séparés. Cela permet par exemple à l'exploitant de planifier et de créer à l'avance les missions dans son logiciel métier, qui pourrait ensuite les enregistrer dans l'interface dédiée aux travailleurs mobiles pour leur permettre de renseigner le temps de travail de chaque mission le moment venu.

## Enregistrement d'une activité

C'est l'opération principale.

```gql
mutation {
    activities {
        logActivitySwitch(type: InputableActivityTypeEnum!, switchTime: TimeStamp!, missionId: Int!) {
            output {
                id
                type
                startTime
            }
            nonBlockingErrors
        }
    }
}
```

Elle prend en arguments :

- `type`, la nature de la nouvelle activité (déplacement, travail, accompagnement, pause)
- `switchTime`, l'heure de changement d'activité (= l'heure de l'enregistrement)
- `missionId`, la mission dans laquelle s'inscrit ce changement d'activité

## Fin de mission

L'opération signale la fin de la dernière activité de la mission.

```gql
mutation {
    activities {
        endMission(missionId: Int!, endTime: TimeStamp!) {
            id
            name
        }
    }
}
```

Les arguments de l'opération sont les mêmes que pour l'enregistrement, sans l'argument `type` et avec `endTime` qui remplace `startTime`.
