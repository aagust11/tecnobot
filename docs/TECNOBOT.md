# TecnoBot: guia d’edició i manteniment

## Arquitectura

Aplicació estàtica amb HTML, CSS i JavaScript natiu. Node només valida, prova i genera `dist/`. No hi ha dependències de tercers ni serveis d’IA. El navegador descarrega `knowledge.json` una vegada i processa les consultes localment.

- `knowledge/<tema>/concepts.json`: contingut, sinònims i relacions.
- `src/engine/`: normalització, similitud i cerca genèriques.
- `src/app.js`: interfície i conversa.
- `src/engine/config.js`: llindars centralitzats.
- `scripts/validate.mjs`: validació de tots els mòduls.
- `scripts/build.mjs`: descobriment automàtic i build estàtic.
- `tests/engine.test.js`: regressions de llenguatge, falsos positius, validació i incorporació de temes.

Les targetes i el xat comparteixen dades. Cada entrada genera una àncora local `#<id>`; «Veure al tema» neteja els filtres i hi mou el focus. Aquesta versió viu íntegrament a `tecnobot`: no injecta codi a `3tec_sa1`.

## Referència visual i pedagògica

Referència de només lectura: `aagust11/3tec_sa1`, commit `929c617150aa0fe3272bd6cec396f61012b7724d`.

S’han consultat `assets/styles.css` i la sobreescriptura final `assets/unit.css`: accent #ad490b, text i capçalera #292f35, fons #f2f4f6, vores #d9dfe4, taronja pàl·lid #fff0e4 i tipografia Arial/Helvetica. Targetes, botons i caixes educatives segueixen aquests criteris.

El glossari, els laboratoris i les activitats de paper i Leonardo han servit per contrastar i ampliar les explicacions. El mòdul registra la procedència a `sources`. No hi ha sincronització: si canvia el temari original, revisa les entrades afectades.

## Cerca i scoring

1. Minúscules, accents i puntuació eliminats, espais normalitzats i abreviacions de tokens complets: `pq`, `xq`, `q`.
2. Eliminació de mots funcionals i reducció lleugera de plurals. No és un analitzador morfològic complet: afegeix variants irregulars a les dades.
3. Índex de títols, conceptes, keywords, expressions, preguntes exemple i sinònims del mòdul. No cal guardar totes les preguntes exactes.
4. Levenshtein normalitzada: `1 − distància / longitud màxima`. No es corregeixen mots diferents de menys de quatre lletres. Per a tokens de fins a cinc lletres es requereix 0,84; per als altres, `fuzzyThreshold` (0,72). Això redueix falsos positius com Messi/massís.
5. Cada token pesa `log(1 + nombreEntrades / freqüència)`. Els termes molt comuns pesen menys. La cobertura és la suma ponderada de similituds dividida pel pes total.
6. Score = `0,78 × cobertura + 0,10 × expressióExacta + 0,12 × semblançaExemple + context`, limitat a 1. La semblança d’exemple és la intersecció de tokens dividida per la mida del conjunt més gran. El context aporta 0,025 només si la cobertura supera 0,3.
7. Sense termes específics (presents en menys del 35% d’entrades) es multiplica el score per 0,35. El context no rescata consultes sense evidència lèxica.

El score és una heurística, **no una probabilitat**. Resposta directa: score ≥ 0,70 i marge ≥ 0,10 respecte del segon candidat. A partir de 0,30 sense complir el criteri anterior: aclariment. Per sota: resposta de no trobat. Errors com `conpresio` poden requerir confirmar el concepte abans de respondre; és deliberat.

El motor no conté condicions específiques d’Estructures. Les comparacions necessiten una entrada comparativa preparada. No genera respostes noves, no interpreta negacions ni raonaments com un LLM. Frases amb molts mots aliens al vocabulari poden quedar sense resposta.

## Esquema

Mòdul: `id`, `title`, `synonyms`, `entries`. `description` i `sources` documenten el contingut.

Entrada: `id`, `module`, `topic`, `title`, `concepts`, `keywords`, `expressions`, `exampleQuestions`, `shortAnswer`, `easyAnswer`, `fullAnswer`, `examples`, `related`, `page`.

Les claus de `synonyms` corresponen a valors de `concepts`. `related` conté IDs existents, també d’altres mòduls. `page` ha de ser exactament `#<id>`, generat pel mateix web. Els textos no admeten HTML.

## Com afegir un nou tema al TecnoBot

Per exemple, Electricitat:

1. Crea `knowledge/electricity/concepts.json` amb aquest mòdul mínim:

```json
{
  "id": "electricity",
  "title": "Electricitat",
  "synonyms": {"voltage": ["voltatge", "diferència de potencial"]},
  "entries": [{
    "id": "electricity.voltage",
    "module": "electricity",
    "topic": "Magnituds elèctriques",
    "title": "Tensió elèctrica",
    "concepts": ["voltage"],
    "keywords": ["tensió", "volts", "pila"],
    "expressions": ["tensió elèctrica"],
    "exampleQuestions": ["què és la tensió elèctrica?"],
    "shortAnswer": "La tensió és la diferència de potencial elèctric entre dos punts. Es mesura en volts.",
    "easyAnswer": "Indica la diferència d’energia per unitat de càrrega entre dos punts.",
    "fullAnswer": "La tensió es mesura entre dos punts. Una pila manté una diferència de potencial entre els terminals. Perquè circuli corrent també cal un camí conductor tancat.",
    "examples": ["Una pila d’1,5 V té una tensió nominal d’1,5 volts."],
    "related": [],
    "page": "#electricity.voltage"
  }]
}
```

2. Afegeix entrades d’intensitat, resistència, llei d’Ohm, sèrie i paral·lel amb IDs únics.
3. Afegeix sinònims i relacions. Distingeix termes ambigus entre temes, com resistència mecànica i elèctrica.
4. Executa `npm run validate-knowledge`, `npm test` i `npm run build`.
5. Afegeix proves reals i negatives. Ampliar el vocabulari pot alterar el rànquing: revisa les regressions.
6. Puja els canvis. No cal modificar motor, UI ni registre. Amb dos mòduls apareix automàticament el selector de tema.

## Conversa, privacitat i seguretat

El text de l’alumne es mostra amb `textContent`, mai amb `innerHTML`. El text lliure només queda en memòria mentre la pàgina és oberta. Per evitar desar dades personals escrites accidentalment, `sessionStorage` conserva únicament IDs de respostes, modes i candidats. En recarregar es recuperen les respostes, però no les preguntes literals. La navegació per àncores conserva tota la conversa en memòria. «Nova conversa» ho esborra tot.

Límit de 60 elements i 800 caràcters per pregunta. Emmagatzematge bloquejat o malformat no impedeix la cerca. Sense analítica, fonts remotes ni telemetria. L’allotjament rep les peticions normals de fitxers; les preguntes no s’hi inclouen.

## Accessibilitat i mòbil

Controls de 44 px com a mínim, focus visible, camps etiquetats, `role=log`, Enter per enviar i Esc per tancar. Panell no modal: no atrapa el teclat. Retorna el focus al control d’origen en tancar. En mòbil ocupa gairebé tota la pantalla, amb `dvh`. Respecta `prefers-reduced-motion`.

## Debug

Obre `?debugChatbot=true`. Cada consulta mostra normalització, tokens, coincidències, scores, marge i decisió en un desplegable al xat i a la consola. No s’envien dades; no es mostra normalment.

## Validació i GitHub Pages

El validador comprova JSON, mòduls i IDs únics, camps, respostes, llistes, sinònims, relacions i pàgines. El build valida abans de generar `dist/`. Assets, imports i `fetch` són relatius: funcionen sota `/tecnobot/` o una altra carpeta.

Configura **Settings → Pages → Source: GitHub Actions**. No cal Vite, backend ni instal·lació npm. El workflow valida els PR i desplega `main`. Si Pages no està activat, el build pot passar i el deploy fallar: activa’l i torna a executar el workflow.

Abans de distribuir l’URL, comprova el desplegament, les preguntes, els aclariments, els botons, els enllaços, la recàrrega, el teclat i el mòbil. A Network, enviar preguntes no ha de generar cap petició externa.
