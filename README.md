# TecnoBot

Assistent de Tecnologia i Digitalització per a 3r d’ESO. Cerca local determinista, sense IA, API keys ni enviament de preguntes. Inclou 47 conceptes d’Estructures i una interfície coherent amb [3tec_sa1](https://github.com/aagust11/3tec_sa1).

## Desenvolupament

Requisits: Node.js 22 o posterior. No cal instal·lar dependències.

```sh
npm test
npm run build
npm run dev
```

L’última ordre requereix Python 3 i serveix `dist/` a http://localhost:4173. També pots servir `dist/` amb qualsevol servidor estàtic. No obris l’HTML amb `file://`.

## GitHub Pages

A **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**. El workflow `.github/workflows/pages.yml` executa els tests, valida el coneixement, genera `dist/` i el publica en cada push a `main`. Els pull requests només validen i compilen.

Adreça prevista: https://aagust11.github.io/tecnobot/ (disponible quan Pages estigui activat i el desplegament acabi correctament).

## Afegir temes

Crea `knowledge/<tema>/concepts.json`. El build el descobrirà automàticament. El mateix contingut alimenta les targetes i el xat. Consulta [la guia completa](docs/TECNOBOT.md).

`3tec_sa1` s’ha consultat com a referència, sense modificar-lo. No hi ha sincronització automàtica amb aquell repositori.
