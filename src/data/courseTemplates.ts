// ============================================================
// Templates de cours d'improvisation théâtrale
// Application impro-cours — back-office
// ============================================================

export interface CourseTemplate {
  title: string;
  duration: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  description: string;
  objectives: string[];
  phases: {
    title: string;
    duration: number;
    color: string;
    description: string;
    exercises: {
      name: string;
      tag?: string;
      description: string;
      steps: string[];
      tip?: string;
      objectives?: string[];
    }[];
  }[];
}

export const courseTemplates: CourseTemplate[] = [
  // ─────────────────────────────────────────────
  // 1. Le Corps Parle
  // ─────────────────────────────────────────────
  {
    title: 'Le Corps Parle',
    duration: 120,
    level: 'Intermédiaire',
    description:
      'Un atelier centré sur l\'expression corporelle, le mime et le théâtre physique. Les participants explorent comment le corps raconte une histoire sans avoir besoin de mots.',
    objectives: [
      'Développer la conscience corporelle sur scène',
      'Apprendre à communiquer des émotions par le geste',
      'Maîtriser les bases du mime théâtral',
      'Occuper l\'espace scénique avec intention',
    ],
    phases: [
      {
        title: 'Échauffement corporel',
        duration: 20,
        color: '#4a7c59',
        description: 'Préparer le corps et libérer les tensions.',
        exercises: [
          {
            name: 'La Marche des Statuts',
            tag: 'Échauffement',
            description:
              'Les participants marchent dans l\'espace en variant leur statut social de 1 (soumis) à 10 (dominant), guidés par l\'animateur.',
            steps: [
              'Tout le monde marche librement dans l\'espace',
              'L\'animateur annonce un chiffre de 1 à 10',
              'Chacun adapte sa posture, sa démarche et son regard au statut annoncé',
              'Varier les transitions : passer de 2 à 9 brutalement, puis de 8 à 3 progressivement',
              'Terminer par des croisements : deux statuts opposés se rencontrent',
            ],
            tip: 'Insister sur le regard : un statut haut regarde au-dessus, un statut bas regarde le sol.',
            objectives: ['Conscience corporelle', 'Notion de statut'],
          },
          {
            name: 'Le Miroir',
            tag: 'Duo',
            description:
              'En binôme, l\'un guide et l\'autre reproduit chaque mouvement comme un reflet.',
            steps: [
              'Former des binômes face à face',
              'Le guide bouge lentement, le miroir suit',
              'Après 2 minutes, inverser les rôles',
              'Phase finale : aucun des deux ne guide, le mouvement naît ensemble',
            ],
            tip: 'Le but n\'est pas de piéger son partenaire mais de créer une connexion fluide.',
          },
        ],
      },
      {
        title: 'Le mime narratif',
        duration: 25,
        color: '#b8860b',
        description: 'Raconter une histoire uniquement avec le corps.',
        exercises: [
          {
            name: 'L\'Objet Invisible',
            tag: 'Mime',
            description:
              'Chaque participant mime un objet que les autres doivent deviner, en travaillant le poids, la texture et la taille.',
            steps: [
              'Un participant au centre mime l\'utilisation d\'un objet',
              'Il exagère le poids, la taille et la forme',
              'Les autres observent et devinent',
              'L\'objet est ensuite « passé » au suivant qui le transforme en autre chose',
            ],
            tip: 'Travailler la résistance : un objet lourd demande un effort visible dans tout le corps.',
            objectives: ['Précision gestuelle', 'Imagination spatiale'],
          },
          {
            name: 'La Machine Humaine',
            tag: 'Collectif',
            description:
              'Le groupe construit une machine imaginaire où chaque personne est un rouage avec un mouvement et un son répétitif.',
            steps: [
              'Un premier participant entre et répète un geste avec un son',
              'Un deuxième se connecte physiquement et ajoute son propre mouvement',
              'Continuer jusqu\'à ce que tout le groupe forme la machine',
              'L\'animateur accélère puis ralentit la machine',
              'La machine finit par « exploser » ou « s\'éteindre »',
            ],
            tip: 'Encourager le contact physique et l\'écoute du rythme collectif.',
          },
        ],
      },
      {
        title: 'Scènes physiques',
        duration: 30,
        color: '#5b8fd4',
        description: 'Improviser des scènes où le corps prime sur le texte.',
        exercises: [
          {
            name: 'Scène sans paroles',
            tag: 'Impro',
            description:
              'Deux ou trois improvisateurs jouent une scène complète sans prononcer un mot.',
            steps: [
              'Tirer un lieu et une situation au hasard',
              'Les joueurs entrent en scène et établissent la relation par le corps uniquement',
              'La scène doit avoir un début, un développement et une fin',
              'Debriefing : le public décrit ce qu\'il a compris',
            ],
            tip: 'Les émotions passent par les épaules, le dos, les mains — pas seulement le visage.',
            objectives: ['Narration corporelle', 'Construction dramatique'],
          },
        ],
      },
      {
        title: 'Le corps émotionnel',
        duration: 25,
        color: '#9b59b6',
        description: 'Explorer comment les émotions transforment la posture et le mouvement.',
        exercises: [
          {
            name: 'La Traversée Émotionnelle',
            tag: 'Solo',
            description:
              'Chaque participant traverse la scène en incarnant une émotion qui évolue pendant le trajet.',
            steps: [
              'Le participant commence côté cour avec une émotion donnée',
              'Pendant la traversée, l\'émotion se transforme progressivement',
              'Il arrive côté jardin avec l\'émotion opposée',
              'Variante : l\'animateur annonce des changements d\'émotion pendant la traversée',
            ],
            tip: 'Encourager la transition lente — c\'est dans le passage que le jeu est riche.',
          },
        ],
      },
      {
        title: 'Retour au calme',
        duration: 20,
        color: '#4a7c59',
        description: 'Débriefer et relâcher.',
        exercises: [
          {
            name: 'Cercle de décompression',
            tag: 'Détente',
            description:
              'Le groupe forme un cercle, partage ses ressentis et effectue un exercice de respiration collectif.',
            steps: [
              'Former un grand cercle',
              'Tour de parole : un mot pour décrire la séance',
              'Respiration collective : inspirer ensemble sur 4 temps, expirer sur 8',
              'Applaudissements collectifs pour clore la séance',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 2. Écoute et Réactivité
  // ─────────────────────────────────────────────
  {
    title: 'Écoute et Réactivité',
    duration: 120,
    level: 'Débutant',
    description:
      'Atelier fondamental sur l\'écoute active, le « oui et… » et la réactivité en improvisation. La base de tout travail collectif.',
    objectives: [
      'Intégrer le principe du « oui et… »',
      'Développer l\'écoute active de son partenaire',
      'Réagir spontanément sans bloquer la proposition',
      'Construire ensemble plutôt que seul',
    ],
    phases: [
      {
        title: 'Jeux d\'écoute',
        duration: 20,
        color: '#4a7c59',
        description: 'Exercices pour aiguiser l\'attention.',
        exercises: [
          {
            name: 'Zip Zap Zop',
            tag: 'Énergie',
            description:
              'Un jeu de concentration en cercle où chaque participant envoie l\'énergie à un autre avec un mot (Zip, Zap ou Zop dans l\'ordre).',
            steps: [
              'Le groupe forme un cercle',
              'Le premier dit « Zip » en pointant quelqu\'un',
              'Celui-ci dit « Zap » en pointant un autre',
              'Le suivant dit « Zop », puis on recommence à « Zip »',
              'Accélérer progressivement — celui qui se trompe fait un gage comique',
            ],
            tip: 'Le contact visuel AVANT le mot est essentiel.',
          },
          {
            name: 'Le Mot Rebond',
            tag: 'Association',
            description:
              'En cercle, chacun dit un mot associé au précédent. Le lien doit être immédiat, sans réflexion.',
            steps: [
              'Un premier mot est lancé',
              'Le voisin dit le premier mot qui lui vient',
              'Tour complet sans pause ni explication',
              'Variante : le groupe doit arriver à un mot cible sans se concerter',
            ],
            tip: 'Il n\'y a pas de mauvaise association. Encourager la spontanéité.',
            objectives: ['Lâcher-prise', 'Association libre'],
          },
        ],
      },
      {
        title: 'Le « Oui Et… »',
        duration: 25,
        color: '#b8860b',
        description: 'Comprendre et pratiquer le principe fondateur de l\'impro.',
        exercises: [
          {
            name: 'Oui Et… en duo',
            tag: 'Fondamental',
            description:
              'En binôme, chaque réplique commence obligatoirement par « Oui et… », construisant une histoire à deux.',
            steps: [
              'Former des binômes',
              'A fait une proposition : « On est dans un sous-marin »',
              'B répond : « Oui et il y a une fuite d\'eau »',
              'A continue : « Oui et on n\'a qu\'un chewing-gum pour la colmater »',
              'Continuer pendant 3 minutes, puis débriefer',
            ],
            tip: 'Montrer la différence avec « Oui mais… » qui bloque la scène.',
            objectives: ['Acceptation', 'Construction collective'],
          },
          {
            name: 'Le Cadeau',
            tag: 'Duo',
            description:
              'Un joueur offre un « cadeau » mime à l\'autre, qui doit l\'accepter avec enthousiasme quel qu\'il soit.',
            steps: [
              'A mime un paquet et le tend à B',
              'B ouvre le cadeau et réagit avec joie',
              'C\'est B qui décide ce que c\'est en le nommant',
              'A doit accepter la définition et enrichir : « Oui, et c\'est un modèle rare ! »',
              'Inverser les rôles',
            ],
            tip: 'Travailler l\'acceptation inconditionnelle — même si le cadeau est absurde.',
          },
        ],
      },
      {
        title: 'Scènes d\'écoute',
        duration: 30,
        color: '#5b8fd4',
        description: 'Mettre l\'écoute en pratique dans des improvisations.',
        exercises: [
          {
            name: 'La Dernière Phrase',
            tag: 'Impro',
            description:
              'Improvisation à deux où chaque réplique doit reprendre le dernier mot de la phrase précédente.',
            steps: [
              'Définir un lieu et une relation',
              'A commence par une phrase',
              'B commence sa réplique par le dernier mot de A',
              'Continuer en construisant une histoire cohérente',
              'La scène dure 3-4 minutes',
            ],
            tip: 'La contrainte force l\'écoute — si on n\'écoute pas, on ne peut pas jouer.',
            objectives: ['Écoute active', 'Rebond'],
          },
          {
            name: 'L\'Histoire à Trois Voix',
            tag: 'Collectif',
            description:
              'Trois joueurs racontent une histoire en alternant : chacun dit une seule phrase à tour de rôle.',
            steps: [
              'Trois joueurs face au public',
              'Un titre est demandé au public',
              'Chacun ajoute une phrase à l\'histoire, dans l\'ordre',
              'L\'histoire doit avoir un début, un milieu et une fin',
              'Variante : l\'animateur tape dans les mains pour changer de narrateur aléatoirement',
            ],
          },
        ],
      },
      {
        title: 'Impros de synthèse',
        duration: 25,
        color: '#c8440a',
        description: 'Improvisation libre en appliquant tous les principes vus.',
        exercises: [
          {
            name: 'Scènes libres avec feedback',
            tag: 'Impro',
            description:
              'Improvisations courtes suivies d\'un retour constructif centré sur l\'écoute.',
            steps: [
              'Duo ou trio sur une proposition du public',
              'Scène de 3 à 5 minutes',
              'Feedback du groupe : « Où avez-vous vu du oui-et ? Où y a-t-il eu un blocage ? »',
              'Rejouer la même scène en intégrant les retours',
            ],
            tip: 'Le feedback doit toujours être bienveillant — on cherche le positif d\'abord.',
          },
        ],
      },
      {
        title: 'Clôture',
        duration: 20,
        color: '#4a7c59',
        description: 'Retour au calme et ancrage des apprentissages.',
        exercises: [
          {
            name: 'Le Cercle des Mercis',
            tag: 'Rituel',
            description:
              'En cercle, chaque participant remercie un partenaire pour un moment précis de la séance.',
            steps: [
              'Former un cercle',
              'Chacun remercie quelqu\'un en étant spécifique',
              'Terminer par un cri de groupe choisi ensemble',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 3. Le Match d'Impro
  // ─────────────────────────────────────────────
  {
    title: 'Le Match d\'Impro',
    duration: 150,
    level: 'Avancé',
    description:
      'Préparation et simulation d\'un match d\'improvisation compétitif. Travail sur les catégories, le caucus, la gestion du temps et l\'énergie de compétition.',
    objectives: [
      'Maîtriser les formats du match d\'impro (comparée, mixte, libre)',
      'Apprendre à caucusser efficacement',
      'Gérer le stress de la compétition',
      'Travailler la réactivité et la prise de risque',
    ],
    phases: [
      {
        title: 'Échauffement compétitif',
        duration: 20,
        color: '#c8440a',
        description: 'Monter l\'énergie du groupe pour la compétition.',
        exercises: [
          {
            name: 'Le Duel de Prénoms',
            tag: 'Énergie',
            description:
              'Deux équipes face à face. Un membre de chaque équipe s\'avance : le premier à dire le prénom de l\'autre gagne le point.',
            steps: [
              'Former deux équipes',
              'Les équipes se mettent dos à dos',
              'L\'animateur désigne un joueur de chaque côté',
              'Au signal, ils se retournent et crient le prénom de l\'autre',
              'Le plus rapide marque un point pour son équipe',
            ],
            tip: 'Excellent pour créer l\'esprit d\'équipe et chauffer l\'énergie.',
          },
          {
            name: 'Le Freeze Tag Rapide',
            tag: 'Échauffement',
            description:
              'Deux joueurs improvisent. Quand un spectateur crie « Freeze ! », il prend la place d\'un joueur en gardant sa position et lance une nouvelle scène.',
            steps: [
              'Deux joueurs commencent une scène',
              'N\'importe qui peut crier « Freeze ! »',
              'Les joueurs se figent',
              'Celui qui a crié tape l\'épaule d\'un joueur et prend sa position exacte',
              'Il lance une toute nouvelle scène inspirée par la position',
            ],
          },
        ],
      },
      {
        title: 'Les catégories du match',
        duration: 25,
        color: '#b8860b',
        description: 'Réviser et pratiquer les différentes catégories.',
        exercises: [
          {
            name: 'Atelier Comparée',
            tag: 'Match',
            description:
              'Deux équipes jouent le même thème séparément. Le public compare.',
            steps: [
              'Tirer un thème au sort',
              'L\'équipe A joue en 3 minutes',
              'L\'équipe B joue le même thème en 3 minutes',
              'Debriefing : quelles différences d\'approche ?',
            ],
            tip: 'En comparée, l\'originalité fait souvent la différence.',
            objectives: ['Créativité sous contrainte', 'Comparaison constructive'],
          },
          {
            name: 'Atelier Mixte',
            tag: 'Match',
            description:
              'Les deux équipes jouent ensemble sur scène. Travail de coopération dans la compétition.',
            steps: [
              'Tirer un thème',
              'Les deux équipes montent ensemble',
              'Chaque équipe essaie de tirer l\'histoire vers sa vision',
              'Le public vote pour l\'équipe la plus inspirante',
            ],
          },
        ],
      },
      {
        title: 'Le caucus',
        duration: 20,
        color: '#9b59b6',
        description: 'Apprendre à préparer une impro en 20 secondes.',
        exercises: [
          {
            name: 'Caucus Express',
            tag: 'Stratégie',
            description:
              'Simulation de caucus chronométrés : l\'équipe a 20 secondes pour décider qui joue, le lieu et l\'angle.',
            steps: [
              'L\'animateur donne un thème',
              'L\'équipe a exactement 20 secondes de concertation',
              'Ils doivent définir : qui entre en premier, où, et avec quelle émotion',
              'Jouer la scène immédiatement après',
              'Répéter 5 fois pour fluidifier le processus',
            ],
            tip: 'Dans un caucus, une idée médiocre assumée vaut mieux qu\'une bonne idée confuse.',
            objectives: ['Prise de décision rapide', 'Communication d\'équipe'],
          },
        ],
      },
      {
        title: 'Simulation de match',
        duration: 60,
        color: '#5b8fd4',
        description: 'Un vrai match avec arbitre, MC et public.',
        exercises: [
          {
            name: 'Match complet simulé',
            tag: 'Match',
            description:
              'Match en conditions réelles : MC, arbitre, cartons, vote du public, mi-temps.',
            steps: [
              'Désigner un MC et un arbitre parmi les participants',
              'Former deux équipes avec maillots/foulards distinctifs',
              'Jouer 6 à 8 impros alternées (comparées et mixtes)',
              'Vote du public après chaque impro (applaudimètre ou cartons)',
              'Mi-temps avec intermède musical ou défi',
              'Annonce du score final et discours du MC',
            ],
            tip: 'L\'arbitre doit être juste mais théâtral — c\'est un personnage du spectacle.',
            objectives: ['Gestion du stress', 'Performance scénique', 'Esprit d\'équipe'],
          },
        ],
      },
      {
        title: 'Debriefing',
        duration: 25,
        color: '#4a7c59',
        description: 'Analyse du match et axes d\'amélioration.',
        exercises: [
          {
            name: 'Retour vidéo et discussion',
            tag: 'Analyse',
            description:
              'Revoir les moments clés et identifier les forces et points de travail de chaque équipe.',
            steps: [
              'Chaque équipe cite son meilleur moment et son moment le plus difficile',
              'L\'animateur donne un retour sur la dynamique d\'équipe',
              'Discussion ouverte sur les apprentissages',
              'Chacun se fixe un objectif pour le prochain match',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 4. Narration Collective
  // ─────────────────────────────────────────────
  {
    title: 'Narration Collective',
    duration: 120,
    level: 'Intermédiaire',
    description:
      'Apprendre à construire des histoires ensemble : structure narrative, fil rouge, rebondissements et conclusion satisfaisante en improvisation de groupe.',
    objectives: [
      'Comprendre la structure en 3 actes appliquée à l\'impro',
      'Savoir tisser un fil narratif collectif',
      'Créer des rebondissements cohérents',
      'Conclure une histoire improvisée de manière satisfaisante',
    ],
    phases: [
      {
        title: 'Bases narratives',
        duration: 20,
        color: '#e67e22',
        description: 'Rappel de la structure narrative et exercices d\'amorce.',
        exercises: [
          {
            name: 'Il Était Une Fois…',
            tag: 'Narration',
            description:
              'En cercle, chacun ajoute une phrase à une histoire commune en respectant : situation initiale, élément perturbateur, péripéties, résolution.',
            steps: [
              'L\'animateur commence par « Il était une fois… »',
              'Chacun ajoute une phrase (et une seule)',
              'L\'animateur guide : « On est encore dans la situation initiale » ou « Il nous faut un rebondissement »',
              'L\'histoire doit se conclure en un tour de cercle',
            ],
            tip: 'Afficher un schéma narratif visible par tous pour ancrer la structure.',
            objectives: ['Structure narrative', 'Écoute collective'],
          },
        ],
      },
      {
        title: 'Le fil rouge',
        duration: 25,
        color: '#5b8fd4',
        description: 'Travailler la cohérence et les rappels dans une histoire longue.',
        exercises: [
          {
            name: 'Tchekhov\'s Gun',
            tag: 'Narration',
            description:
              'Un élément anodin introduit au début doit revenir comme élément clé à la fin.',
            steps: [
              'Scène à 4 joueurs, le public donne un objet banal',
              'L\'objet est mentionné dans la première minute puis « oublié »',
              'L\'histoire se développe librement',
              'L\'objet doit revenir dans le dénouement comme élément crucial',
              'Debriefing : l\'objet est-il revenu naturellement ?',
            ],
            tip: 'C\'est le principe de Tchekhov : si un fusil est accroché au mur au premier acte, il doit tirer au troisième.',
          },
          {
            name: 'Le Fil d\'Ariane',
            tag: 'Collectif',
            description:
              'Une longform où un narrateur externe guide l\'histoire et peut avancer ou rembobiner le temps.',
            steps: [
              'Désigner un narrateur qui ne joue pas',
              'Le narrateur lance la scène et peut intervenir : « Trois ans plus tard… », « Mais revenons en arrière… »',
              'Les joueurs s\'adaptent instantanément aux sauts temporels',
              'Le narrateur doit ramener tous les fils à la fin',
            ],
            objectives: ['Flexibilité narrative', 'Écoute du narrateur'],
          },
        ],
      },
      {
        title: 'Formats longs',
        duration: 35,
        color: '#9b59b6',
        description: 'Pratiquer l\'improvisation longue narrative.',
        exercises: [
          {
            name: 'Le Harold simplifié',
            tag: 'Longform',
            description:
              'Version simplifiée du Harold : trois histoires parallèles qui finissent par se rejoindre.',
            steps: [
              'Demander un mot au public',
              'Faire une ronde d\'associations libres sur ce mot',
              'Lancer 3 scènes courtes avec des personnages différents',
              'Revenir sur chaque scène pour la développer',
              'Trouver le lien qui unit les trois histoires',
              'Scène finale où les mondes se rencontrent',
            ],
            tip: 'Ne pas forcer le lien — il émerge souvent naturellement si on fait confiance au processus.',
            objectives: ['Improvisation longue', 'Tissage narratif'],
          },
        ],
      },
      {
        title: 'La fin parfaite',
        duration: 20,
        color: '#b8860b',
        description: 'Travailler les fins d\'histoires improvisées.',
        exercises: [
          {
            name: 'Dix Fins Possibles',
            tag: 'Créativité',
            description:
              'Une histoire est jouée jusqu\'au climax, puis le groupe propose 10 fins différentes et en joue 3.',
            steps: [
              'Jouer une scène jusqu\'au moment de tension maximale',
              'Stop ! Chacun propose une fin en une phrase',
              'Voter pour les 3 meilleures',
              'Rejouer la fin de la scène avec chacune des 3 fins choisies',
              'Discussion : laquelle était la plus satisfaisante et pourquoi ?',
            ],
          },
        ],
      },
      {
        title: 'Clôture narrative',
        duration: 20,
        color: '#4a7c59',
        description: 'Debriefing et exercice final.',
        exercises: [
          {
            name: 'L\'Histoire de Notre Cours',
            tag: 'Rituel',
            description:
              'Le groupe raconte la séance elle-même comme si c\'était une histoire épique, en utilisant les outils narratifs vus.',
            steps: [
              'En cercle, raconter la séance comme un conte',
              '« Il était une fois un groupe de braves improvisateurs… »',
              'Inclure les moments drôles, les galères, les victoires',
              'Conclure par une morale absurde',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 5. Personnages & Émotions
  // ─────────────────────────────────────────────
  {
    title: 'Personnages & Émotions',
    duration: 120,
    level: 'Intermédiaire',
    description:
      'Construire des personnages mémorables avec une voix, un corps et une émotion motrice. Apprendre à passer d\'une émotion à l\'autre tout en restant crédible.',
    objectives: [
      'Créer un personnage en 10 secondes à partir de 3 éléments',
      'Jouer des émotions nuancées, pas seulement les émotions de base',
      'Maintenir un personnage sur la durée d\'une scène',
      'Faire évoluer un personnage en fonction des événements',
    ],
    phases: [
      {
        title: 'La fabrique à personnages',
        duration: 25,
        color: '#9b59b6',
        description: 'Créer des personnages rapidement à partir de contraintes.',
        exercises: [
          {
            name: 'Le Triptyque',
            tag: 'Création',
            description:
              'Chaque participant crée un personnage à partir de 3 éléments tirés au sort : une posture, un tic vocal et un désir.',
            steps: [
              'Préparer 3 tas de cartes : postures, tics vocaux, désirs',
              'Chacun tire une carte de chaque tas',
              'En 1 minute, construire le personnage en intégrant les 3 éléments',
              'Présentation au groupe : le personnage entre, se présente, sort',
              'Le groupe donne un nom au personnage',
            ],
            tip: 'Le désir est le moteur du personnage — tout ce qu\'il fait doit en découler.',
            objectives: ['Création rapide', 'Incarnation physique et vocale'],
          },
          {
            name: 'La Galerie de Portraits',
            tag: 'Solo',
            description:
              'L\'animateur décrit un type de personnage, tout le monde l\'incarne simultanément en marchant dans l\'espace.',
            steps: [
              'Tout le monde marche',
              'L\'animateur décrit : « Vous êtes un vieux professeur qui a perdu ses lunettes »',
              'Chacun incarne le personnage à sa manière',
              'L\'animateur change de personnage toutes les 45 secondes',
              'Enchaîner 8 à 10 personnages très différents',
            ],
          },
        ],
      },
      {
        title: 'L\'arc émotionnel',
        duration: 25,
        color: '#c8440a',
        description: 'Travailler les transitions émotionnelles.',
        exercises: [
          {
            name: 'Le Curseur Émotionnel',
            tag: 'Émotion',
            description:
              'Un joueur joue une scène simple. L\'animateur a un curseur imaginaire de 0 à 10 qui contrôle l\'intensité de l\'émotion.',
            steps: [
              'Définir une émotion (ex : la colère)',
              'Le joueur commence une activité banale (ex : faire la vaisselle)',
              'L\'animateur annonce les niveaux : « 2… 5… 8… 10 ! … redescend à 3 »',
              'Le joueur module l\'intensité en temps réel',
              'Variante : changer d\'émotion en cours de route',
            ],
            tip: 'Les niveaux bas (1-3) sont souvent les plus difficiles et les plus intéressants à jouer.',
            objectives: ['Modulation émotionnelle', 'Subtilité de jeu'],
          },
        ],
      },
      {
        title: 'Personnages en interaction',
        duration: 30,
        color: '#5b8fd4',
        description: 'Faire vivre les personnages dans des relations.',
        exercises: [
          {
            name: 'Les Retrouvailles',
            tag: 'Duo',
            description:
              'Deux personnages se retrouvent après 20 ans. Chacun a changé mais essaie de retrouver l\'autre tel qu\'il était.',
            steps: [
              'Chaque joueur définit secrètement son personnage (qui il était, qui il est devenu)',
              'La scène commence : ils se reconnaissent',
              'Chacun découvre les changements de l\'autre',
              'La scène explore le décalage entre souvenir et réalité',
              'Trouver une résolution émotionnelle',
            ],
            tip: 'Le non-dit est aussi important que le dit — ce qu\'on ne révèle pas crée la tension.',
          },
          {
            name: 'Le Carrousel des Émotions',
            tag: 'Collectif',
            description:
              'Une scène de groupe où chaque personnage est défini par une émotion dominante différente, et ils doivent résoudre un problème ensemble.',
            steps: [
              'Attribuer une émotion à chaque joueur (joie, peur, colère, tristesse, etc.)',
              'Donner un problème collectif : « L\'immeuble va être démoli demain »',
              'Chacun réagit selon son émotion dominante',
              'Observer comment les émotions entrent en conflit ou en harmonie',
            ],
            objectives: ['Jeu en groupe', 'Maintien du personnage'],
          },
        ],
      },
      {
        title: 'Scènes de personnages',
        duration: 25,
        color: '#e67e22',
        description: 'Improvisation libre centrée sur le personnage.',
        exercises: [
          {
            name: 'Mon Personnage Signature',
            tag: 'Impro',
            description:
              'Chaque improvisateur reprend le personnage qu\'il a créé en début de séance et le met dans 3 situations différentes.',
            steps: [
              'Reprendre le personnage du Triptyque',
              'Situation 1 : votre personnage au supermarché',
              'Situation 2 : votre personnage à un mariage',
              'Situation 3 : votre personnage face à son pire cauchemar',
              'Observer comment le personnage reste cohérent malgré les contextes',
            ],
          },
        ],
      },
      {
        title: 'Clôture',
        duration: 15,
        color: '#4a7c59',
        description: 'Retour au calme et partage.',
        exercises: [
          {
            name: 'L\'Adieu au Personnage',
            tag: 'Rituel',
            description:
              'Chacun dit au revoir à son personnage de la séance en une phrase, et le « retire » symboliquement.',
            steps: [
              'En cercle, chacun fait un dernier geste de son personnage',
              'Il dit : « Merci [nom du personnage], tu peux partir »',
              'Il « retire » le personnage (enlever un chapeau imaginaire, secouer les mains…)',
              'Retour à soi avec une respiration',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 6. La Chanson Improvisée
  // ─────────────────────────────────────────────
  {
    title: 'La Chanson Improvisée',
    duration: 120,
    level: 'Avancé',
    description:
      'Explorer l\'improvisation musicale : inventer des chansons sur le vif, créer des refrains collectifs et intégrer le chant dans les scènes improvisées.',
    objectives: [
      'Oser chanter devant un groupe',
      'Structurer une chanson improvisée (couplet-refrain)',
      'Trouver des rimes en temps réel',
      'Intégrer naturellement le chant dans une scène',
    ],
    phases: [
      {
        title: 'Libérer la voix',
        duration: 20,
        color: '#e67e22',
        description: 'Échauffement vocal et désinhibition.',
        exercises: [
          {
            name: 'Le Chœur Sauvage',
            tag: 'Vocal',
            description:
              'Le groupe produit un chœur sonore improvisé : chacun émet un son et s\'harmonise avec les autres.',
            steps: [
              'En cercle, yeux fermés',
              'Chacun produit un son tenu (voyelle, bourdonnement, mélodie)',
              'Écouter les autres et s\'adapter progressivement',
              'L\'animateur guide les variations : plus fort, plus doux, plus aigu',
              'Terminer par un silence partagé',
            ],
            tip: 'Il n\'y a pas de fausse note en impro musicale — il n\'y a que des choix audacieux.',
          },
          {
            name: 'La Douche Sonore',
            tag: 'Confiance',
            description:
              'Un participant au centre, les autres en cercle chantent pour lui — il « reçoit » le son.',
            steps: [
              'Un volontaire au centre, yeux fermés',
              'Le groupe chante doucement autour de lui',
              'Varier : grave, aigu, rythme, intensité',
              'Le participant au centre tourne lentement',
              'Après 1 minute, il ouvre les yeux et décrit son ressenti',
            ],
          },
        ],
      },
      {
        title: 'La rime express',
        duration: 20,
        color: '#b8860b',
        description: 'Travailler la rime et le rythme spontanés.',
        exercises: [
          {
            name: 'Le Rap Battle Bienveillant',
            tag: 'Rythme',
            description:
              'Deux joueurs s\'affrontent en improvisant des couplets rappés… mais uniquement avec des compliments.',
            steps: [
              'Deux joueurs face à face',
              'Un beatbox humain assure le rythme (ou un métronome)',
              'Chacun improvise 4 vers rimés à tour de rôle',
              'Les vers doivent être des compliments ou des encouragements',
              'Le public vote pour le « meilleur flow »',
            ],
            tip: 'Autoriser les rimes approximatives — le rythme et l\'énergie comptent plus que la perfection.',
            objectives: ['Rimes spontanées', 'Rythme'],
          },
        ],
      },
      {
        title: 'La chanson structurée',
        duration: 30,
        color: '#5b8fd4',
        description: 'Construire une vraie chanson improvisée avec couplets et refrain.',
        exercises: [
          {
            name: 'Le Refrain Collectif',
            tag: 'Musical',
            description:
              'Un soliste improvise les couplets, le groupe crée et répète un refrain inventé ensemble.',
            steps: [
              'Demander un thème au public',
              'Le groupe invente un refrain de 2 lignes (mélodie simple et mémorable)',
              'Répéter le refrain ensemble 3 fois pour le fixer',
              'Un soliste improvise un couplet de 4 lignes',
              'Le groupe reprend le refrain',
              'Un nouveau soliste prend le couplet suivant',
              'Finir par un refrain final en canon ou en crescendo',
            ],
            tip: 'Le refrain doit être SIMPLE. Deux lignes maximum, mélodie évidente.',
            objectives: ['Structure musicale', 'Création collective'],
          },
          {
            name: 'La Comédie Musicale Instantanée',
            tag: 'Impro',
            description:
              'Une scène improvisée où les personnages se mettent à chanter quand l\'émotion est trop forte.',
            steps: [
              'Deux joueurs commencent une scène parlée classique',
              'Quand l\'animateur lève la main, le joueur qui parle doit chanter',
              'Quand l\'animateur baisse la main, retour au parlé',
              'Les chansons doivent exprimer ce que le personnage ressent vraiment',
            ],
          },
        ],
      },
      {
        title: 'Le concert improvisé',
        duration: 30,
        color: '#9b59b6',
        description: 'Spectacle musical improvisé complet.',
        exercises: [
          {
            name: 'Le Jukebox Humain',
            tag: 'Spectacle',
            description:
              'Le public propose des titres de chansons qui n\'existent pas. Le groupe les interprète comme si elles existaient.',
            steps: [
              'Le public propose un titre absurde (ex : « Les Chaussettes de l\'Apocalypse »)',
              'Le groupe se concerte 10 secondes sur le style musical',
              'Interprétation complète : intro, couplet, refrain, fin',
              'Jouer le clip en même temps (les autres miment)',
              'Enchaîner 4 à 5 « chansons »',
            ],
            tip: 'L\'engagement total est la clé — chanter faux avec conviction est toujours drôle.',
            objectives: ['Lâcher-prise', 'Performance musicale'],
          },
        ],
      },
      {
        title: 'Clôture en musique',
        duration: 20,
        color: '#4a7c59',
        description: 'Fin de séance en chanson.',
        exercises: [
          {
            name: 'L\'Hymne du Groupe',
            tag: 'Rituel',
            description:
              'Le groupe compose ensemble l\'hymne officiel de la troupe en 5 minutes.',
            steps: [
              'Chacun propose un vers',
              'Le groupe choisit une mélodie simple (sur un air connu si besoin)',
              'Assembler les vers en un couplet + refrain',
              'Chanter l\'hymne tous ensemble',
              'Cet hymne sera repris en début de chaque séance',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 7. L'Art du Silence
  // ─────────────────────────────────────────────
  {
    title: 'L\'Art du Silence',
    duration: 90,
    level: 'Débutant',
    description:
      'Un atelier dédié au mime, au non-verbal et au pouvoir du silence sur scène. Apprendre que ce qu\'on ne dit pas est parfois plus fort que ce qu\'on dit.',
    objectives: [
      'Communiquer des histoires sans mots',
      'Utiliser le silence comme outil dramatique',
      'Développer la présence scénique par le corps',
      'Maîtriser les bases du mime classique',
    ],
    phases: [
      {
        title: 'Le silence habité',
        duration: 15,
        color: '#5b8fd4',
        description: 'Apprendre à être sur scène sans rien faire — et que ce soit intéressant.',
        exercises: [
          {
            name: 'La Minute Éternelle',
            tag: 'Présence',
            description:
              'Chaque participant reste seul sur scène pendant une minute, sans rien faire. Le groupe observe.',
            steps: [
              'Un participant monte sur scène et reste debout, face au public',
              'Pas de mouvement, pas de parole, juste être là',
              'Après 1 minute, le participant s\'assoit dans le public',
              'Discussion : qu\'a-t-on vu ? Quand était-ce confortable ou inconfortable ?',
            ],
            tip: 'Le silence révèle la présence. C\'est l\'exercice le plus simple et le plus difficile.',
            objectives: ['Présence scénique', 'Gestion du silence'],
          },
        ],
      },
      {
        title: 'Techniques de mime',
        duration: 25,
        color: '#b8860b',
        description: 'Bases techniques du mime : le mur, la corde, l\'escalier.',
        exercises: [
          {
            name: 'Les Fondamentaux',
            tag: 'Technique',
            description:
              'Apprentissage des figures de base du mime : le mur invisible, tirer une corde, monter un escalier.',
            steps: [
              'L\'animateur démontre chaque technique',
              'Le mur : mains à plat, résistance, déplacement latéral',
              'La corde : traction, poids du corps, effort progressif',
              'L\'escalier : montée marche par marche, hauteur constante',
              'Chacun pratique, l\'animateur corrige individuellement',
              'Enchaîner les 3 techniques dans une mini-scène',
            ],
            tip: 'La clé est la FIXITÉ DU POINT : la main sur le mur ne doit jamais glisser.',
            objectives: ['Technique de mime', 'Précision corporelle'],
          },
        ],
      },
      {
        title: 'Histoires muettes',
        duration: 25,
        color: '#9b59b6',
        description: 'Raconter des histoires complètes sans un mot.',
        exercises: [
          {
            name: 'Le Court-Métrage Muet',
            tag: 'Impro',
            description:
              'En duo ou trio, jouer une histoire de 3 minutes style cinéma muet, avec un pianiste imaginaire.',
            steps: [
              'Tirer une situation au sort',
              'Les joueurs ont 1 minute de préparation',
              'Jouer la scène en muet, avec expressions exagérées style Chaplin',
              'Un participant peut jouer le « pianiste » avec des bruitages vocaux',
              'Le public devine l\'histoire',
            ],
            tip: 'Dans le muet, TOUT est amplifié : les gestes, les regards, les réactions.',
          },
          {
            name: 'Le Dialogue des Regards',
            tag: 'Duo',
            description:
              'Deux joueurs assis face à face communiquent une conversation entière uniquement par les yeux et les expressions faciales.',
            steps: [
              'Définir secrètement une situation (ex : « l\'un sait que l\'autre a menti »)',
              'Les joueurs s\'assoient face à face',
              'Communication uniquement par le regard et les micro-expressions',
              'Après 2 minutes, chacun raconte ce qu\'il a compris',
              'Comparer les versions : étaient-ils sur la même longueur d\'onde ?',
            ],
            objectives: ['Communication non-verbale', 'Micro-expressions'],
          },
        ],
      },
      {
        title: 'Clôture silencieuse',
        duration: 25,
        color: '#4a7c59',
        description: 'Fin de séance dans le calme et le non-verbal.',
        exercises: [
          {
            name: 'Le Salut Muet',
            tag: 'Rituel',
            description:
              'Le groupe se dit au revoir sans un mot — chacun trouve sa façon non-verbale de saluer les autres.',
            steps: [
              'Debout en cercle',
              'Chacun, à tour de rôle, salue le groupe à sa manière (révérence, signe, geste inventé…)',
              'Le groupe répond en miroir',
              'Terminer par un silence collectif de 30 secondes, yeux fermés',
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // 8. Le Qui Quoi Où — Avancé
  // ─────────────────────────────────────────────
  {
    title: 'Le Qui Quoi Où — Avancé',
    duration: 120,
    level: 'Avancé',
    description:
      'Version avancée du format Qui Quoi Où : ajout de contraintes, d\'époques, de genres et de relations pour des scènes plus riches et plus complexes.',
    objectives: [
      'Enrichir une proposition de base avec des couches supplémentaires',
      'Jongler avec plusieurs contraintes simultanément',
      'Créer des scènes denses et multi-dimensionnelles',
      'Maîtriser les changements de registre en cours de scène',
    ],
    phases: [
      {
        title: 'Échauffement Qui Quoi Où classique',
        duration: 15,
        color: '#4a7c59',
        description: 'Rappel du format de base avant de complexifier.',
        exercises: [
          {
            name: 'QQO Express',
            tag: 'Échauffement',
            description:
              'Tirages rapides Qui-Quoi-Où, scènes de 2 minutes chrono.',
            steps: [
              'Tirer un personnage, une situation et un lieu au hasard',
              'Deux joueurs ont 10 secondes pour se préparer',
              'Scène de 2 minutes maximum',
              'Enchaîner 4 à 5 scènes rapidement',
            ],
            tip: 'La vitesse empêche de trop réfléchir — elle force l\'instinct.',
            objectives: ['Spontanéité', 'Rapidité de mise en jeu'],
          },
        ],
      },
      {
        title: 'Ajout des couches',
        duration: 25,
        color: '#b8860b',
        description: 'Introduire les nouvelles dimensions : émotion, relation, époque.',
        exercises: [
          {
            name: 'QQO + Émotion',
            tag: 'Enrichi',
            description:
              'Au tirage classique, on ajoute une émotion de départ qui doit évoluer pendant la scène.',
            steps: [
              'Tirer Qui, Quoi, Où + une émotion',
              'Le personnage commence avec cette émotion à l\'intensité 8',
              'L\'émotion doit évoluer pendant la scène (pas rester statique)',
              'Scène de 3-4 minutes',
              'Debriefing : l\'évolution était-elle crédible ?',
            ],
          },
          {
            name: 'QQO + Relation',
            tag: 'Enrichi',
            description:
              'Deux joueurs tirent chacun un personnage + une relation qui les lie.',
            steps: [
              'Chaque joueur tire un Qui différent',
              'Tirer une relation commune (ex : « Rivaux amoureux »)',
              'Tirer un Quoi et un Où',
              'La relation doit transparaître dans chaque interaction',
              'Scène de 4-5 minutes',
            ],
            tip: 'La relation est le moteur de la scène — plus que la situation.',
            objectives: ['Jeu relationnel', 'Complexité de scène'],
          },
        ],
      },
      {
        title: 'Le Qui Quoi Où à contraintes multiples',
        duration: 30,
        color: '#c8440a',
        description: 'Jongler avec toutes les couches en même temps.',
        exercises: [
          {
            name: 'Le Tirage Royal',
            tag: 'Avancé',
            description:
              'Tirage complet : Qui + Quoi + Où + Relation + Époque + Genre + Contrainte. Le maximum de complexité.',
            steps: [
              'Tirer un élément de chaque catégorie',
              'Les joueurs ont 30 secondes de caucus',
              'Scène de 5 minutes',
              'Le genre théâtral (comédie musicale, thriller, etc.) doit imprégner toute la scène',
              'La contrainte technique doit être respectée',
              'Debriefing approfondi avec le groupe',
            ],
            tip: 'Quand il y a beaucoup de contraintes, en choisir 2-3 principales et laisser les autres en arrière-plan.',
            objectives: ['Gestion de la complexité', 'Maîtrise multi-couches'],
          },
          {
            name: 'Le Switch de Genre',
            tag: 'Avancé',
            description:
              'Une même scène QQO est jouée 3 fois dans 3 genres différents (ex : romance, horreur, comédie musicale).',
            steps: [
              'Tirer un Qui, Quoi, Où',
              'Jouer la scène en mode « film romantique »',
              'Rejouer la MÊME scène en mode « film d\'horreur »',
              'Rejouer encore en mode « comédie musicale »',
              'Discussion : comment le genre change-t-il tout ?',
            ],
          },
        ],
      },
      {
        title: 'Les scènes marathon',
        duration: 30,
        color: '#9b59b6',
        description: 'Scènes longues et ambitieuses avec tirages complets.',
        exercises: [
          {
            name: 'La Saga en 3 Actes',
            tag: 'Longform',
            description:
              'Une scène QQO développée en 3 actes de 5 minutes avec changement d\'époque entre chaque acte.',
            steps: [
              'Tirer tous les éléments + 3 époques différentes',
              'Acte 1 : la situation se met en place (époque 1)',
              'Acte 2 : les mêmes personnages à une autre époque, le conflit s\'intensifie',
              'Acte 3 : dernière époque, résolution',
              'Les personnages doivent évoluer d\'un acte à l\'autre',
              'Debriefing collectif approfondi',
            ],
            tip: 'Le fil conducteur entre les époques, c\'est la relation entre les personnages, pas les événements.',
            objectives: ['Improvisation longue', 'Cohérence narrative à travers le temps'],
          },
        ],
      },
      {
        title: 'Clôture',
        duration: 20,
        color: '#4a7c59',
        description: 'Retour au calme et bilan.',
        exercises: [
          {
            name: 'Mon QQO Intérieur',
            tag: 'Rituel',
            description:
              'Chaque participant se tire un Qui Quoi Où personnel : qui il était en arrivant, ce qu\'il a fait, où il en est maintenant.',
            steps: [
              'En cercle, chacun complète les phrases :',
              '« En arrivant, j\'étais… » (Qui)',
              '« Pendant la séance, j\'ai… » (Quoi)',
              '« Je repars avec… » (Où = dans quel état d\'esprit)',
              'Applaudissements collectifs',
            ],
          },
        ],
      },
    ],
  },
];
