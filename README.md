# Napolit'hein Crousty — Site vitrine

Site one-page premium pour **Napolit'hein Crousty**, street food généreuse à Albi
(pâtes maison, riz crousty, sauces maison). Recréé à partir du design source
*Napolithein – Experience* en un vrai projet front-end propre et maintenable.

## Stack

- **Vite** + **React 18** (JavaScript / JSX)
- **Framer Motion** pour les animations pilotées par le scroll
- **CSS pur**, organisé par section dans `src/styles/`

## Lancer le projet

```bash
npm install
npm run dev
```

Le site est alors disponible sur l'URL affichée par Vite (par défaut http://localhost:5173).

### Autres commandes

```bash
npm run build     # build de production dans /dist
npm run preview   # prévisualise le build de production
```

## Structure

```
index.html
vite.config.js
src/
  main.jsx              # point d'entrée React
  App.jsx               # assemble toutes les sections
  data/
    content.js          # toutes les données (carte, plats, liens, avis…)
  hooks/
    useIsMobile.js      # détection responsive (désactive le scroll animé sur mobile)
  components/
    Header.jsx
    HeroCinematic.jsx   # intro cinématique Hero ⇄ Croustillant
    Marquee.jsx
    BuildSection.jsx    # construction du plat couche par couche
    RailSection.jsx     # rail horizontal des incontournables
    MenuSection.jsx     # carte complète (accordéon)
    DoorsSection.jsx    # 3 façons de commander
    ProofSection.jsx    # avis + parallaxe
    AmbianceSection.jsx # le spot à Albi
    FinalCTA.jsx
    Footer.jsx
    Reveal.jsx          # apparition douce au scroll
  styles/               # un fichier CSS par concern
  assets/images/        # visuels extraits du design source
```

## Notes sur les animations

Le prototype d'origine reposait sur un moteur « scroll-lock » qui interceptait la
molette (une cause fréquente de scroll bloqué ou saccadé). Ici, toutes les
animations sont **pilotées par le scroll natif** via `useScroll` / `useTransform`
de Framer Motion, avec des sections `sticky` :

- intro Hero ⇄ Croustillant (fondu, plat qui se transforme, texte qui se révèle) ;
- construction du plat en 4 couches ;
- rail horizontal des plats ;
- parallaxe des avis ;
- apparitions douces (`Reveal`) sur les sections classiques.

Sur mobile / écran tactile, les transformations liées au scroll sont désactivées :
le scroll redevient 100 % natif et les sections s'empilent proprement. Le tout
respecte également `prefers-reduced-motion`.

## Crédit

Design source : *Napolithein – Experience* (Claude Design). Tous les visuels du
dossier `src/assets/images/` proviennent du bundle de design fourni.
