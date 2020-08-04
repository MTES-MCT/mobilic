---
id: read-activities
title: Consultation du temps de travail
---

Les données de temps de travail enregistrées dans l'API Mobilic peuvent être consultées par les utilisateurs concernés.

L'API met à disposition deux opérations de consultation :

- pour une entreprise
- pour un travailleur mobile

## Consultation des données entreprise

Cette opération permet d'accéder à toutes les données de temps de travail propres à l'entreprise, c'est-à-dire toutes les missions qui ont été réalisées par des salariés de l'entreprise.

> L'accès complet à toutes les missions nécessite d'être rattaché en tant que gestionnaire à l'entreprise

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

La structure de la réponse est plutôt simple et contient essentiellement un champ important, `users`, qui permet d'obtenir des informations (dont le temps de travail) sur chacun des membres de l'entreprise.

Les informations accessibles par utilisateur membre sont les mêmes que pour la consultation directe de cet utilisateur. Elles sont détaillées dans le paragraphe suivant.

## Consultation des données travailleur mobile

> L'accès complet aux données de temps de travail n'est autorisé que pour les gestionnaires de l'entreprise ou pour l'utilisateur lui-même.

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        missions {
            activities {
                type
                startTime
                endTime
            }
        }
    }
}
```

Dans l'exemple ci-dessus, sous réserve d'un niveau d'autorisation adapté, l'API retournera la liste des missions du travailleur avec pour chaque missions les activités effectuées par le travailleur.

Si l'on souhaite uniquement récupérer les activités sans avoir un regroupement par missions, il est possible de requêter directement le champ `activities` :

```gql
query {
    user(id: Int!) {
        firstName
        lastName
        activities {
            type
            startTime
            endTime
        }
    }
}
```

Il est également possible de récupérer le temps de travail déjà calculé par journée

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
