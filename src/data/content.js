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

export const CROUSTY_CHIPS = ["Doré", "Servi chaud", "Sauce maison", "Ça craque"];

export const MARQUEE_TEXT =
  "PÂTES MAISON  ✦  RIZ CROUSTY  ✦  POULET CROUSTILLANT  ✦  SAUCE GÉNÉREUSE  ✦  ALBI  ✦  LIVRAISON  ✦  ";

// ---- Etapes de construction du plat ----
export const BUILD_STEPS = [
  {
    title: "Une base chaude.",
    desc: "Riz parfumé ou pâtes fraîches, tout juste sortis du feu.",
  },
  {
    title: "Du croustillant.",
    desc: "Poulet doré, tenders, ce craquant qui change tout.",
  },
  {
    title: "Une sauce généreuse.",
    desc: "Crème, curry, tandoori... nappe sans jamais compter.",
  },
  {
    lead: "Et là, ça devient...",
    isLogo: true,
    desc: "Topping, herbes fraîches, et c'est prêt à dévorer.",
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
    desc: "Riz crousty, crème onctueuse, poulet doré. Le réconfort qui croque.",
  },
  {
    name: "Crousty Curry",
    cat: "Riz Crousty",
    price: "11,90 €",
    big: "CURRY",
    img: newCurry,
    glow: "#FFB426",
    desc: "Curry doux et parfumé sur lit de riz crousty. Un classique qui réchauffe.",
  },
  {
    name: "Crousty Tandoori",
    cat: "Riz Crousty",
    price: "11,90 €",
    big: "TANDOORI",
    img: newTandoori,
    glow: "#FF5A1F",
    desc: "Épices tandoori, sauce généreuse, ce croustillant qui claque.",
  },
  {
    name: "Poulet Crème",
    cat: "Les pâtes",
    price: "11,50 €",
    big: "POULET",
    img: newPoulet,
    glow: "#F0D9A8",
    desc: "Crème, poulet tendre, parmesan. Le plat qu'on reprend les yeux fermés.",
  },
  {
    name: "Carbonara",
    cat: "Les pâtes",
    price: "10,90 €",
    big: "CARBO",
    img: newCarbonara,
    glow: "#FFD27A",
    desc: "La vraie, crémeuse et généreuse. Aucune retenue.",
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
    desc: "La touche sucrée croustillante pour finir en beauté.",
  },
];

// ---- Carte complete (accordeon) ----
export const MENU_GROUPS = [
  {
    id: "offers",
    emoji: "🌟",
    title: "Offres",
    items: [
      { name: "Dolce Crousty", price: "12,80", rating: "83", reviews: "12", badge: "1 acheté = 1 offert", desc: "Riz crémeux, poulet bien crousty, sauce maison sucrée et légèrement relevée, oignons frits et un filet de sauce thaï. Un régal à chaque bouchée." },
      { name: "Croc'Cheese", price: "3,20", rating: "70", reviews: "10", badge: "Offert dès 20 €", desc: "Du pain doré et croustillant qui fait crac sous la dent, et un fromage ultra fondant." },
    ],
  },
  {
    id: "riz",
    emoji: "🍚",
    title: "Riz Crousty",
    items: [
      { name: "Curry Crousty", price: "12,80", rating: "94", reviews: "18", desc: "Riz crémeux, poulet bien crousty, oignons frits pour le crunch et une sauce curry envoûtante. Un plat qui vous fera voyager." },
      { name: "Dolce Crousty", price: "12,80", rating: "83", reviews: "12", badge: "1 acheté = 1 offert", desc: "Riz crémeux, poulet bien crousty, sauce maison sucrée et légèrement relevée, oignons frits et un filet de sauce thaï. Un régal à chaque bouchée." },
      { name: "Thaï Crunch Crousty", price: "12,80", rating: "92", reviews: "14", desc: "Riz crémeux, poulet bien crousty, oignons frits pour le crunch et un filet de sauce thaï pour la touche finale. Un vrai banger." },
      { name: "Napo Crousty", price: "12,80", desc: "Riz crémeux, sauce maison crémeuse, poulet bien crousty et ses oignons frits. Pour finir, une touche gourmande de soja sucrée." },
      { name: "Champy Crousty", price: "12,80", desc: "Riz crémeux, champignons et touche bien crousty. Simple, efficace, ça régale." },
    ],
  },
  {
    id: "pasta",
    emoji: "🍝",
    title: "Pasta Crousty",
    items: [
      { name: "Creamy Chicken", price: "12,80", badge: "Popular", desc: "Pâtes nappées de notre sauce maison crémeuse, blanc de poulet tendre, poulet crousty par-dessus et oignons frits pour le crunch. Gourmand et généreux." },
      { name: "Creamy Cheese'n'Bacon", price: "12,80", desc: "Pâtes enrobées de notre sauce fumée au cheddar, bacon, poulet bien crousty et oignons frits. Un plat qui régale fort." },
      { name: "Creamy Carbo", price: "12,80", desc: "Pâtes carbonara bien crémeuses, poulet crousty et oignons frits pour le crunch. Réconfortant du début à la fin." },
    ],
  },
  {
    id: "pates",
    emoji: "🍝",
    title: "Pâtes",
    items: [
      { name: "Carbonara", price: "9,40", rating: "79", reviews: "48", desc: "Une sauce crème toute douce, des lardons de veau dorés, et des pâtes prêtes à tout absorber. On oublie tout et on se régale." },
      { name: "Poulet Crème", price: "9,40", rating: "97", reviews: "35", desc: "Des pâtes roulées dans une sauce crème toute douce et des morceaux de poulet tendres. La recette du bonheur en version crémeuse." },
      { name: "America", price: "9,40", rating: "95", reviews: "21", desc: "Sauce au cheddar crémeuse et légèrement fumée, bacon croustillant et oignons frits qui mettent tout le monde d'accord." },
      { name: "Pesto Verde", price: "9,40", desc: "Des pâtes al dente enrobées d'un pesto maison frais, parfumé au basilic et une pointe de parmesan. Impossible d'y résister." },
      { name: "Forestière", price: "9,40", desc: "Pâtes à la sauce forestière aux champignons. Simple et gourmand, le plat qui fait plaisir du début à la fin." },
    ],
  },
  {
    id: "gratin",
    emoji: "🧀",
    title: "Pâtes Gratinées",
    items: [
      { name: "Pâtes Gratinées", price: "11,45", rating: "94", reviews: "17", desc: "Des pâtes bien généreuses, nappées de la sauce de ton choix, recouvertes de fromage fondant et croustillant. Crémeux, cheesy, réconfortant." },
      { name: "Gnocchi'Flett", price: "14,90", rating: "100", reviews: "3", desc: "Gnocchis ultra fondants, oignons confits caramélisés, lardons fumés, crème généreuse et fromage coulant gratiné à la perfection. La street food version montagne." },
    ],
  },
  {
    id: "faim",
    emoji: "😋",
    title: "Une petite faim ?",
    items: [
      { name: "Nems x5", price: "7,60", rating: "88", reviews: "34", desc: "5 nems de poulet bien croustillants, dorés comme il faut, avec une farce savoureuse. Parfait à grignoter ou à partager." },
      { name: "Jalapeños x5", price: "6,00", rating: "92", reviews: "13", desc: "Des jalapeños croustillants garnis de fromage fondant, juste ce qu'il faut de piquant pour réveiller les papilles. Hot & cheesy." },
      { name: "Oignons Rings x6", price: "6,80", rating: "100", reviews: "10", desc: "6 oignons rings ultra crousty, le petit snack qui claque à chaque bouchée. Impossible de n'en manger qu'un." },
      { name: "Bouchées Camembert x5", price: "6,85", rating: "100", reviews: "5", desc: "Du camembert coulant, une panure dorée et croustillante, chaud à cœur et fondant à souhait. Le mélange parfait croustillant & cheesy." },
      { name: "Croc'Cheese", price: "3,20", rating: "70", reviews: "10", badge: "Offert dès 20 €", desc: "Du pain doré et croustillant qui fait crac sous la dent, et un fromage ultra fondant." },
      { name: "Croc'Jambon", price: "3,95", desc: "Du pain bien doré, un morceau de jambon de dinde et un fromage fondant qui coule comme il faut." },
      { name: "Crok'Crousty", price: "6,30", desc: "Version street food : sauce fumée qui claque, poulet crousty, cheddar coulant et dessus gratiné. Un crok qui envoie du lourd." },
      { name: "Toast'Bacon", price: "4,55", desc: "Du pain bien croustillant, du bacon grillé et des tranches de cheddar fondantes. Du croquant, du fondant, du fumé." },
    ],
  },
  {
    id: "gourm",
    emoji: "😎",
    title: "Une gourmandise ?",
    items: [
      { name: "Tarte au Daim", price: "4,50", rating: "100", reviews: "3", desc: "Couches biscuitées, crème onctueuse, nappage chocolat au lait et éclats croquants." },
      { name: "Tiramisu Nutella Maison", price: "6,25" },
      { name: "Tiramisu Spéculos Maison", price: "6,25" },
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
      { name: "Coca Cola Zéro 33cl", price: "2,40" },
    ],
  },
];

export const BADGE_BG = {
  Popular: "var(--orange)",
  "1 acheté = 1 offert": "var(--gold)",
  "Offert dès 20 €": "var(--uber)",
};
export const BADGE_FG = {
  Popular: "#fff",
  "1 acheté = 1 offert": "#1B1206",
  "Offert dès 20 €": "#04130B",
};

// ---- Canaux de commande (3 portes) ----
export const CHANNELS = [
  {
    num: "01",
    kicker: "Le plus rapide",
    title: "Sur place",
    desc: "On s'installe, on dévore. Tables hautes, néon orange, ambiance du soir.",
    glow: "var(--orange)",
    actions: [{ ico: "☎", label: "Appeler", href: LINKS.tel, target: "_self", emph: true }],
  },
  {
    num: "02",
    kicker: "Click & Collect",
    title: "À emporter",
    desc: "On commande, on passe récupérer chaud en 10-15 min. Zéro attente.",
    glow: "var(--gold)",
    actions: [{ ico: "☎", label: "Commander par téléphone", href: LINKS.tel, target: "_self", emph: true }],
  },
  {
    num: "03",
    kicker: "Chez toi",
    title: "En livraison",
    desc: "Livré chaud et croustillant dans tout Albi via tes apps préférées.",
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
// Delays espacés par pas de 0.10 (était 0.07) ; span animation = 0.58.
// Dernier slot à 0.42 → fin animation : 0.42 + 0.58 = 1.00 (aucun scroll vide).
export const TICKETS = [
  // — slot 0.00 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Le riz crousty, une tuerie. Généreux et croustillant. »",    col: "var(--google)", lane: "left",  delay: 0.00, rot: -5, z: 4 },
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Super resto, autant sur la quantité que sur la qualité. »",  col: "var(--google)", lane: "right", delay: 0.00, rot:  4, z: 4 },
  // — slot 0.10 —
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Repas délicieux, bon rapport qualité/prix. »",               col: "var(--deliv)",  lane: "left",  delay: 0.10, rot:  3, z: 4 },
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Very good. Still warm. Yummi! »",                            col: "var(--deliv)",  lane: "right", delay: 0.10, rot: -4, z: 4 },
  // — slot 0.21 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Serveur très agréable, il m'a aidé à choisir. »",            col: "var(--google)", lane: "left",  delay: 0.21, rot: -3, z: 3 },
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Venue de Clermont-Ferrand juste pour leurs pâtes. »",        col: "var(--google)", lane: "right", delay: 0.21, rot:  4, z: 3 },
  // — slot 0.31 —
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Bolognaise excellente ! »",                                  col: "var(--deliv)",  lane: "left",  delay: 0.31, rot: -5, z: 3 },
  { src: "Uber Eats", logo: logoUber,      rate: "4,3 ★", body: "500+ avis. Pâtes, riz crousty et plats généreux sur Albi.",   col: "var(--uber)",   lane: "right", delay: 0.31, rot:  3, z: 3 },
  // — slot 0.42 —
  { src: "Google",    logo: googleLogo,    rate: "5,0 ★", body: "« Plusieurs fois que je viens, toujours aussi contente. »",    col: "var(--google)", lane: "left",  delay: 0.42, rot:  2, z: 2 },
  { src: "Deliveroo", logo: logoDeliveroo, rate: "5,0 ★", body: "« Plats authentiques, livrés chauds. »",                      col: "var(--deliv)",  lane: "right", delay: 0.42, rot: -4, z: 2 },
];

// ---- Boutons du CTA final ----
export const FINAL_BUTTONS = [
  { label: "Uber Eats", href: LINKS.uber, target: "_blank", col: "var(--uber)", emph: false, logo: logoUber },
  { label: "Deliveroo", href: LINKS.deliveroo, target: "_blank", col: "var(--deliv)", emph: false, logo: logoDeliveroo },
  { label: "06 04 65 94 06", ico: "☎", href: LINKS.tel, target: "_self", col: "var(--orange)", emph: true },
];
