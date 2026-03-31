/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useState, FormEvent, useEffect, useRef, ChangeEvent } from "react";
import { Clock, Users, GraduationCap, Lightbulb, Target, Info, MessageSquare, ArrowRight, Plus, Trash2, UserPlus, Mail, CheckCircle2, Play, Pause, RotateCcw, Sparkles, RefreshCw, MapPin, User, Activity, Camera, Star, Edit3, Award, X, ChevronLeft, ChevronRight } from "lucide-react";

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
  attributes: { id: string; label: string; value: number }[];
}

const defaultProfs: ProfData[] = [
  {
    id: 'mondorito',
    photo: null,
    name: 'Mondorito',
    bio: "Coach d'impro depuis 15 ans. Spécialité : le jeu corporel et l'écoute active.",
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
    photo: null,
    name: 'Michel',
    bio: "Émotion volcanique. Spécialiste du jeu intense et des montées dramatiques qui emportent tout sur leur passage.",
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
    photo: null,
    name: 'Cathy',
    bio: "Chanteuse et danseuse émérite. Elle mêle le mouvement, la voix et le rythme pour une impro totalement incarnée.",
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
    photo: null,
    name: 'Gwen',
    bio: "Créative de génie. Reine de l'inattendu, elle transforme chaque scène en univers singulier et surprenant.",
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

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice Martin', contact: 'alice@example.com', level: 'Intermédiaire' },
    { id: '2', name: 'Julien Bernard', contact: '06 12 34 56 78', level: 'Débutant' },
  ]);

  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newLevel, setNewLevel] = useState('Intermédiaire');

  // State for phase completion
  const [completedPhases, setCompletedPhases] = useState<Record<string, boolean>>({});

  // Tab state
  const [activeTab, setActiveTab] = useState<'cours' | 'prof'>('cours');

  // Prof state — multi-prof
  const [profs, setProfs] = useState<ProfData[]>(defaultProfs);
  const [activeProfIndex, setActiveProfIndex] = useState(0);
  const [editingAttr, setEditingAttr] = useState<string | null>(null);
  const [newAttrLabel, setNewAttrLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProf = profs[activeProfIndex];

  const updateProf = (patch: Partial<ProfData>) => {
    setProfs(prev => prev.map((p, i) => i === activeProfIndex ? { ...p, ...patch } : p));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateProf({ photo: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const updateAttribute = (id: string, value: number) => {
    updateProf({ attributes: activeProf.attributes.map(a => a.id === id ? { ...a, value: Math.max(0, Math.min(10, value)) } : a) });
  };

  const removeAttribute = (id: string) => {
    updateProf({ attributes: activeProf.attributes.filter(a => a.id !== id) });
  };

  const addAttribute = () => {
    if (!newAttrLabel.trim()) return;
    updateProf({ attributes: [...activeProf.attributes, { id: Math.random().toString(36).substr(2, 9), label: newAttrLabel, value: 5 }] });
    setNewAttrLabel('');
  };

  // State for impro generator
  const [generatedIdea, setGeneratedIdea] = useState<{ qui: string, quoi: string, ou: string } | null>(null);

  const quiList = ["Un chirurgien maladroit", "Un astronaute claustrophobe", "Un enfant de 5 ans", "Un espion débutant", "Un guide touristique blasé", "Un fantôme timide", "Un pirate sans bateau", "Un détective privé", "Un chef étoilé colérique", "Un bibliothécaire rebelle"];
  const quoiList = ["Cherche ses clés", "Attend un accouchement", "Désamorce une bombe", "Prépare un gâteau", "Passe un entretien d'embauche", "Répare une fuite d'eau", "Apprend à voler", "Écrit une lettre d'amour", "Fait sa valise", "Nettoie une scène de crime"];
  const ouList = ["Dans un ascenseur en panne", "Sur la lune", "Dans une bibliothèque", "Au fond de l'océan", "Dans un tribunal", "Dans une jungle", "Dans un supermarché à minuit", "Sur un toit d'immeuble", "Dans une salle d'attente", "Dans un cirque"];

  const generateIdea = () => {
    const randomQui = quiList[Math.floor(Math.random() * quiList.length)];
    const randomQuoi = quoiList[Math.floor(Math.random() * quoiList.length)];
    const randomOu = ouList[Math.floor(Math.random() * ouList.length)];
    setGeneratedIdea({ qui: randomQui, quoi: randomQuoi, ou: randomOu });
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

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* HEADER — rideau de théâtre */}
      <header className="bg-stage text-cream pt-8 sm:pt-12 px-4 sm:px-8 pb-8 sm:pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#c8440a_0px,#c8440a_20px,#b8860b_20px,#b8860b_40px)]" />
        
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start md:items-end">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-gold mb-2">
              Cours d'improvisation théâtrale
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Le <em className="italic text-accent not-italic">Qui ?</em> le <em className="italic text-accent not-italic">Quoi ?</em><br className="hidden sm:block" /> le <em className="italic text-accent not-italic">Où ?</em>
            </h1>
            <div className="font-mono text-[0.65rem] sm:text-[0.7rem] tracking-[0.15em] uppercase text-gold/70 mt-1">By Mondorito</div>
            <p className="mt-3 text-muted-foreground/80 text-sm max-w-lg">
              Poser un décor incarné en moins de 30 secondes — par le corps, la voix et l'espace, avec ou sans paroles.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-left md:text-right font-mono text-[0.75rem] text-muted leading-loose"
          >
            <div className="flex flex-row md:flex-col items-center md:items-end gap-6 md:gap-2 flex-wrap">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-gold" />
                <div className="flex flex-col md:items-end">
                  <strong className="text-cream text-lg font-sans font-medium leading-none">1 h 00</strong>
                  <span className="text-[0.6rem] uppercase tracking-tighter opacity-70">durée</span>
                </div>
              </span>
              <span className="flex items-center gap-2">
                <Users size={14} className="text-gold" />
                <div className="flex flex-col md:items-end">
                  <strong className="text-cream text-lg font-sans font-medium leading-none">10</strong>
                  <span className="text-[0.6rem] uppercase tracking-tighter opacity-70">élèves</span>
                </div>
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap size={14} className="text-gold" />
                <div className="flex flex-col md:items-end">
                  <strong className="text-cream text-lg font-sans font-medium leading-none">2 ans</strong>
                  <span className="text-[0.6rem] uppercase tracking-tighter opacity-70">niveau</span>
                </div>
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* TIMELINE TOTALE */}
      <div className="bg-stage px-4 sm:px-8 pb-6">
        <div className="max-w-3xl mx-auto">
          <div className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-muted mb-2">
            Structure de la séance
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            <div className="h-full rounded-sm bg-[#4a7c59] flex-[10]" title="Échauffement" />
            <div className="h-full rounded-sm bg-gold flex-[5]" title="Théorie" />
            <div className="h-full rounded-sm bg-[#5b8fd4] flex-[15]" title="Exo 1" />
            <div className="h-full rounded-sm bg-[#9b59b6] flex-[15]" title="Exo 2" />
            <div className="h-full rounded-sm bg-accent flex-[15]" title="Exo 3" />
            <div className="h-full rounded-sm bg-[#e67e22] flex-[10]" title="Bilan" />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
            <LegendItem color="#4a7c59" label="Échauffement · 10 min" />
            <LegendItem color="#b8860b" label="Théorie · 5 min" />
            <LegendItem color="#5b8fd4" label="Exo 1 · Corps & Espace · 15 min" />
            <LegendItem color="#9b59b6" label="Exo 2 · Tableaux muets · 15 min" />
            <LegendItem color="#c8440a" label="Exo 3 · Scènes courtes · 15 min" />
            <LegendItem color="#e67e22" label="Bilan · 5 min" />
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="bg-cream border-b border-warm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 flex">
          <button
            onClick={() => setActiveTab('cours')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-mono text-[0.75rem] uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'cours' ? 'border-accent text-accent font-medium' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <GraduationCap size={16} />
            Cours
          </button>
          <button
            onClick={() => setActiveTab('prof')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-mono text-[0.75rem] uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'prof' ? 'border-accent text-accent font-medium' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <User size={16} />
            Prof
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-grow">
        
        {activeTab === 'prof' && (
          <ProfTab
            profs={profs}
            activeProfIndex={activeProfIndex}
            setActiveProfIndex={setActiveProfIndex}
            activeProf={activeProf}
            updateProf={updateProf}
            editingAttr={editingAttr}
            setEditingAttr={setEditingAttr}
            newAttrLabel={newAttrLabel}
            setNewAttrLabel={setNewAttrLabel}
            fileInputRef={fileInputRef}
            handlePhotoUpload={handlePhotoUpload}
            updateAttribute={updateAttribute}
            removeAttribute={removeAttribute}
            addAttribute={addAttribute}
          />
        )}

        {activeTab === 'cours' && (
          <>
        {/* GENERATEUR D'IDEES */}
        <section className="mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gold/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={80} className="text-gold" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gold/10 p-2 rounded-lg">
                <Sparkles size={20} className="text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink">Générateur d'Impro</h2>
                <p className="text-xs text-muted font-mono uppercase tracking-wider">Trouvez l'inspiration en un clic</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <IdeaPart icon={<User size={16} />} label="Qui ?" value={generatedIdea?.qui} color="bg-[#d4e8d4] text-[#2a5a2a]" />
              <IdeaPart icon={<Activity size={16} />} label="Quoi ?" value={generatedIdea?.quoi} color="bg-[#d4dff5] text-[#1a3060]" />
              <IdeaPart icon={<MapPin size={16} />} label="Où ?" value={generatedIdea?.ou} color="bg-[#f5d4d4] text-[#6a1a1a]" />
            </div>

            <button 
              onClick={generateIdea}
              className="w-full bg-stage text-cream py-3 rounded-lg font-medium hover:bg-ink transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <RefreshCw size={18} className={generatedIdea ? "animate-spin-once" : ""} />
              {generatedIdea ? "Générer une autre idée" : "Lancer l'inspiration"}
            </button>
          </div>
        </section>

        {/* PHASE 1 */}
        <Phase 
          id="warmup"
          time="0 – 10 min" 
          duration={10}
          title="Échauffement — Le Corps dans l'Espace" 
          color="#4a7c59"
          intro="Activer le corps, libérer les inhibitions, occuper l'espace ensemble."
          isCompleted={completedPhases['warmup']}
          onToggle={() => togglePhase('warmup')}
        >
          <ExerciseCard 
            name="La Marche des Statuts" 
            tag="Collectif"
            description="Marche libre dans l'espace. Le coach crie un chiffre de 1 à 10 qui désigne un statut social/état émotionnel. Tout le monde adapte immédiatement sa posture, son regard, son allure."
            steps={[
              "Marche neutre 1 min — on remplit tout l'espace, on évite de tourner en rond.",
              "Coach crie « 2 » (timide, effacé) → corps rentré, regard bas.",
              "Coach crie « 9 » (PDG du monde) → port de tête haut, pas lent et assuré.",
              "Alterner rapidement 2-8-1-10 — observer ce que ça change en soi.",
              "Variante finale : chaque participant choisit son statut et on essaie de lire ceux des autres."
            ]}
            tip="On cherche à ancrer que le corps raconte avant la bouche. C'est le cœur du cours."
            objectifs={["Qui", "Corps"]}
          />
        </Phase>

        {/* PHASE 2 */}
        <Phase 
          id="theory"
          time="10 – 15 min" 
          duration={5}
          title="Mini-cours — Les 3 questions, les 3 couches" 
          color="#b8860b"
          intro="On ne fait pas la théorie au tableau : on l'énonce debout, en cercle, en 5 min."
          isCompleted={completedPhases['theory']}
          onToggle={() => togglePhase('theory')}
        >
          <ExerciseCard 
            name="Le Triptyque du Décor"
            description="Le coach pose les trois questions et leurs trois couches d'expression possibles. Chaque participant peut donner un exemple vite fait."
            steps={[
              "QUI ? → Identité, relation, statut. Vecteurs : posture, costume imaginaire, manière de regarder l'autre.",
              "QUOI ? → L'action, l'activité, l'enjeu. Vecteurs : geste fonctionnel précis, objet imaginaire manipulé, rythme.",
              "OÙ ? → Le lieu, l'atmosphère, la période. Vecteurs : résistances physiques (sol, air, lumière), points d'ancrage dans l'espace, réactions à l'environnement."
            ]}
            tip="Règle d'or : « Dans les 30 premières secondes d'une scène, au moins deux des trois questions doivent avoir une réponse claire pour le public — sans qu'on l'explique. »"
          />
        </Phase>

        {/* PHASE 3 */}
        <Phase 
          id="ex1"
          time="15 – 30 min" 
          duration={15}
          title="Exercice 1 — L'Objet Révélateur" 
          color="#5b8fd4"
          intro="Utiliser un geste ou un objet imaginaire pour installer simultanément Qui, Quoi et Où — sans un mot."
          isCompleted={completedPhases['ex1']}
          onToggle={() => togglePhase('ex1')}
        >
          <ExerciseCard 
            name="Entrée en scène silencieuse"
            tag="Solo / 1 min chacun"
            description="Chaque participant entre seul sur la « scène » et installe un début de scène en 45 secondes, sans parole. Le groupe observe et tente de répondre aux 3 questions."
            steps={[
              "Le coach tire une carte (ou dit à voix basse) un contexte parmi : chirurgien en salle d'op, enfant le matin de Noël, plombier sous un évier, astronaute en sortie EVA, boulanger à 4h du mat, accusé au tribunal.",
              "L'improvisateur entre, s'installe, fait une action physique précise — 45 sec max.",
              "Arrêt. Le public répond : Qui ? Quoi ? Où ? — main levée, une réponse par personne.",
              "L'improvisateur révèle son intention et on compare. Discussion 1 min max.",
              "Passer au suivant. Viser 5 passages en 15 min (groupes de 2 si besoin)."
            ]}
            tip="Ce qu'on cherche : la précision du geste (pas une indication floue, mais la résistance d'un couvercle qui résiste, l'odeur d'un produit, le poids d'un instrument). Le vague ne raconte rien."
            variante="Imposer que la réponse au Où soit donnée uniquement par la relation du corps au sol et à l'air — sans aucun objet manipulé."
            objectifs={["Qui", "Quoi", "Où", "Corps"]}
          />
        </Phase>

        {/* PHASE 4 */}
        <Phase 
          id="ex2"
          time="30 – 45 min" 
          duration={15}
          title="Exercice 2 — Tableau Vivant à Deux" 
          color="#9b59b6"
          intro="Construire un contexte à deux joueurs — la relation crée le Qui et densifie tout le reste."
          isCompleted={completedPhases['ex2']}
          onToggle={() => togglePhase('ex2')}
        >
          <ExerciseCard 
            name="Freeze & Read"
            tag="Duos · 2 min / scène"
            description="Deux joueurs entrent et démarrent une scène sans parole. Au bout de 30 secondes le coach crie « Freeze ! » — les deux se figent. Le reste du groupe lit la scène."
            steps={[
              "Former 5 duos. Chaque duo reçoit un contexte.",
              "Les deux entrent, s'installent, commencent à jouer — sans parole ou avec très peu.",
              "Freeze à 30 sec. Lecture par les observateurs : Qui est qui ? Quelle relation ? Où ? Que se passe-t-il ?",
              "Dégel : le duo continue 1 min, peut parler maintenant pour confirmer ou infirmer les lectures.",
              "Bref retour collectif : qu'est-ce qui a immédiatement installé le contexte ? Qu'est-ce qui était ambigu ?"
            ]}
            tip="Point coaching clé : regarder si les deux joueurs habitent le même espace — même sol, même lumière, même température. Une des erreurs les plus fréquentes est de jouer côte à côte dans des univers différents."
            objectifs={["Qui", "Où", "Écoute", "Corps"]}
          >
            <div className="bg-warm/30 rounded-lg p-4 mt-4">
              <div className="font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-2">Contextes suggérés pour les duos</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>👨‍⚕️ Dentiste / patient très anxieux</div>
                <div>🚀 Deux astronautes (attente décollage)</div>
                <div>📚 Bibliothécaire / étudiant épuisé</div>
                <div>🍳 Chef étoilé / stagiaire maladroit</div>
                <div>⚖️ Avocat / client en plein déni</div>
                <div>🏕️ Deux randonneurs perdus (brouillard)</div>
                <div>🎭 Metteur en scène / acteur (répétition)</div>
                <div>🛒 Caissière / client pressé</div>
              </div>
            </div>
          </ExerciseCard>
        </Phase>

        {/* PHASE 5 */}
        <Phase 
          id="ex3"
          time="45 – 60 min" 
          duration={15}
          title="Exercice 3 — Scènes Courtes" 
          color="#c8440a"
          intro="Intégration finale. On joue de vraies scènes de 2 à 4 min avec la contrainte que le décor soit posé en 20 secondes."
          isCompleted={completedPhases['ex3']}
          onToggle={() => togglePhase('ex3')}
        >
          <ExerciseCard 
            name="Le Chrono du Décor"
            tag="Groupes de 3 · 3 min / scène"
            description="Former des groupes de 3. Une personne observe et chronomètre mentalement. Le coach donne un contexte tiré au hasard — les joueurs ont 20 secondes pour installer le Qui Quoi Où."
            steps={[
              "Le coach donne le contexte. Les 2 joueurs entrent immédiatement.",
              "L'observateur chronomètre et note mentalement à quel moment il a compris les 3 éléments.",
              "Scène libre jusqu'à 3-4 min ou jusqu'au signal du coach.",
              "L'observateur donne son retour : « J'ai compris le Où à 8 sec, le Qui à 12 sec... »",
              "On passe au trio suivant."
            ]}
            tip="Règle pour les joueurs : ne jamais annoncer le contexte. Montrer, ne pas dire."
            variante="Le coach peut crier « Silence ! » à n'importe quel moment — les joueurs doivent maintenir la scène par le corps."
            objectifs={["Qui", "Quoi", "Où", "Écoute", "Corps"]}
          />
        </Phase>

        {/* BILAN */}
        <Phase 
          id="debrief"
          time="55 – 60 min" 
          duration={5}
          title="Bilan — Le Cercle des 3 Questions" 
          color="#e67e22"
          intro="Debriefing debout, en cercle, 5 min. Chacun répond à une seule question."
          isCompleted={completedPhases['debrief']}
          onToggle={() => togglePhase('debrief')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <BilanCard 
              title="🟢 Ce que j'ai trouvé facile"
              items={["Installer le Où par le sol", "La relation physique à l'autre", "Le geste fonctionnel"]}
            />
            <BilanCard 
              title="🔴 Ce qui m'a résisté"
              items={["Résister à l'envie d'expliquer", "Habiter le même espace que l'autre", "Maintenir sans parole sous tension"]}
            />
            <BilanCard 
              title="🎯 À retenir"
              items={["Le corps parle avant la voix", "Un geste précis vaut 10 lignes", "Le Où se ressent, il ne s'annonce pas"]}
            />
          </div>
        </Phase>

        {/* GESTION DES PARTICIPANTS */}
        <Phase 
          id="admin"
          time="Administration" 
          title="Gestion des Participants" 
          color="#1a1410"
          intro="Suivi des élèves présents pour cette séance d'improvisation."
          isCompleted={completedPhases['admin']}
          onToggle={() => togglePhase('admin')}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <form onSubmit={addParticipant} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 sm:gap-4 items-end mb-8">
              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-1.5">Nom complet</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Marie Curie"
                  className="w-full bg-cream/50 border border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-1.5">Contact</label>
                <input 
                  type="text" 
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Email ou Tél"
                  className="w-full bg-cream/50 border border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="block font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-1.5">Niveau</label>
                <select 
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full bg-cream/50 border border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold appearance-none"
                >
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
              </div>
              <button 
                type="submit"
                className="bg-stage text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-ink transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                Ajouter
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-warm">
                    <th className="py-3 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Nom</th>
                    <th className="py-3 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Contact</th>
                    <th className="py-3 font-mono text-[0.65rem] uppercase tracking-wider text-muted">Niveau</th>
                    <th className="py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm/50">
                  <AnimatePresence initial={false}>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-muted italic">
                          Aucun participant inscrit pour le moment.
                        </td>
                      </tr>
                    ) : (
                      participants.map((p) => (
                        <motion.tr 
                          key={p.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="group"
                        >
                          <td className="py-4 text-sm font-medium text-ink">{p.name}</td>
                          <td className="py-4 text-sm text-muted">{p.contact || '—'}</td>
                          <td className="py-4">
                            <span className={`text-[0.65rem] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              p.level === 'Débutant' ? 'bg-green-100 text-green-800' : 
                              p.level === 'Avancé' ? 'bg-purple-100 text-purple-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {p.level}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => removeParticipant(p.id)}
                              className="text-muted hover:text-accent transition-colors p-1"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </Phase>

        </>
        )}
      </main>

      <footer className="bg-stage text-muted text-center py-6 font-mono text-[0.7rem] tracking-widest">
        Cours préparé pour une séance de 10 participants · <span className="text-accent">Improvisation théâtrale</span> · Niveau intermédiaire
      </footer>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[0.7rem] text-muted font-mono">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
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
      className={`mb-10 pl-4 sm:pl-6 border-l-2 sm:border-l-3 relative transition-opacity duration-500 ${isCompleted ? 'opacity-50' : 'opacity-100'}`}
      style={{ borderLeftColor: color }}
    >
      <div className="absolute -left-[7px] sm:-left-[10px] top-0 w-[13px] h-[13px] sm:w-[17px] sm:h-[17px] rounded-full border-2 sm:border-3 border-cream" style={{ backgroundColor: color }} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-mono text-[0.65rem] bg-warm px-2.5 py-0.5 rounded-full text-muted whitespace-nowrap">
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
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-1 rounded-full text-[0.65rem] sm:text-[0.7rem] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-warm text-muted hover:bg-warm/80'
            }`}
          >
            {isCompleted ? <CheckCircle2 size={14} /> : null}
            {isCompleted ? 'Terminé' : 'Marquer comme fait'}
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-stage text-cream font-mono text-[0.65rem] sm:text-[0.75rem] ${isFinished ? 'animate-pulse bg-accent' : ''}`}>
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
    <div className="bg-white rounded-lg p-5 shadow-sm mb-4">
      <div className="flex items-center gap-3 mb-1.5">
        <h3 className="font-sans font-medium text-base">{name}</h3>
        {tag && <span className="font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-warm text-muted">{tag}</span>}
      </div>
      <p className="text-[0.88rem] text-muted mb-3 leading-relaxed">{description}</p>
      
      <ul className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="text-[0.85rem] pl-7 relative border-t border-warm pt-2 first:border-t-0 first:pt-0">
            <span className="absolute left-0 top-2 first:top-0 w-5 h-5 rounded-full bg-warm text-muted font-mono text-[0.7rem] flex items-center justify-center">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>

      {children}

      {tip && (
        <div className="bg-[#fdf6e3] border border-[#e8d5a0] rounded-md p-3.5 mt-3 flex gap-3 items-start">
          <Lightbulb size={16} className="text-[#b8860b] mt-0.5 shrink-0" />
          <div className="text-[0.83rem] text-[#6b5a2a] leading-relaxed">
            {tip}
          </div>
        </div>
      )}

      {variante && (
        <div className="bg-[#f4f1fb] border-l-3 border-[#9b59b6] p-3 rounded-r-md mt-3 text-[0.82rem] text-[#4a3060]">
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
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h4 className="font-sans font-medium text-[0.85rem] mb-2 flex items-center gap-2">
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
    case 'qui': return 'bg-[#d4e8d4] text-[#2a5a2a]';
    case 'quoi': return 'bg-[#d4dff5] text-[#1a3060]';
    case 'où': return 'bg-[#f5d4d4] text-[#6a1a1a]';
    case 'corps': return 'bg-[#ede4f5] text-[#3a1a5a]';
    case 'écoute': return 'bg-[#fdebd4] text-[#5a3010]';
    default: return 'bg-warm text-muted';
  }
}

function ProfTab({ profs, activeProfIndex, setActiveProfIndex, activeProf, updateProf, editingAttr, setEditingAttr, newAttrLabel, setNewAttrLabel, fileInputRef, handlePhotoUpload, updateAttribute, removeAttribute, addAttribute }: any) {
  const profPhoto = activeProf.photo;
  const profName = activeProf.name;
  const profBio = activeProf.bio;
  const profAttributes = activeProf.attributes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* PROF SELECTOR */}
      <section className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveProfIndex((activeProfIndex - 1 + profs.length) % profs.length)}
            className="p-2 rounded-full bg-white border border-warm hover:bg-warm/30 transition-colors shrink-0"
          >
            <ChevronLeft size={16} className="text-ink" />
          </button>
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-0">
              {profs.map((prof: ProfData, idx: number) => (
                <button
                  key={prof.id}
                  onClick={() => setActiveProfIndex(idx)}
                  className={`shrink-0 px-3 py-2 rounded-lg font-mono text-[0.7rem] uppercase tracking-wider transition-all ${
                    idx === activeProfIndex
                      ? 'bg-stage text-cream shadow-md'
                      : 'bg-white border border-warm text-muted hover:text-ink hover:border-gold/50'
                  }`}
                >
                  {prof.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setActiveProfIndex((activeProfIndex + 1) % profs.length)}
            className="p-2 rounded-full bg-white border border-warm hover:bg-warm/30 transition-colors shrink-0"
          >
            <ChevronRight size={16} className="text-ink" />
          </button>
        </div>
      </section>

      {/* PHOTO + IDENTITE */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-warm">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-warm/50 border-3 border-gold/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-gold transition-colors"
              >
                {profPhoto ? (
                  <img src={profPhoto} alt="Prof" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted">
                    <Camera size={28} />
                    <span className="font-mono text-[0.6rem] uppercase tracking-wider">Ajouter photo</span>
                  </div>
                )}
              </div>
              {profPhoto && (
                <button
                  onClick={() => updateProf({ photo: null })}
                  className="absolute -top-1 -right-1 bg-accent text-cream rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
            <div className="flex-1 text-center sm:text-left w-full min-w-0">
              <div className="font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-1">Nom du professeur</div>
              <input
                type="text"
                value={profName}
                onChange={(e: any) => updateProf({ name: e.target.value })}
                className="font-serif text-2xl sm:text-3xl font-bold text-ink bg-transparent border-b-2 border-transparent hover:border-warm focus:border-gold focus:outline-none w-full pb-1 transition-colors"
              />
              <div className="font-mono text-[0.65rem] uppercase tracking-wider text-muted mt-4 mb-1">Bio / parcours</div>
              <textarea
                value={profBio}
                onChange={(e: any) => updateProf({ bio: e.target.value })}
                placeholder="Coach d'impro depuis 15 ans. Spécialité : le jeu corporel et l'écoute active..."
                rows={3}
                className="w-full bg-cream/50 border border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ATTRIBUTS THEATRAUX */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-warm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Award size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Attributs Théâtraux</h2>
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Compétences clés du professeur</p>
            </div>
          </div>
          <div className="space-y-4">
            {profAttributes.map((attr: any) => (
              <div key={attr.id} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  {editingAttr === attr.id ? (
                    <input
                      type="text"
                      value={attr.label}
                      onChange={(e: any) => updateProf({ attributes: profAttributes.map((a: any) => a.id === attr.id ? { ...a, label: e.target.value } : a) })}
                      onBlur={() => setEditingAttr(null)}
                      onKeyDown={(e: any) => e.key === 'Enter' && setEditingAttr(null)}
                      autoFocus
                      className="font-mono text-[0.75rem] uppercase tracking-wider text-ink bg-cream/50 border border-warm rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  ) : (
                    <span
                      onClick={() => setEditingAttr(attr.id)}
                      className="font-mono text-[0.75rem] uppercase tracking-wider text-ink cursor-pointer hover:text-accent transition-colors flex items-center gap-1.5"
                    >
                      {attr.label}
                      <Edit3 size={10} className="opacity-0 group-hover:opacity-50" />
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-accent w-6 text-right">{attr.value}</span>
                    <span className="text-[0.6rem] text-muted">/10</span>
                    <button onClick={() => removeAttribute(attr.id)} className="text-muted hover:text-accent transition-colors p-0.5 opacity-0 group-hover:opacity-100">
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 h-2.5 bg-warm/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attr.value * 10}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #c8440a, #b8860b)' }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={attr.value}
                  onChange={(e: any) => updateAttribute(attr.id, parseInt(e.target.value))}
                  className="w-full h-1 mt-1 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-warm">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttrLabel}
                onChange={(e: any) => setNewAttrLabel(e.target.value)}
                onKeyDown={(e: any) => e.key === 'Enter' && addAttribute()}
                placeholder="Nouvel attribut..."
                className="flex-1 bg-cream/50 border border-warm rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <button
                onClick={addAttribute}
                className="bg-stage text-cream px-4 py-2 rounded-md text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
              >
                <Plus size={14} />
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RADAR VISUEL */}
      <section className="mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-warm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gold/10 p-2 rounded-lg">
              <Star size={20} className="text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Profil Radar</h2>
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Visualisation des compétences</p>
            </div>
          </div>
          <div className="flex justify-center">
            <RadarChart attributes={profAttributes} />
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function RadarChart({ attributes }: { attributes: { id: string; label: string; value: number }[] }) {
  const size = 280;
  const center = size / 2;
  const radius = 110;
  const n = attributes.length;

  if (n < 3) return <p className="text-sm text-muted italic">Ajoutez au moins 3 attributs pour voir le radar.</p>;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
      {gridLevels.map(level => {
        const points = Array.from({ length: n }, (_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#e8dfc8"
            strokeWidth={level === 10 ? 1.5 : 0.5}
          />
        );
      })}
      {attributes.map((_, i) => {
        const p = getPoint(i, 10);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e8dfc8" strokeWidth={0.5} />;
      })}
      <polygon
        points={attributes.map((a, i) => { const p = getPoint(i, a.value); return `${p.x},${p.y}`; }).join(' ')}
        fill="rgba(200,68,10,0.15)"
        stroke="#c8440a"
        strokeWidth={2}
      />
      {attributes.map((a, i) => {
        const p = getPoint(i, a.value);
        return <circle key={a.id} cx={p.x} cy={p.y} r={3.5} fill="#c8440a" />;
      })}
      {attributes.map((a, i) => {
        const p = getPoint(i, 12);
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
        return (
          <text
            key={a.id}
            x={p.x}
            y={p.y}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="text-[0.5rem] fill-[#7a6e60] font-mono uppercase"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
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
          className={`min-h-[60px] flex items-center justify-center text-center p-3 rounded-lg text-sm font-medium leading-tight shadow-inner ${value ? color : 'bg-cream/50 text-muted italic border border-dashed border-warm'}`}
        >
          {value || "???"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
