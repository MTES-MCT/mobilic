---
id: auth
title: Authentification
---

Pour des raisons de sécurité et de traçabilité la plupart des actions effectuables sur l'API nécessitent d'être authentifié.

## Jetons d'accès

L'API Mobilic utilise une authentification par jeton d'accès (`accessToken`) : les requêtes dites authentifiées sont celles qui portent un jeton valide.

### JWT et autorisation

Les jetons utilisés sont des jetons [JWT](https://jwt.io) générés par l'API :

- ils contiennent des informations (en clair) sur l'identité de l'utilisateur
- ils contiennent une heure d'expiration (de l'ordre de quelques heures après la génération du jeton)
- ils sont signés par l'API

Lorsque une requête authentifiée parvient à l'API, celle-ci vérifie la validité du jeton : la signature doit être correcte et le jeton ne doit pas être expiré. Si le jeton est valide l'API considérera que la requête provient de l'utilisateur dont l'identité est contenue dans le jeton.

L'API déterminera ensuite si l'utilisateur est bien autorisé à effectuer l'opération demandée avant de procéder à celle-ci.

### Rafraichissement

A l'expiration du jeton il n'est pas forcément besoin de se ré-authentifier. Le jeton de rafraichissement (`refreshToken`), généré en même temps que le jeton d'accès lors de la dernière authentification, peut être échangé contre un nouveau jeu de jetons (`accessToken` + `refreshToken`). Le jeton de rafraichissement a en effet une durée de validité bien plus grande que le jeton d'accès. En contrepartie il ne peut être soumis qu'une seule fois à l'API.

> Si le jeton de rafraichissement est expiré lui aussi, ou invalide pour toute autre raison, il sera alors nécessaire de se ré-authentifier.

## Comment s'authentifier

Il existe deux manières de s'authentifier, c'est-à-dire de récupérer un jeton d'accès.

### Authentification par mot de passe

L'appelant soumet son mot de passe (et son identifiant) à l'API Mobilic. Si le mot de passe est correct l'API lui renverra un jeton d'accès.

C'est l'opération `login(email, password)`.

### Authentification par protocole OAuth2

L'approche précédente pose problème dans le cas où l'appelant est une application métier qui veut se connecter pour le compte d'un utilisateur final. En effet il faudrait que l'application demande à l'utilisateur son mot de passe et le conserve quelque part, ce qui pose des problèmes de sécurité. Pour pallier à cela il existe des protocoles de délégation d'authentification.

Mobilic implémente un de ces protocoles, le protocole [OAuth2](https://oauth.net/2/), qui évite aux applications métier d'avoir à gérer et stocker les identifiants Mobilic des utilisateurs.
