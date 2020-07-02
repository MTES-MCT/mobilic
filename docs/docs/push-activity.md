---
id: push-activity
title: Enregistrement des activités en temps réel
---

L'enregistrement en temps réel des activites consiste à transmettre les changements d'activité dès qu'ils se produisent, comme sur un tachygraphe. C'est le principal flux entrant de données de l'API Mobilic.

Nous allons détailler ici les différentes opérations qui permettent de réaliser ces enregistrements.

> Toutes les opérations explicitées ci-après nécessitent une authentification

## Création d'une nouvelle mission

Avant d'enregistrer les activités il est indispensable de créer une mission qui permettra de les regrouper ensemble.

L'opération de création de la mission est la suivante :

```
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

## Enregistrement d'une activité

C'est l'opération principale.

```
mutation {
    activities {
        logActivity(type: InputableActivityTypeEnum!, eventTime: TimeStamp!, missionId: Int!, userTime: TimeStamp) {
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

- `type`, la nature de l'activité (déplacement, travail, accompagnement, pause)
- `eventTime`, l'heure de l'événement (= début de l'activité)
- `missionId`, la mission de laquelle fait partie l'activité
- `userTime`, optionnelle, la vraie heure de début de l'activité dans le cas d'un enregistrement qui n'est pas en temps réel.

## Fin de mission

```
mutation {
    activities {
        endMission(eventTime: TimeStamp!, missionId: Int!) {
            id
            name
        }
    }
}
```
