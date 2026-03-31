export const PHASES = [
  {
    id: "warmup",
    label: "Échauffement",
    subtitle: "La Marche des Statuts",
    duration: 600, // seconds
    color: "#4a7c59",
    colorLight: "#e8f5ec",
    emoji: "🏃",
    description: "Activer le corps, libérer les inhibitions, occuper l'espace ensemble.",
    coachActions: [
      "Lancer la marche neutre",
      "Crier les statuts (2 → 9 → 1 → 10 → 3…)",
      "Observer qui s'engage vraiment dans le corps",
      "Laisser 15–20 sec par statut",
    ],
    playerActions: [
      "Remplir tout l'espace sans tourner en rond",
      "Adapter tout le corps, pas juste la tête",
      "Chercher la sensation, pas la comédie",
    ],
  },
  {
    id: "theory",
    label: "Théorie",
    subtitle: "Le Triptyque du Décor",
    duration: 300,
    color: "#b8860b",
    colorLight: "#fdf6e3",
    emoji: "📐",
    description: "Poser le cadre des 3 questions en 5 min, debout en cercle.",
    coachActions: [
      "Debout en cercle — pas de chaises",
      "Présenter chaque question avec un exemple vécu",
      "Faire une démo de 15 sec",
      "Vérifier la compréhension avant de passer",
    ],
    playerActions: [
      "Écouter le cadre",
      "Donner un exemple par question si demandé",
      "Retenir la règle des 20 secondes",
    ],
  },
  {
    id: "solo",
    label: "Exo 1 · Solo",
    subtitle: "L'Objet Révélateur",
    duration: 900,
    color: "#c8440a",
    colorLight: "#fff0e8",
    emoji: "🎭",
    description: "Entrées en scène solos de 45 sec — installer Qui, Quoi, Où sans un mot.",
    coachActions: [
      "Distribuer les contextes à voix basse",
      "Chronométrer 45 sec — couper sans hésiter",
      "Choisir 3 observateurs différents à chaque passage",
      "Garder son feedback à 1 phrase max",
    ],
    playerActions: [
      "Choisir un geste fonctionnel ancré",
      "Travailler la résistance de l'objet imaginaire",
      "Réagir au sol, à l'air, à la lumière",
      "Ne pas expliquer — vivre",
    ],
    observerActions: [
      "Regarder sans parler ni réagir",
      "Formuler mentalement les 3 réponses",
      "Dire « j'ai vu » et non « tu voulais »",
    ],
  },
  {
    id: "duos",
    label: "Exo 2 · Duos",
    subtitle: "Freeze & Read",
    duration: 900,
    color: "#5b8fd4",
    colorLight: "#e8f0fc",
    emoji: "👥",
    description: "Tableaux vivants à deux — Freeze à 30 sec, lecture collective.",
    coachActions: [
      "Chronométrer exactement 30 sec",
      "Crier FREEZE avec autorité",
      "Poser les 4 questions dans l'ordre",
      "Feedback collectif sur l'espace partagé",
    ],
    playerActions: [
      "Poser la relation dans le corps dès l'entrée",
      "Regarder vraiment l'autre",
      "Au Freeze : garder position + regard vivant",
      "Après dégel : les mots confirment, ne corrigent pas",
    ],
    observerActions: [
      "Préparer les 4 réponses pendant le jeu",
      "Répondre par des perceptions concrètes",
      "Signaler si les deux joueurs semblaient dans des univers différents",
    ],
  },
  {
    id: "scenes",
    label: "Exo 3 · Scènes",
    subtitle: "Le Chrono du Décor",
    duration: 900,
    color: "#9b59b6",
    colorLight: "#f4e8ff",
    emoji: "⏱",
    description: "Scènes courtes en trios — le décor doit être lisible en 20 secondes.",
    coachActions: [
      "Donner le contexte à voix haute",
      "Option : crier « Silence ! » à l'improviste",
      "1 remarque par trio max",
      "Gérer le temps global des passages",
    ],
    playerActions: [
      "Objectif : Où en 5 sec, Qui en 10 sec, Quoi en 20 sec",
      "Si Silence ! → le corps continue de jouer",
      "Ne jamais annoncer le contexte",
      "Écouter ce que l'autre installe",
    ],
    observerActions: [
      "Chronomètre mental dès l'entrée",
      "Noter le moment précis de chaque compréhension",
      "Rapport en secondes : concret, sans jugement",
      "1 moment fort + 1 point flou",
    ],
  },
  {
    id: "debrief",
    label: "Bilan",
    subtitle: "Le Cercle de Clôture",
    duration: 300,
    color: "#e67e22",
    colorLight: "#fef0e0",
    emoji: "🔮",
    description: "Ancrer les apprentissages. Chacun repart avec une phrase à lui.",
    coachActions: [
      "Lancer la phrase de clôture dans le cercle",
      "Ne pas commenter chaque réponse",
      "Conclure en 3 phrases max",
      "Tenir le cercle jusqu'au bout",
    ],
    playerActions: [
      "5 mots max — si c'est long c'est la tête qui parle",
      "Habiter physiquement sa phrase",
      "Écouter les autres sans réagir",
    ],
  },
];

export const CONTEXTES_SOLO = [
  { emoji: "👨‍⚕️", label: "Chirurgien en salle d'op" },
  { emoji: "🎄", label: "Enfant le matin de Noël" },
  { emoji: "🔧", label: "Plombier sous un évier" },
  { emoji: "🚀", label: "Astronaute en sortie EVA" },
  { emoji: "🥐", label: "Boulanger à 4h du matin" },
  { emoji: "⚖️", label: "Accusé au tribunal" },
  { emoji: "🎸", label: "Musicien avant de monter sur scène" },
  { emoji: "🌊", label: "Plongeur à 30 mètres de fond" },
  { emoji: "📚", label: "Bibliothécaire en fin de journée" },
  { emoji: "🏔️", label: "Alpiniste à 4000m" },
];

export const CONTEXTES_DUOS = [
  { emoji: "🦷", label: "Dentiste / patient très anxieux" },
  { emoji: "🚀", label: "Deux astronautes avant le décollage" },
  { emoji: "📚", label: "Bibliothécaire / étudiant épuisé" },
  { emoji: "🍳", label: "Chef étoilé / stagiaire maladroit" },
  { emoji: "⚖️", label: "Avocat / client en plein déni" },
  { emoji: "🏕️", label: "Deux randonneurs perdus dans le brouillard" },
  { emoji: "🎭", label: "Metteur en scène / acteur en répétition" },
  { emoji: "🛒", label: "Caissière / client pressé avec des coupons" },
];

export const CONTEXTES_SCENES = [
  { emoji: "🏥", label: "Urgences — médecin, infirmière, patient mystérieux" },
  { emoji: "🎪", label: "Backstage d'un cirque juste avant le spectacle" },
  { emoji: "🌊", label: "Deux plongeurs découvrent quelque chose sous l'eau" },
  { emoji: "🍽️", label: "Grand restaurant — chef, serveur, critique incognito" },
  { emoji: "🚂", label: "Compartiment de train de nuit" },
  { emoji: "🔬", label: "Labo scientifique — expérience qui tourne mal" },
];

export const MANTRAS_JOUEUR = [
  "Je montre, je ne dis pas.",
  "Mon corps sait avant ma tête.",
  "Je réagis à l'espace — sol, air, lumière.",
  "Si je peux couper le mot, je coupe le mot.",
  "Ce que mon partenaire installe est réel pour moi aussi.",
];

export const MANTRAS_COACH = [
  "Je coupe avant que ça s'étire, même si c'est beau.",
  "Mon feedback commence par ce qui a fonctionné.",
  "Je ne donne jamais la réponse pendant qu'ils jouent.",
  "Je parle du corps et de l'espace, pas des intentions.",
  "Le silence après un freeze, c'est moi qui le tiens.",
];

export const MANTRAS_OBS = [
  "Je rapporte ce que j'ai vu, pas ce que j'imagine.",
  "Je chronomètre — les secondes ne mentent pas.",
  "Mon silence pendant le jeu est un acte de respect.",
  "Je commence par ce qui a fonctionné.",
  "Je décris, je ne prescris pas.",
];
