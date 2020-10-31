---
id: principles
title: Philosophie de l'API
---

Dans ses grandes lignes l'API Mobilic est un simple système d'enregistrement des activités, dans un esprit très proche de celui du tachygraphe. L'API agrège pour chaque travailleur mobile la succession de ses activités à partir des informations transmises par les applications métier. Ces dernières peuvent en retour demander à accéder à tout ou partie de la série temporelle.

## Activité

Le concept d'activité est central. Il est caractérisé par :

- l'identité du travailleur mobile qui effectue l'activité
- l'horodatage de début
- l'horodatage de fin
- la nature (déplacement, travail en dehors du véhicule)

Ainsi une activité peut être vue comme une période de la journée d'un travailleur mobile associée à un type de travail. Les temps de repos sont déduits comme étant les creux entre les différentes périodes. L'historique des activités pour un travailleur donné est suffisant pour recalculer les temps de travail (et de repos) agrégés à différentes échelles et ainsi vérifier le respect de la réglementation.

## Mission

La mission permet de regrouper des activités d'un même travailleur ou de travailleurs différents. C'est une notion qui n'a pas d'impact sur la mesure du temps de travail et le contrôle de la réglementation, entièrement basés sur l'activité.

Le concept est plutôt orienté vers les besoins des exploitants :

- pour calculer le temps total réel d'un "chantier", et donc le coût réel, et l'opposer au prix facturé
- pour rendre compte de la notion d'équipe
- pour valider d'un bloc le temps de travail plutôt que activité par activité

## Temps réel

Il existe deux manières d'enregistrer les activités :

1. l'approche en temps réel qui repose sur des événements de changement d'activité. La durée d'une activité n'est déterminée qu'a posteriori, au moment du prochain changement d'activité.

2. l'enregistrement en différé où les activités sont renseignées avec leurs durées, à la manière d'un emploi du temps (ex. : j'ai travaillé de 9h à 12h, de 14h à 17h et entre les deux j'étais en pause).

L'API Mobilic permet de faire les deux mais privilégie fortement l'approche temps réel. La seconde approche est pensée principalement comme un outil de corrections ponctuelles. Dans le mode "temps réel" l'API tient soigneusement compte de l'heure de réception par le serveur des événements, tout en permettant à l'appelant de préciser la véritable heure métier (très utile lorsque les événements ne peuvent pas être soumis tout de suite, pour des raisons de connectivité par exemple).

Ce fonctionnement vise à garantir les avantages suivants :

- en enregistrant les changements d'activité dès qu'ils se produisent on réduit fortement l'imprécision dans la mesure du temps de travail par rapport à une déclaration a posteriori
- le risque de falsification est également atténué

Pour comprendre plus en détail le fonctionnement de l'approche en temps réel voir [Enregistrement des activités](push-activity.md).
