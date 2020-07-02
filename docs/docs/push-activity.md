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
