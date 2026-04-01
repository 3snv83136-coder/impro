/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useState, FormEvent, useEffect, useRef } from "react";
import { Clock, Users, GraduationCap, Lightbulb, ArrowRight, Trash2, UserPlus, CheckCircle2, Play, Pause, RotateCcw, Sparkles, RefreshCw, MapPin, User, Activity, Lock, BookOpen } from "lucide-react";
import { quiList, quoiList, ouList, emotionsList, contraintesList } from "./data/ideas";
import { courseTemplates } from "./data/courseTemplates";
import { useSupabaseStorage } from "./hooks/useSupabase";
import BackOffice from "./components/BackOffice";
import CourseBuilder from "./components/CourseBuilder";
import ProfEditor from "./components/ProfEditor";
import ProfShowcase from "./components/ProfShowcase";
import CourseView from "./components/CourseView";

interface Participant {
  id: string;
  name: string;
  contact: string;
  level: string;
}

interface ProfData {
  id: string;
  photo: string | null;
  name: string;
  bio: string;
  specialties: string[];
  color: string;
  attributes: { id: string; label: string; value: number }[];
}

interface CoursePhase {
  id: string;
  title: string;
  duration: number;
  color: string;
  description: string;
  exercises: PhaseExercise[];
}

interface PhaseExercise {
  name: string;
  tag?: string;
  description: string;
  steps: string[];
  tip?: string;
  objectives?: string[];
}

interface Course {
  id: string;
  title: string;
  duration: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  description: string;
  objectives: string[];
  profId: string | null;
  phases: CoursePhase[];
  createdAt: string;
}

const defaultProfs: ProfData[] = [
  {
    id: 'mondorito',
    photo: '/photos/mondorito.jpg',
    name: 'Mondorito',
    bio: "Coach d'impro depuis 15 ans. Spécialité : le jeu corporel et l'écoute active.",
    specialties: ['Jeu corporel', 'Écoute active', 'Direction de jeu'],
    color: '#c8440a',
    attributes: [
      { id: '1', label: 'Présence scénique', value: 8 },
      { id: '2', label: 'Écoute', value: 9 },
      { id: '3', label: 'Lâcher-prise', value: 7 },
      { id: '4', label: 'Réactivité', value: 8 },
      { id: '5', label: 'Direction de jeu', value: 9 },
      { id: '6', label: 'Pédagogie', value: 8 },
    ],
  },
  {
    id: 'michel',
    photo: '/photos/michel.jpg',
    name: 'Michel',
    bio: "Émotion volcanique. Spécialiste du jeu intense et des montées dramatiques qui emportent tout sur leur passage.",
    specialties: ['Jeu intense', 'Émotion', 'Charisme'],
    color: '#9b59b6',
    attributes: [
      { id: '1', label: 'Intensité émotionnelle', value: 10 },
      { id: '2', label: 'Présence scénique', value: 9 },
      { id: '3', label: 'Énergie brute', value: 9 },
      { id: '4', label: 'Improvisation dramatique', value: 8 },
      { id: '5', label: 'Charisme', value: 8 },
      { id: '6', label: 'Pédagogie', value: 6 },
    ],
  },
  {
    id: 'cathy',
    photo: '/photos/cathy.jpg',
    name: 'Cathy',
    bio: "Chanteuse et danseuse émérite. Elle mêle le mouvement, la voix et le rythme pour une impro totalement incarnée.",
    specialties: ['Chant', 'Danse', 'Rythme', 'Expression vocale'],
    color: '#e67e22',
    attributes: [
      { id: '1', label: 'Chant', value: 10 },
      { id: '2', label: 'Danse', value: 10 },
      { id: '3', label: 'Rythme corporel', value: 9 },
      { id: '4', label: 'Expression vocale', value: 9 },
      { id: '5', label: 'Présence scénique', value: 8 },
      { id: '6', label: 'Pédagogie', value: 7 },
    ],
  },
  {
    id: 'gwen',
    photo: '/photos/gwen.jpg',
    name: 'Gwen',
    bio: "Créative de génie. Reine de l'inattendu, elle transforme chaque scène en univers singulier et surprenant.",
    specialties: ['Créativité', 'Narration', 'Direction artistique'],
    color: '#5b8fd4',
    attributes: [
      { id: '1', label: 'Créativité', value: 10 },
      { id: '2', label: 'Originalité', value: 9 },
      { id: '3', label: 'Construction narrative', value: 9 },
      { id: '4', label: 'Spontanéité', value: 8 },
      { id: '5', label: 'Écoute', value: 7 },
      { id: '6', label: 'Direction artistique', value: 9 },
    ],
  },
];

const defaultCourses: Course[] = [
  {
    id: 'qui-quoi-ou',
    title: 'Le Qui ? Le Quoi ? Le Où ?',
    duration: 60,
    level: 'Intermédiaire',
    description: 'Poser un décor incarné en moins de 30 secondes — par le corps, la voix et l\'espace, avec ou sans paroles.',
    objectives: ['Installer le Qui par le corps', 'Poser le Quoi par le geste', 'Créer le Où par l\'espace', 'Écoute et réactivité'],
    profId: 'mondorito',
    createdAt: '2025-01-01',
    phases: [
      {
        id: 'warmup',
        title: 'Échauffement — Le Corps dans l\'Espace',
        duration: 10,
        color: '#4a7c59',
        description: 'Activer le corps, libérer les inhibitions, occuper l\'espace ensemble.',
        exercises: [{
          name: 'La Marche des Statuts',
          tag: 'Collectif',
          description: 'Marche libre dans l\'espace. Le coach crie un chiffre de 1 à 10 qui désigne un statut social/état émotionnel. Tout le monde adapte immédiatement sa posture, son regard, son allure.',
          steps: [
            'Marche neutre 1 min — on remplit tout l\'espace, on évite de tourner en rond.',
            'Coach crie « 2 » (timide, effacé) → corps rentré, regard bas.',
            'Coach crie « 9 » (PDG du monde) → port de tête haut, pas lent et assuré.',
            'Alterner rapidement 2-8-1-10 — observer ce que ça change en soi.',
            'Variante finale : chaque participant choisit son statut et on essaie de lire ceux des autres.',
          ],
          tip: 'On cherche à ancrer que le corps raconte avant la bouche. C\'est le cœur du cours.',
          objectives: ['Qui', 'Corps'],
        }],
      },
      {
        id: 'theory',
        title: 'Mini-cours — Les 3 questions, les 3 couches',
        duration: 5,
        color: '#b8860b',
        description: 'On ne fait pas la théorie au tableau : on l\'énonce debout, en cercle, en 5 min.',
        exercises: [{
          name: 'Le Triptyque du Décor',
          description: 'Le coach pose les trois questions et leurs trois couches d\'expression possibles. Chaque participant peut donner un exemple vite fait.',
          steps: [
            'QUI ? → Identité, relation, statut. Vecteurs : posture, costume imaginaire, manière de regarder l\'autre.',
            'QUOI ? → L\'action, l\'activité, l\'enjeu. Vecteurs : geste fonctionnel précis, objet imaginaire manipulé, rythme.',
            'OÙ ? → Le lieu, l\'atmosphère, la période. Vecteurs : résistances physiques (sol, air, lumière), points d\'ancrage dans l\'espace, réactions à l\'environnement.',
          ],
          tip: 'Règle d\'or : « Dans les 30 premières secondes d\'une scène, au moins deux des trois questions doivent avoir une réponse claire pour le public — sans qu\'on l\'explique. »',
        }],
      },
      {
        id: 'ex1',
        title: 'Exercice 1 — L\'Objet Révélateur',
        duration: 15,
        color: '#5b8fd4',
        description: 'Utiliser un geste ou un objet imaginaire pour installer simultanément Qui, Quoi et Où — sans un mot.',
        exercises: [{
          name: 'Entrée en scène silencieuse',
          tag: 'Solo / 1 min chacun',
          description: 'Chaque participant entre seul sur la « scène » et installe un début de scène en 45 secondes, sans parole. Le groupe observe et tente de répondre aux 3 questions.',
          steps: [
            'Le coach tire une carte (ou dit à voix basse) un contexte parmi : chirurgien en salle d\'op, enfant le matin de Noël, plombier sous un évier, astronaute en sortie EVA, boulanger à 4h du mat, accusé au tribunal.',
            'L\'improvisateur entre, s\'installe, fait une action physique précise — 45 sec max.',
            'Arrêt. Le public répond : Qui ? Quoi ? Où ? — main levée, une réponse par personne.',
            'L\'improvisateur révèle son intention et on compare. Discussion 1 min max.',
            'Passer au suivant. Viser 5 passages en 15 min (groupes de 2 si besoin).',
          ],
          tip: 'Ce qu\'on cherche : la précision du geste (pas une indication floue, mais la résistance d\'un couvercle qui résiste, l\'odeur d\'un produit, le poids d\'un instrument). Le vague ne raconte rien.',
          objectives: ['Qui', 'Quoi', 'Où', 'Corps'],
        }],
      },
      {
        id: 'ex2',
        title: 'Exercice 2 — Tableau Vivant à Deux',
        duration: 15,
        color: '#9b59b6',
        description: 'Construire un contexte à deux joueurs — la relation crée le Qui et densifie tout le reste.',
        exercises: [{
          name: 'Freeze & Read',
          tag: 'Duos · 2 min / scène',
          description: 'Deux joueurs entrent et démarrent une scène sans parole. Au bout de 30 secondes le coach crie « Freeze ! » — les deux se figent. Le reste du groupe lit la scène.',
          steps: [
            'Former 5 duos. Chaque duo reçoit un contexte.',
            'Les deux entrent, s\'installent, commencent à jouer — sans parole ou avec très peu.',
            'Freeze à 30 sec. Lecture par les observateurs : Qui est qui ? Quelle relation ? Où ? Que se passe-t-il ?',
            'Dégel : le duo continue 1 min, peut parler maintenant pour confirmer ou infirmer les lectures.',
            'Bref retour collectif : qu\'est-ce qui a immédiatement installé le contexte ? Qu\'est-ce qui était ambigu ?',
          ],
          tip: 'Point coaching clé : regarder si les deux joueurs habitent le même espace — même sol, même lumière, même température.',
          objectives: ['Qui', 'Où', 'Écoute', 'Corps'],
        }],
      },
      {
        id: 'ex3',
        title: 'Exercice 3 — Scènes Courtes',
        duration: 15,
        color: '#c8440a',
        description: 'Intégration finale. On joue de vraies scènes de 2 à 4 min avec la contrainte que le décor soit posé en 20 secondes.',
        exercises: [{
          name: 'Le Chrono du Décor',
          tag: 'Groupes de 3 · 3 min / scène',
          description: 'Former des groupes de 3. Une personne observe et chronomètre mentalement. Le coach donne un contexte tiré au hasard — les joueurs ont 20 secondes pour installer le Qui Quoi Où.',
          steps: [
            'Le coach donne le contexte. Les 2 joueurs entrent immédiatement.',
            'L\'observateur chronomètre et note mentalement à quel moment il a compris les 3 éléments.',
            'Scène libre jusqu\'à 3-4 min ou jusqu\'au signal du coach.',
            'L\'observateur donne son retour : « J\'ai compris le Où à 8 sec, le Qui à 12 sec... »',
            'On passe au trio suivant.',
          ],
          tip: 'Règle pour les joueurs : ne jamais annoncer le contexte. Montrer, ne pas dire.',
          objectives: ['Qui', 'Quoi', 'Où', 'Écoute', 'Corps'],
        }],
      },
      {
        id: 'debrief',
        title: 'Bilan — Le Cercle des 3 Questions',
        duration: 5,
        color: '#e67e22',
        description: 'Debriefing debout, en cercle, 5 min. Chacun répond à une seule question.',
        exercises: [{
          name: 'Tour de cercle',
          description: 'Chaque participant partage une chose facile, une chose difficile, et une chose à retenir.',
          steps: [
            'Ce que j\'ai trouvé facile : installer le Où par le sol, la relation physique à l\'autre, le geste fonctionnel.',
            'Ce qui m\'a résisté : résister à l\'envie d\'expliquer, habiter le même espace que l\'autre, maintenir sans parole sous tension.',
            'À retenir : le corps parle avant la voix, un geste précis vaut 10 lignes, le Où se ressent il ne s\'annonce pas.',
          ],
        }],
      },
    ],
  },
];

// ── Splash / Landing Screen ──────────────────────────────────────────
function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [phase, setPhase] = useState<'typewriter' | 'countdown' | 'explode' | 'done'>('typewriter');
  const [typewriterText, setTypewriterText] = useState('');
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  const fullText = "ICI C'EST.....";
  const countdownColors = ['#e84393', '#6c5ce7', '#00b894', '#fd7272', '#fdcb6e'];

  useEffect(() => {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      charIndex++;
      setTypewriterText(fullText.slice(0, charIndex));
      if (charIndex >= fullText.length) clearInterval(typeInterval);
    }, 2000 / fullText.length);

    // Phase 2: Countdown — 1s par chiffre, bien espacé
    const countdownStart = setTimeout(() => { setPhase('countdown'); setCountdownNum(5); }, 2200);
    const c4 = setTimeout(() => setCountdownNum(4), 3200);
    const c3 = setTimeout(() => setCountdownNum(3), 4200);
    const c2 = setTimeout(() => setCountdownNum(2), 5200);
    const c1 = setTimeout(() => setCountdownNum(1), 6200);
    // Phase 3: Explode
    const explodeTimeout = setTimeout(() => setPhase('explode'), 7200);
    const doneTimeout = setTimeout(() => { setPhase('done'); onFinished(); }, 8500);

    return () => {
      clearInterval(typeInterval);
      [countdownStart, c4, c3, c2, c1, explodeTimeout, doneTimeout].forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#1a0a2e' }}
    >
      {/* Cartoon starburst background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.03) 0deg 10deg, transparent 10deg 20deg)',
      }} />
      {/* Colored spotlight blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,67,147,0.3), transparent 70%)', top: '-10%', left: '-10%' }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.3), transparent 70%)', bottom: '-10%', right: '-10%' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(253,203,110,0.25), transparent 70%)', top: '30%', right: '20%' }}
      />

      {/* Speed lines — manga style */}
      {phase === 'explode' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.6, delay: i * 0.02 }}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{
                width: '150vmax',
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${countdownColors[i % 5]}80, transparent)`,
                transform: `rotate(${i * 15}deg)`,
                marginLeft: '-75vmax',
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center px-4 relative z-10">
        {/* Phase 1: Typewriter — comic book style */}
        {phase === 'typewriter' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="font-serif text-4xl sm:text-6xl md:text-7xl font-black tracking-wide relative inline-block"
              style={{
                color: '#fdcb6e',
                WebkitTextStroke: '2px #e17055',
                textShadow: '4px 4px 0px #e84393, 8px 8px 0px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em',
              }}
            >
              {typewriterText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
                style={{ color: '#fd7272', WebkitTextStroke: '0px' }}
              >
                |
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Countdown — bouncy cartoon numbers */}
        {phase === 'countdown' && countdownNum !== null && (
          <div className="relative">
            <motion.div
              className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                color: '#fdcb6e',
                WebkitTextStroke: '1px #e17055',
                textShadow: '3px 3px 0px #e84393',
              }}
            >
              {fullText}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key={countdownNum}
                initial={{ scale: 3, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20, duration: 0.3 }}
                className="font-serif text-[10rem] sm:text-[14rem] font-black leading-none"
                style={{
                  color: countdownColors[5 - countdownNum],
                  WebkitTextStroke: `4px ${countdownNum > 3 ? '#2d3436' : '#fff'}`,
                  textShadow: `6px 6px 0px rgba(0,0,0,0.4), -2px -2px 0px ${countdownColors[(5 - countdownNum + 2) % 5]}`,
                  filter: 'drop-shadow(0 0 30px currentColor)',
                }}
              >
                {countdownNum}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Phase 3: IMPRO explosion — manga burst */}
        {phase === 'explode' && (
          <div className="relative">
            {/* Comic burst shape behind text */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 -m-16 sm:-m-24 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full max-w-[500px] opacity-90">
                <polygon
                  points={Array.from({ length: 20 }).map((_, i) => {
                    const angle = (i * Math.PI * 2) / 20 - Math.PI / 2;
                    const r = i % 2 === 0 ? 100 : 60;
                    return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                  }).join(' ')}
                  fill="#fdcb6e"
                  stroke="#e17055"
                  strokeWidth="3"
                />
              </svg>
            </motion.div>
            {/* Main text */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [0, 1.3, 1], rotate: [-15, 5, -2] }}
              transition={{ type: 'spring', stiffness: 300, damping: 10, duration: 0.6 }}
              className="font-serif text-5xl sm:text-7xl md:text-[6rem] font-black uppercase relative z-10"
              style={{
                color: '#e84393',
                WebkitTextStroke: '3px #2d3436',
                textShadow: '5px 5px 0px #fdcb6e, 10px 10px 0px rgba(0,0,0,0.3)',
                letterSpacing: '-0.02em',
              }}
            >
              IMPROOOOOOO
            </motion.div>
            {/* Little stars around */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                className="absolute text-2xl sm:text-3xl"
                style={{
                  top: `${20 + Math.sin(i * 0.8) * 40}%`,
                  left: `${10 + (i * 12)}%`,
                }}
              >
                {['✦', '★', '⚡', '💥', '✦', '⭐', '💫', '✨'][i]}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  // ── Splash state ───────────────────────────────────────────────────
  const [showSplash, setShowSplash] = useState(true);

  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice Martin', contact: 'alice@example.com', level: 'Intermédiaire' },
    { id: '2', name: 'Julien Bernard', contact: '06 12 34 56 78', level: 'Débutant' },
  ]);

  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newLevel, setNewLevel] = useState('Intermédiaire');

  const [completedPhases, setCompletedPhases] = useState<Record<string, boolean>>({});

  // Tab state — now with 3 tabs
  const [activeTab, setActiveTab] = useState<'cours' | 'prof' | 'backoffice'>('cours');

  // Persistent data via localStorage
  const [profs, setProfs] = useSupabaseStorage<ProfData[]>('profs', 'impro-profs', defaultProfs);
  const [courses, setCourses] = useSupabaseStorage<Course[]>('courses', 'impro-courses', defaultCourses);

  // Back office sub-views
  const [boView, setBoView] = useState<'list' | 'editCourse' | 'editProf'>('list');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingProf, setEditingProf] = useState<ProfData | null>(null);

  // Course view state — null means show grid, 'default' for built-in course, or course ID
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // State for impro generator — using enriched lists
  const [generatedIdea, setGeneratedIdea] = useState<{ qui: string, quoi: string, ou: string, emotion?: string, contrainte?: string } | null>(null);

  const generateIdea = () => {
    const randomQui = quiList[Math.floor(Math.random() * quiList.length)];
    const randomQuoi = quoiList[Math.floor(Math.random() * quoiList.length)];
    const randomOu = ouList[Math.floor(Math.random() * ouList.length)];
    const randomEmotion = emotionsList[Math.floor(Math.random() * emotionsList.length)];
    const randomContrainte = contraintesList[Math.floor(Math.random() * contraintesList.length)];
    setGeneratedIdea({ qui: randomQui, quoi: randomQuoi, ou: randomOu, emotion: randomEmotion, contrainte: randomContrainte });
  };

  const togglePhase = (id: string) => {
    setCompletedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addParticipant = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      contact: newContact,
      level: newLevel,
    };
    setParticipants([...participants, newParticipant]);
    setNewName('');
    setNewContact('');
    setNewLevel('Intermédiaire');
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Back office handlers
  const handleCreateCourse = () => {
    setEditingCourse(null);
    setBoView('editCourse');
  };
  const handleEditCourse = (id: string) => {
    setEditingCourse(courses.find(c => c.id === id) || null);
    setBoView('editCourse');
  };
  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };
  const handleSaveCourse = (course: Course) => {
    setCourses(prev => {
      const existing = prev.findIndex(c => c.id === course.id);
      if (existing >= 0) {
        return prev.map(c => c.id === course.id ? course : c);
      }
      return [...prev, course];
    });
    setBoView('list');
    setEditingCourse(null);
  };

  const handleCreateProf = () => {
    setEditingProf(null);
    setBoView('editProf');
  };
  const handleEditProf = (id: string) => {
    setEditingProf(profs.find(p => p.id === id) || null);
    setBoView('editProf');
  };
  const handleDeleteProf = (id: string) => {
    setProfs(prev => prev.filter(p => p.id !== id));
  };
  const handleSaveProf = (prof: ProfData) => {
    setProfs(prev => {
      const existing = prev.findIndex(p => p.id === prof.id);
      if (existing >= 0) {
        return prev.map(p => p.id === prof.id ? prof : p);
      }
      return [...prev, prof];
    });
    setBoView('list');
    setEditingProf(null);
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.6, delay: showSplash ? 0 : 0.3 }}
        className="min-h-screen flex flex-col overflow-x-hidden">
      {/* HEADER — Grand Theatre */}
      <header className="relative overflow-hidden pt-8 sm:pt-10 pb-8 sm:pb-10 px-4 sm:px-8" style={{ background: 'linear-gradient(180deg, #3a0a14 0%, #5c0a1a 15%, #8b1a2b 40%, #a02040 60%, #8b1a2b 85%, #4a0e1a 100%)' }}>
        {/* Left curtain drape */}
        <div className="absolute top-0 left-0 w-16 sm:w-28 h-full pointer-events-none" style={{
          background: 'linear-gradient(90deg, #5c0a1a 0%, #8b1a2b 40%, #a02040 60%, rgba(139,26,43,0) 100%)',
          borderRight: '1px solid rgba(197,150,27,0.15)',
        }} />
        <div className="absolute top-0 left-1 sm:left-3 w-8 sm:w-14 h-full pointer-events-none" style={{
          background: 'linear-gradient(90deg, rgba(92,10,26,0.6) 0%, rgba(139,26,43,0.3) 50%, transparent 100%)',
        }} />
        {/* Right curtain drape */}
        <div className="absolute top-0 right-0 w-16 sm:w-28 h-full pointer-events-none" style={{
          background: 'linear-gradient(270deg, #5c0a1a 0%, #8b1a2b 40%, #a02040 60%, rgba(139,26,43,0) 100%)',
          borderLeft: '1px solid rgba(197,150,27,0.15)',
        }} />
        <div className="absolute top-0 right-1 sm:right-3 w-8 sm:w-14 h-full pointer-events-none" style={{
          background: 'linear-gradient(270deg, rgba(92,10,26,0.6) 0%, rgba(139,26,43,0.3) 50%, transparent 100%)',
        }} />
        {/* Gold tassel/fringe at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-3 pointer-events-none" style={{
          background: 'repeating-linear-gradient(90deg, #c5961b 0px, #c5961b 3px, #8b6914 3px, #8b6914 6px, #e8c252 6px, #e8c252 8px, #c5961b 8px, #c5961b 12px)',
          opacity: 0.7,
        }} />
        <div className="absolute bottom-3 left-0 right-0 h-[1px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,150,27,0.5), transparent)' }} />
        {/* Spotlight glow from above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,194,82,0.1), transparent 70%)' }} />

        {/* Ornamental SVG volute */}
        <div className="absolute top-3 right-6 sm:right-12 opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-20 sm:h-20" fill="none" stroke="#c5961b" strokeWidth="1.5">
            <path d="M50 10 C70 10, 85 25, 85 45 C85 65, 70 75, 55 70 C40 65, 35 50, 45 40 C55 30, 65 35, 60 45 C55 55, 45 50, 48 44" />
            <path d="M50 90 C30 90, 15 75, 15 55 C15 35, 30 25, 45 30 C60 35, 65 50, 55 60 C45 70, 35 65, 40 55 C45 45, 55 50, 52 56" />
          </svg>
        </div>
        <div className="absolute top-3 left-6 sm:left-12 opacity-20 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
          <svg viewBox="0 0 100 100" className="w-14 h-14 sm:w-20 sm:h-20" fill="none" stroke="#c5961b" strokeWidth="1.5">
            <path d="M50 10 C70 10, 85 25, 85 45 C85 65, 70 75, 55 70 C40 65, 35 50, 45 40 C55 30, 65 35, 60 45 C55 55, 45 50, 48 44" />
            <path d="M50 90 C30 90, 15 75, 15 55 C15 35, 30 25, 45 30 C60 35, 65 50, 55 60 C45 70, 35 65, 40 55 C45 45, 55 50, 52 56" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight" style={{ color: '#e8c252', textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 30px rgba(197,150,27,0.2)' }}>
              Le Qui ? Le Quoi ? Le Ou ?
            </h1>
            {/* Gold decorative divider */}
            <div className="flex items-center justify-center gap-3 mt-3 mb-3">
              <div className="h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(90deg, transparent, #c5961b)' }} />
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="#c5961b"><path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" /></svg>
              <div className="h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(270deg, transparent, #c5961b)' }} />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-block px-5 py-1.5 font-mono text-[0.65rem] sm:text-[0.7rem] tracking-[0.2em] uppercase"
              style={{ background: 'linear-gradient(90deg, rgba(197,150,27,0.1), rgba(197,150,27,0.2), rgba(197,150,27,0.1))', border: '1px solid rgba(197,150,27,0.4)', borderRadius: '2px' }}
            >
              <span style={{ color: '#e8c252' }}>By Mondorito</span>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* TIMELINE — removed, now per-course in CourseView */}

      {/* TAB BAR — Theater program style */}
      <div className="sticky top-0 z-30 border-b" style={{ background: '#1a0a0a', borderColor: 'rgba(197,150,27,0.3)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-8 flex gap-1">
          <button
            onClick={() => setActiveTab('cours')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-[0.75rem] uppercase tracking-wider transition-all ${
              activeTab === 'cours'
                ? 'text-gold font-semibold'
                : 'text-cream/50 hover:text-cream/80'
            }`}
            style={activeTab === 'cours' ? { borderBottom: '2px solid #c5961b' } : {}}
          >
            <motion.span animate={activeTab === 'cours' ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <GraduationCap size={16} />
            </motion.span>
            Cours
          </button>
          <button
            onClick={() => setActiveTab('prof')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-[0.75rem] uppercase tracking-wider transition-all ${
              activeTab === 'prof'
                ? 'text-gold font-semibold'
                : 'text-cream/50 hover:text-cream/80'
            }`}
            style={activeTab === 'prof' ? { borderBottom: '2px solid #c5961b' } : {}}
          >
            <motion.span animate={activeTab === 'prof' ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <User size={16} />
            </motion.span>
            Prof
          </button>
          <button
            onClick={() => { setActiveTab('backoffice'); setBoView('list'); }}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-[0.75rem] uppercase tracking-wider transition-all ${
              activeTab === 'backoffice'
                ? 'text-gold font-semibold'
                : 'text-cream/50 hover:text-cream/80'
            }`}
            style={activeTab === 'backoffice' ? { borderBottom: '2px solid #c5961b' } : {}}
          >
            <motion.span animate={activeTab === 'backoffice' ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <Lock size={16} />
            </motion.span>
            Coulisses
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-grow w-full dots-pattern">

        {/* PROF SHOWCASE TAB */}
        {activeTab === 'prof' && (
          <ProfShowcase profs={profs} />
        )}

        {/* BACK OFFICE TAB */}
        {activeTab === 'backoffice' && (
          <>
            {boView === 'list' && (
              <BackOffice
                courses={courses}
                profs={profs}
                onCreateCourse={handleCreateCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onCreateProf={handleCreateProf}
                onEditProf={handleEditProf}
                onDeleteProf={handleDeleteProf}
                onExit={() => setActiveTab('cours')}
              />
            )}
            {boView === 'editCourse' && (
              <CourseBuilder
                course={editingCourse}
                profs={profs}
                templates={courseTemplates}
                onSave={handleSaveCourse}
                onCancel={() => { setBoView('list'); setEditingCourse(null); }}
              />
            )}
            {boView === 'editProf' && (
              <ProfEditor
                prof={editingProf}
                onSave={handleSaveProf}
                onCancel={() => { setBoView('list'); setEditingProf(null); }}
              />
            )}
          </>
        )}

        {/* COURS TAB */}
        {activeTab === 'cours' && (
          <>

        {/* Course View — when a course is selected */}
        {selectedCourseId && (() => {
          const course = courses.find(c => c.id === selectedCourseId);
          if (!course) return null;
          const prof = profs.find(p => p.id === course.profId) || null;
          return (
            <CourseView
              course={course}
              prof={prof}
              onBack={() => setSelectedCourseId(null)}
            />
          );
        })()}

        {/* Home: Course Grid + Generator */}
        {!selectedCourseId && (
          <>

        {/* COURSE CARDS GRID */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-sm" style={{ background: 'rgba(197,150,27,0.1)', border: '1px solid rgba(197,150,27,0.2)' }}>
              <BookOpen size={20} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Nos Cours</h2>
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Cliquez pour entrer en scene</p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="card-pop rounded-sm p-10 text-center">
              <BookOpen size={48} className="text-gold/40 mx-auto mb-4" />
              <p className="text-ink font-serif text-xl">Pas encore de cours...</p>
              <p className="text-muted mt-2 text-sm">Rendez-vous dans les Coulisses pour creer votre premier spectacle !</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {courses.map((course, i) => {
                const prof = profs.find(p => p.id === course.profId);
                const funColors = ['#c5961b', '#8b1a2b', '#c41230', '#8b6914', '#e8c252', '#5c0a1a', '#c5961b'];
                const cardColor = funColors[i % funColors.length];
                return (
                  <motion.button
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.04, y: -4, rotate: i % 2 === 0 ? 1 : -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedCourseId(course.id)}
                    className="relative rounded-sm overflow-hidden text-left group aspect-square flex flex-col transition-all duration-200"
                    style={{
                      background: '#fff8e7',
                      borderLeft: `3px solid #c5961b`,
                      border: `1px solid rgba(197,150,27,0.2)`,
                      borderLeftWidth: '3px',
                      borderLeftColor: '#c5961b',
                      boxShadow: `0 2px 8px rgba(26,10,10,0.08)`,
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px rgba(197,150,27,0.15), 0 2px 12px rgba(26,10,10,0.08)`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 8px rgba(26,10,10,0.08)`; }}
                  >
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${cardColor}, ${cardColor}60)` }} />
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <span className="font-mono text-[0.55rem] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold bg-accent/15 text-accent">
                          {course.level}
                        </span>
                        <h3 className="font-serif font-bold text-ink text-sm sm:text-base mt-2 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <div className="mt-auto pt-3">
                        <div className="flex items-center gap-1.5 text-muted font-mono text-[0.6rem]">
                          <Clock size={10} />
                          {course.duration} min
                        </div>
                        {prof && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold overflow-hidden border"
                              style={{ borderColor: prof.color, backgroundColor: prof.color + '20', color: prof.color }}
                            >
                              {prof.photo ? (
                                <img src={prof.photo} alt={prof.name} className="w-full h-full object-cover" />
                              ) : (
                                prof.name.charAt(0)
                              )}
                            </div>
                            <span className="font-mono text-[0.6rem] text-muted truncate">{prof.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>

        {/* GENERATEUR D'IDEES */}
        <section className="mb-12">
          <div className="rounded-sm p-6 relative overflow-hidden gold-border" style={{ background: '#fff8e7' }}>
            {/* Decorative glow spots */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(197,150,27,0.06), transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,26,43,0.04), transparent 70%)' }} />
            <div className="absolute top-3 right-4 opacity-15 pointer-events-none">
              <Sparkles size={60} className="text-gold" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative">
              <div className="p-2.5 rounded-sm" style={{ background: 'rgba(197,150,27,0.12)', border: '1px solid rgba(197,150,27,0.25)' }}>
                <Sparkles size={20} className="text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink">Generateur d'Impro</h2>
                <p className="text-xs text-muted font-mono uppercase tracking-wider">
                  {quiList.length} personnages · {quoiList.length} situations · {ouList.length} lieux
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <IdeaPart icon={<User size={16} />} label="Qui ?" value={generatedIdea?.qui} color="bg-accent/15 text-accent" />
              <IdeaPart icon={<Activity size={16} />} label="Quoi ?" value={generatedIdea?.quoi} color="bg-gold/15 text-gold-dark" />
              <IdeaPart icon={<MapPin size={16} />} label="Ou ?" value={generatedIdea?.ou} color="bg-burgundy/15 text-burgundy" />
            </div>

            {generatedIdea && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"
              >
                <div className="flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm" style={{ background: 'rgba(197,150,27,0.1)', border: '1px solid rgba(197,150,27,0.2)' }}>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-gold/70">Emotion</span>
                  <span className="font-medium text-gold-dark">{generatedIdea.emotion}</span>
                </div>
                <div className="flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm" style={{ background: 'rgba(139,26,43,0.08)', border: '1px solid rgba(139,26,43,0.15)' }}>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-curtain/70">Contrainte</span>
                  <span className="font-medium text-curtain">{generatedIdea.contrainte}</span>
                </div>
              </motion.div>
            )}

            <button
              onClick={generateIdea}
              className="w-full py-3.5 rounded-sm font-serif font-bold text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.97] animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #8b1a2b, #c41230)', color: '#e8c252', boxShadow: '0 4px 20px rgba(139,26,43,0.25)' }}
            >
              <RefreshCw size={18} className={generatedIdea ? "animate-spin-once" : ""} />
              {generatedIdea ? "Generer une autre idee" : "Lancer l'inspiration"}
            </button>
          </div>
        </section>

        </>
        )}

        </>
        )}
      </main>

      <footer className="text-center py-6 font-mono text-[0.7rem] tracking-widest" style={{ background: 'linear-gradient(180deg, #1a0a0a, #2a0e14)', borderTop: '2px solid rgba(197,150,27,0.3)' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1px] w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,150,27,0.4))' }} />
          <svg viewBox="0 0 20 20" className="w-3 h-3" fill="#c5961b"><path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" /></svg>
          <div className="h-[1px] w-16" style={{ background: 'linear-gradient(270deg, transparent, rgba(197,150,27,0.4))' }} />
        </div>
        <span className="text-gold/70 italic font-sans">Improvisation theatrale</span> <span className="text-gold/40 mx-1">|</span> <span className="text-cream/60">By Mondorito</span> <span className="text-gold/40 mx-1">|</span> <span className="text-gold">Le spectacle continue</span>
      </footer>
    </motion.div>
    </>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.7rem] text-muted font-mono">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
      {label}
    </div>
  );
}

function Phase({ id, time, duration, title, color, intro, isCompleted, onToggle, children }: {
  id: string;
  time: string;
  duration?: number;
  title: string;
  color: string;
  intro: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  children: ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`mb-10 pl-4 sm:pl-6 border-l-2 sm:border-l-3 relative transition-opacity duration-500 ${isCompleted ? 'opacity-40' : 'opacity-100'}`}
      style={{ borderLeftColor: color }}
    >
      <div className="absolute -left-[7px] sm:-left-[10px] top-0 w-[13px] h-[13px] sm:w-[17px] sm:h-[17px] rounded-full border-2 sm:border-3 border-stage" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-sm whitespace-nowrap" style={{ background: 'rgba(197,150,27,0.1)', color: '#7a6655' }}>
            {time}
          </span>
          <h2 className={`font-serif text-lg sm:text-xl font-bold transition-all ${isCompleted ? 'text-muted line-through' : 'text-ink'}`}>
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {duration && <PhaseTimer duration={duration} color={color} />}
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-1 rounded-sm text-[0.65rem] sm:text-[0.7rem] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              isCompleted ? 'bg-gold/20 text-gold' : 'bg-gold/10 text-muted hover:bg-gold/20'
            }`}
          >
            {isCompleted ? <CheckCircle2 size={14} /> : null}
            {isCompleted ? 'Termine' : 'Marquer comme fait'}
          </button>
        </div>
      </div>

      <p className="text-sm text-muted italic mb-4">{intro}</p>
      {children}
    </motion.section>
  );
}

function PhaseTimer({ duration, color }: { duration: number; color: string }) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFinished = timeLeft === 0;

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-sm font-mono text-[0.65rem] sm:text-[0.75rem] text-ink ${isFinished ? 'animate-pulse bg-accent text-white' : ''}`} style={!isFinished ? { background: 'rgba(197,150,27,0.12)', border: '1px solid rgba(197,150,27,0.2)' } : {}}>
      <span className="w-8 sm:w-10 text-center">{formatTime(timeLeft)}</span>
      <div className="flex items-center gap-1 border-l border-muted/30 pl-1.5 sm:pl-2">
        <button onClick={toggle} className="hover:text-gold transition-colors p-0.5">
          {isActive ? <Pause size={10} className="sm:w-[12px] sm:h-[12px]" /> : <Play size={10} className="sm:w-[12px] sm:h-[12px]" />}
        </button>
        <button onClick={reset} className="hover:text-gold transition-colors p-0.5">
          <RotateCcw size={10} className="sm:w-[12px] sm:h-[12px]" />
        </button>
      </div>
    </div>
  );
}

function ExerciseCard({ name, tag, description, steps, tip, objectifs, variante, children }: {
  name: string;
  tag?: string;
  description: string;
  steps: string[];
  tip?: string;
  objectifs?: string[];
  variante?: string;
  children?: ReactNode;
}) {
  return (
    <div className="card-pop rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-1.5">
        <h3 className="font-sans font-medium text-base text-ink">{name}</h3>
        {tag && <span className="font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-gold/10 text-gold">{tag}</span>}
      </div>
      <p className="text-[0.88rem] text-muted mb-3 leading-relaxed">{description}</p>

      <ul className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="text-[0.85rem] pl-7 relative border-t border-warm pt-2 first:border-t-0 first:pt-0 text-ink/80">
            <span className="absolute left-0 top-2 first:top-0 w-5 h-5 rounded-full bg-gold/15 text-gold font-mono text-[0.7rem] flex items-center justify-center">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>

      {children}

      {tip && (
        <div className="rounded-sm p-3.5 mt-3 flex gap-3 items-start" style={{ background: 'rgba(197,150,27,0.08)', border: '1px solid rgba(197,150,27,0.15)' }}>
          <Lightbulb size={16} className="text-gold mt-0.5 shrink-0" />
          <div className="text-[0.83rem] text-gold/80 leading-relaxed">
            {tip}
          </div>
        </div>
      )}

      {variante && (
        <div className="border-l-3 border-gold p-3 rounded-r-sm mt-3 text-[0.82rem] text-gold/80" style={{ background: 'rgba(197,150,27,0.06)' }}>
          <strong>Variante :</strong> {variante}
        </div>
      )}

      {objectifs && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {objectifs.map(obj => (
            <span key={obj} className={`font-mono text-[0.65rem] px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getObjClass(obj)}`}>
              {obj}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BilanCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card-pop rounded-xl p-4">
      <h4 className="font-sans font-medium text-[0.85rem] mb-2 flex items-center gap-2 text-ink">
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[0.8rem] text-muted flex gap-2 items-start">
            <ArrowRight size={12} className="text-accent mt-1 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getObjClass(obj: string) {
  switch (obj.toLowerCase()) {
    case 'qui': return 'bg-accent/15 text-accent';
    case 'quoi': return 'bg-gold/15 text-gold-dark';
    case 'où': return 'bg-burgundy/15 text-burgundy';
    case 'corps': return 'bg-curtain/15 text-curtain';
    case 'écoute': return 'bg-gold/20 text-gold';
    default: return 'bg-gold/10 text-muted';
  }
}

function IdeaPart({ icon, label, value, color }: { icon: ReactNode, label: string, value?: string, color: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
        {icon}
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value || 'empty'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`min-h-[60px] flex items-center justify-center text-center p-3 rounded-sm text-sm font-bold leading-tight ${value ? color : 'text-muted italic border border-dashed border-gold/30'}`}
        >
          {value || "???"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
