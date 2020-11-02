---
id: read-activities
title: Consultation du temps de travail
---

Les données de temps de travail enregistrées dans l'API Mobilic peuvent être consultées par les utilisateurs concernés.

L'API met à disposition trois opérations de consultation :

- pour une mission
- pour un travailleur mobile
- pour une entreprise

## Consultation des données d'une mission

> L'accès aux données de temps de travail d'une mission n'est autorisée que pour les membres de l'entreprise concernée par la mission.

```gql
query {
    mission(id: Int!) {
        name
        activities {
            id
            type
            startTime
            endTime
            userId
        }
        expenditures {
            id
            type
            userId
        }
    }
}
```

La requête retourne la liste des activités associées à la mission (concernant éventuellement plusieurs utilisateurs).

## Consultation des données pour un travailleur mobile

> L'accès complet aux données de temps de travail n'est autorisé que pour les gestionnaires de l'entreprise ou pour l'utilisateur lui-même.

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        missions {
            name
            activities {
                id
                type
                startTime
                endTime
                userId
            }
            expenditures {
                id
                type
                userId
            }
        }
    }
}
```

Dans l'exemple ci-dessus, sous réserve d'un niveau d'autorisation adapté, l'API retournera la liste des missions sur lesquelles le travailleur a enregistré du temps de travail.

Si l'on souhaite uniquement récupérer les activités sans avoir un regroupement par missions, il est possible de requêter directement le champ `activities` :

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        activities {
            id
            type
            startTime
            endTime
            userId
            missionId
        }
    }
}
```

Il est également possible de récupérer le temps de travail déjà calculé par journée.

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        workDays {
            startTime
            endTime
            activityTimers
        }
    }
}
```

## Consultation des données entreprise

Cette opération permet d'accéder à toutes les données de temps de travail propres à l'entreprise, c'est-à-dire toutes les missions qui ont été réalisées par des salariés de l'entreprise.

> L'accès complet à toutes les missions nécessite d'être rattaché en tant que gestionnaire à l'entreprise

```gql
query {
    company(id: Int!) {
        name
        missions {
            id
            name
            activities {
                id
                type
                startTime
                endTime
                userId
            }
            expenditures {
                id
                type
                userId
            }
        }
    }
}
```

Il est également possible de récupérer la liste des membres actuels de l'entreprise.

```gql
query {
    company(id: Int!) {
        name
        users {
            id
            firstName
            lastName
        }
    }
}
```

A l'instar de la consultation des données d'un travailleur mobile il est possible de récupérer le temps de travail déjà agrégé par journée.

```gql
query {
    company(id: Int!) {
        name
        workDays {
            userId
            startTime
            endTime
            activityTimers
        }
    }
}
```

### Cas d'une gestion multi-sociétés

Il est possible de récupérer en une seule requête la liste de toutes les entreprises sur lesquelles l'utilisateur a un droit de gestion, via le champ `adminedCompanies`.

```gql
query {
  me {
    adminedCompanies {
      name
      workDays {
        userId
        startTime
        endTime
        activityTimers
      }
    }
  }
}
```

## Choix de la période d'historique récupérée

Les trois champs permettant de récupérer des données de temps de travail prennent des arguments optionnels pour restreindre la période d'historique :

- le champ `activities(fromTime: TimeStamp, untilTime: TimeStamp)` au niveau d'un travailleur mobile
- le champ `missions(fromTime: TimeStamp, untilTime: TimeStamp)` au niveau d'un travailleur mobile ou d'une entreprise
- le champ `workDays(fromDate: Date, untilDate: Date)` au niveau d'un travailleur mobile ou d'une entreprise

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        activities(fromTime: 1577869200, untilTime: 1578081600) {
            # toutes les activités qui ont eu lien (au moins en partie) entre le 01/01/2020 9h et le 03/01/2020 20h
            id
            type
            startTime
            endTime
            userId
            missionId
        }
    }
}
```

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        missions(fromTime: 1577869200) {
            # toutes les missions pour lesquelles le travailleur mobile a du temps de travail après le 01/01/2020 9h
            name
            activities {
                id
                type
                startTime
                endTime
                userId
            }
            expenditures {
                id
                type
                userId
            }
        }
    }
}
```

```gql
query {
  me {
    adminedCompanies {
      name
      workDays(fromDate: "2020-01-01") {
        # toutes les journées de travail des entreprises concernées à partir du 01/01/2020
        userId
        startTime
        endTime
        activityTimers
      }
    }
  }
}
```

Sur les champs de l'entreprise il existe également un paramètre `limit` qui définit un nombre maximal de missions retournées, en plus du filtre sur les dates. Les missions les plus récentes (dans la période sélectionnée) seront renvoyées.
