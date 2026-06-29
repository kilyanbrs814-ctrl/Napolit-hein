// =============================================================
// Donnees du site Napolit'hein Crousty
// Centralisees ici pour garder les composants lisibles.
// =============================================================

import logoUber from "../assets/logos/Uber-Eats-Logo.png";
import logoDeliveroo from "../assets/logos/Deliveroo_logo.svg.png";
import googleLogo from "../assets/images/google-logo.png";

import newCreamy from "../assets/images/new-creamy.png";
import newCurry from "../assets/images/new-curry.png";
import newTandoori from "../assets/images/new-tandoori.png";
import newPoulet from "../assets/images/new-pouletcreme.png";
import newCarbonara from "../assets/images/new-carbonara.png";
import newCroccheese from "../assets/images/new-croccheese.png";
import newDolce from "../assets/images/new-dolce.png";

export const LINKS = {
  uber: "https://www.ubereats.com/fr-en/store/napolithein-crousty-albi/TFP4kIGzR1OTwbF96Rrdvw",
  deliveroo: "https://deliveroo.fr/fr/menu/albi/albi-centre-ville/napolithein",
  fb: "https://www.facebook.com/p/Napolithein-Albi-100063365790721/",
  insta: "https://www.instagram.com/napolithein_albi81/",
  tiktok: "https://www.tiktok.com/search?q=napolithein%20albi",
  maps: "https://www.google.com/maps/search/?api=1&query=16+Avenue+Colonel+Teyssier+81000+Albi",
  tel: "tel:0604659406",
};

export const DELIVERY_LOGOS = { uber: logoUber, deliveroo: logoDeliveroo };

// ---- Widgets livraison du hero ----
export const HERO_WIDGETS = [
  {
    brand: "Uber Eats",
    rating: "4,3",
    reviews: "500+ avis",
    href: LINKS.uber,
    logo: logoUber,
    glow: "var(--uber)",
    showBrand: false,
  },
  {
    brand: "Deliveroo",
    rating: "4,4",
    reviews: "71 avis",
    href: LINKS.deliveroo,
    logo: logoDeliveroo,
    glow: "var(--deliv)",
    showBrand: false,
  },
];

export const CROUSTY_CHIPS = ["Dore", "Servi chaud", "Sauce maison", "Ca craque"];

export const MARQUEE_TEXT =
  "PATES MAISON  ✦  RIZ CROUSTY  ✦  POULET CROUSTILLANT  ✦  SAUCE GENEREUSE  ✦  ALBI  ✦  LIVRAISON  ✦  ";

// ---- Etapes de construction du plat ----
export const BUILD_STEPS = [
  {
    title: "Une base chaude.",
    desc: "Riz parfume ou pates fraiches, tout juste sortis du feu.",
  },
  {
    title: "Du croustillant.",
    desc: "Poulet dore, tenders, ce craquant qui change tout.",
  },
  {
    title: "Une sauce genereuse.",
    desc: "Creme, curry, tandoori... nappe sans jamais compter.",
  },
  {
    lead: "Et la, ca devient...",
    isLogo: true,
    desc: "Topping, herbes fraiches, et c'est pret a devorer.",
  },
];

// ---- Plats incontournables (rail horizontal) ----
export const DISHES = [
  {
    name: "Crousty Creamy",
    cat: "Riz Crousty",
    price: "11,90 €",
    big: "CREAMY",
    img: newCreamy,
    glow: "#FF7A3C",
    desc: "Riz crousty, creme onctueuse, poulet dore. Le reconfort qui croque.",
  },
  {
    name: "Crousty Curry",
    cat: "Riz Crousty",
    price: "11,90 €",
    big: "CURRY",
    img: newCurry,
    glow: "#FFB426",
    desc: "Curry doux et parfume sur lit de riz crousty. Un classique qui rechauffe.",
  },
  {
    name: "Crousty Tandoori",
    cat: "Riz Crousty",
    price: "11,90 €",
    big: "TANDOORI",
    img: newTandoori,
    glow: "#FF5A1F",
    desc: "Epices tandoori, sauce genereuse, ce croustillant qui claque.",
  },
  {
    name: "Poulet Creme",
    cat: "Les pates",
    price: "11,50 €",
    big: "POULET",
    img: newPoulet,
    glow: "#F0D9A8",
    desc: "Creme, poulet tendre, parmesan. Le plat qu'on reprend les yeux fermes.",
  },
  {
    name: "Carbonara",
    cat: "Les pates",
    price: "10,90 €",
    big: "CARBO",
    img: newCarbonara,
    glow: "#FFD27A",
    desc: "La vraie, cremeuse et genereuse. Aucune retenue.",
  },
  {
    name: "Croc'Cheese",
    cat: "Petites faims",
    price: "6,50 €",
    big: "CHEESE",
    img: newCroccheese,
    glow: "#FFC04D",
    desc: "Le sandwich fromage fondant qui file. Simple, redoutable.",
  },
  {
    name: "Dolce Crousty",
    cat: "Dessert",
    price: "5,90 €",
    big: "DOLCE",
    img: newDolce,
    glow: "#FFB426",
    desc: "La touche sucree croustillante pour finir en beaute.",
  },
];

// ---- Carte complete (accordeon) ----
export const MENU_GROUPS = [
  {
    id: "offers",
    emoji: "🌟",
    title: "Offers",
    items: [
      { name: "Dolce Crousty", price: "12,80", rating: "83", reviews: "12", badge: "Buy 1, get 1 free", desc: "Riz cremeux, poulet bien crousty, sauce maison sucree et legerement relevee, oignons frits et un filet de sauce thai. Un regal a chaque bouchee." },
      { name: "Croc'Cheese", price: "3,20", rating: "70", reviews: "10", badge: "Free with €20 purchase", desc: "Du pain dore et croustillant qui fait crac sous la dent, et un fromage ultra fondant." },
    ],
  },
  {
    id: "riz",
    emoji: "🍚",
    title: "Riz Crousty",
    items: [
      { name: "Curry Crousty", price: "12,80", rating: "94", reviews: "18", desc: "Riz cremeux, poulet bien crousty, oignons frits pour le crunch et une sauce curry envoutante. Un plat qui vous fera voyager." },
      { name: "Dolce Crousty", price: "12,80", rating: "83", reviews: "12", badge: "Buy 1, get 1 free", desc: "Riz cremeux, poulet bien crousty, sauce maison sucree et legerement relevee, oignons frits et un filet de sauce thai. Un regal a chaque bouchee." },
      { name: "Thai Crunch Crousty", price: "12,80", rating: "92", reviews: "14", desc: "Riz cremeux, poulet bien crousty, oignons frits pour le crunch et un filet de sauce thai pour la touche finale. Un vrai banger." },
      { name: "Napo Crousty", price: "12,80", desc: "Riz cremeux, sauce maison cremeuse, poulet bien crousty et ses oignons frits. Pour finir, une touche gourmande de soja sucree." },
      { name: "Champy Crousty", price: "12,80", desc: "Riz cremeux, champignons et touche bien crousty. Simple, efficace, ca regale." },
    ],
  },
  {
    id: "pasta",
    emoji: "🍝",
    title: "Pasta Crousty",
    items: [
      { name: "Creamy Chicken", price: "12,80", badge: "Popular", desc: "Pates nappees de notre sauce maison cremeuse, blanc de poulet tendre, poulet crousty par-dessus et oignons frits pour le crunch. Gourmand et genereux." },
      { name: "Creamy Cheese'n'Bacon", price: "12,80", desc: "Pates enrobees de notre sauce fumee au cheddar, bacon, poulet bien crousty et oignons frits. Un plat qui regale fort." },
      { name: "Creamy Carbo", price: "12,80", desc: "Pates carbonara bien cremeuses, poulet crousty et oignons frits pour le crunch. Reconfortant du debut a la fin." },
    ],
  },
  {
    id: "pates",
    emoji: "🍝",
    title: "Pates",
    items: [
      { name: "Carbonara", price: "9,40", rating: "79", reviews: "48", desc: "Une sauce creme toute douce, des lardons de veau dores, et des pates pretes a tout absorber. On oublie tout et on se regale." },
      { name: "Poulet Creme", price: "9,40", rating: "97", reviews: "35", desc: "Des pates roulees dans une sauce creme toute douce et des morceaux de poulet tendres. La recette du bonheur en version cremeuse." },
      { name: "America", price: "9,40", rating: "95", reviews: "21", desc: "Sauce au cheddar cremeuse et legerement fumee, bacon croustillant et oignons frits qui mettent tout le monde d'accord." },
      { name: "Pesto Verde", price: "9,40", desc: "Des pates al dente enrobees d'un pesto maison frais, parfume au basilic et une pointe de parmesan. Impossible d'y resister." },
      { name: "Forestiere", price: "9,40", desc: "Pates a la sauce forestiere aux champignons. Simple et gourmand, le plat qui fait plaisir du debut a la fin." },
    ],
  },
  {
    id: "gratin",
    emoji: "🧀",
    title: "Pates Gratinees",
    items: [
      { name: "Pates Gratinees", price: "11,45", rating: "94", reviews: "17", desc: "Des pates bien genereuses, nappees de la sauce de ton choix, recouvertes de fromage fondant et croustillant. Cremeux, cheesy, reconfortant." },
      { name: "Gnocchi'Flett", price: "14,90", rating: "100", reviews: "3", desc: "Gnocchis ultra fondants, oignons confits caramelises, lardons fumes, creme genereuse et fromage coulant gratine a la perfection. La street food version montagne." },
    ],
  },
  {
    id: "faim",
    emoji: "😋",
    title: "Une petite faim ?",
    items: [
      { name: "Nems x5", price: "7,60", rating: "88", reviews: "34", desc: "5 nems de poulet bien croustillants, dores comme il faut, avec une farce savoureuse. Parfait a grignoter ou a partager." },
      { name: "Jalapenos x5", price: "6,00", rating: "92", reviews: "13", desc: "Des jalapenos croustillants garnis de fromage fondant, juste ce qu'il faut de piquant pour reveiller les papilles. Hot & cheesy." },
      { name: "Oignons Rings x6", price: "6,80", rating: "100", reviews: "10", desc: "6 oignons rings ultra crousty, le petit snack qui claque a chaque bouchee. Impossible de n'en manger qu'un." },
      { name: "Bouchees Camembert x5", price: "6,85", rating: "100", reviews: "5", desc: "Du camembert coulant, une panure doree et croustillante, chaud a coeur et fondant a souhait. Le melange parfait croustillant & cheesy." },
      { name: "Croc'Cheese", price: "3,20", rating: "70", reviews: "10", badge: "Free with €20 purchase", desc: "Du pain dore et croustillant qui fait crac sous la dent, et un fromage ultra fondant." },
      { name: "Croc'Jambon", price: "3,95", desc: "Du pain bien dore, un morceau de jambon de dinde et un fromage fondant qui coule comme il faut." },
      { name: "Crok'Crousty", price: "6,30", desc: "Version street food : sauce fumee qui claque, poulet crousty, cheddar coulant et dessus gratine. Un crok qui envoie du lourd." },
      { name: "Toast'Bacon", price: "4,55", desc: "Du pain bien croustillant, du bacon grille et des tranches de cheddar fondantes. Du croquant, du fondant, du fume." },
    ],
  },
  {
    id: "gourm",
    emoji: "😎",
    title: "Une gourmandise ?",
    items: [
      { name: "Tarte au Daim", price: "4,50", rating: "100", reviews: "3", desc: "Couches biscuitees, creme onctueuse, nappage chocolat au lait et eclats croquants." },
      { name: "Tiramisu Nutella Maison", price: "6,25" },
      { name: "Tiramisu Speculos Maison", price: "6,25" },
    ],
  },
  {
    id: "soif",
    emoji: "🥵",
    title: "Une petite soif ?",
    isDrink: true,
    items: [
      { name: "Coca Cola 33cl", price: "2,40", rating: "80", reviews: "20" },
      { name: "Fuzetea 33cl", price: "2,40", rating: "100", reviews: "12" },
      { name: "Coca Cola Cherry 33cl", price: "2,40", rating: "100", reviews: "16" },
      { name: "Eau Cristalline 50cl", price: "1,80", rating: "100", reviews: "6" },
      { name: "Oasis Tropical 33cl", price: "2,40", rating: "100", reviews: "9" },
      { name: "Schweppes Pomme 33cl", price: "2,40", rating: "100", reviews: "4" },
      { name: "Oasis Fraise Framboise 33cl", price: "2,40", rating: "100", reviews: "6" },
      { name: "Oasis Pomme Poire 33cl", price: "2,40", rating: "100", reviews: "6" },
      { name: "Eau Cristalline Gazeuse 50cl", price: "2,40" },
      { name: "7Up Exotique 33cl", price: "2,40" },
      { name: "Coca Cola Vanille 33cl", price: "2,85" },
      { name: "Coca Cola Zero 33cl", price: "2,40" },
    ],
  },
];

export const BADGE_BG = {
  Popular: "var(--orange)",
  "Buy 1, get 1 free": "var(--gold)",
  "Free with €20 purchase": "var(--uber)",
};
export const BADGE_FG = {
  Popular: "#fff",
  "Buy 1, get 1 free": "#1B1206",
  "Free with €20 purchase": "#04130B",
};

// ---- Canaux de commande (3 portes) ----
export const CHANNELS = [
  {
    num: "01",
    kicker: "Le plus rapide",
    title: "Sur place",
    desc: "On s'installe, on devore. Tables hautes, neon orange, ambiance du soir.",
    glow: "var(--orange)",
    actions: [{ ico: "☎", label: "Appeler", href: LINKS.tel, target: "_self", emph: true }],
  },
  {
    num: "02",
    kicker: "Click & Collect",
    title: "A emporter",
    desc: "On commande, on passe recuperer chaud en 10-15 min. Zero attente.",
    glow: "var(--gold)",
    actions: [{ ico: "☎", label: "Commander par telephone", href: LINKS.tel, target: "_self", emph: true }],
  },
  {
    num: "03",
    kicker: "Chez toi",
    title: "En livraison",
    desc: "Livre chaud et croustillant dans tout Albi via tes apps preferees.",
    glow: "var(--uber)",
    actions: [
      { label: "Uber Eats", href: LINKS.uber, target: "_blank", emph: false, col: "var(--uber)", logo: logoUber },
      { label: "Deliveroo", href: LINKS.deliveroo, target: "_blank", emph: false, col: "var(--deliv)", logo: logoDeliveroo },
    ],
  },
];

// ---- Avis / preuve sociale ----
export const PLATFORMS = [
  { name: "Google", rate: "4,7", reviews: "130 avis", logo: googleLogo },
  { name: "Uber Eats", rate: "4,3", reviews: "500+ avis", logo: logoUber },
  { name: "Deliveroo", rate: "4,4", reviews: "71 avis", logo: logoDeliveroo },
];

// Animation timeline : chaque ticket monte depuis le bas, esquive le bloc central
// par son couloir (left/right) et sort hors écran. Aucune position x/y fixe.
// 5 slots de delay × 2 lanes = 10 cartes ; aucun débordement hors de [0,1].
export const TICKETS = [
  // — slot 0.00 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Le riz crousty, une tuerie. Généreux et croustillant. »",    col: "var(--google)", lane: "left",  delay: 0.00, rot: -5, z: 4 },
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Super resto, autant sur la quantité que sur la qualité. »",  col: "var(--google)", lane: "right", delay: 0.00, rot:  4, z: 4 },
  // — slot 0.08 —
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Repas délicieux, bon rapport qualité/prix. »",               col: "var(--deliv)",  lane: "left",  delay: 0.08, rot:  3, z: 4 },
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Very good. Still warm. Yummi! »",                            col: "var(--deliv)",  lane: "right", delay: 0.08, rot: -4, z: 4 },
  // — slot 0.14 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Serveur très agréable, il m'a aidé à choisir. »",            col: "var(--google)", lane: "left",  delay: 0.14, rot: -3, z: 3 },
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Venue de Clermont-Ferrand juste pour leurs pâtes. »",        col: "var(--google)", lane: "right", delay: 0.14, rot:  4, z: 3 },
  // — slot 0.20 —
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Bolognaise excellente ! »",                                  col: "var(--deliv)",  lane: "left",  delay: 0.20, rot: -5, z: 3 },
  { src: "Uber Eats", logo: logoUber,      rate: "4,3 ★", body: "500+ avis. Pâtes, riz crousty et plats généreux sur Albi.",   col: "var(--uber)",   lane: "right", delay: 0.20, rot:  3, z: 3 },
  // — slot 0.26 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Plusieurs fois que je viens, toujours aussi contente. »",    col: "var(--google)", lane: "left",  delay: 0.26, rot:  2, z: 2 },
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Plats authentiques, livrés chauds. »",                      col: "var(--deliv)",  lane: "right", delay: 0.26, rot: -4, z: 2 },
];

// ---- Boutons du CTA final ----
export const FINAL_BUTTONS = [
  { label: "Uber Eats", href: LINKS.uber, target: "_blank", col: "var(--uber)", emph: false, logo: logoUber },
  { label: "Deliveroo", href: LINKS.deliveroo, target: "_blank", col: "var(--deliv)", emph: false, logo: logoDeliveroo },
  { label: "06 04 65 94 06", ico: "☎", href: LINKS.tel, target: "_self", col: "var(--orange)", emph: true },
];
