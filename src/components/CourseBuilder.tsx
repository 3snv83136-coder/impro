import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Save,
  X,
  GraduationCap,
  Clock,
  Target,
  User,
  Palette,
  BookOpen,
  Lightbulb,
  Tag,
  ListOrdered,
  FileText,
  LayoutTemplate,
  Check,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface PhaseExercise {
  name: string;
  tag?: string;
  description: string;
  steps: string[];
  tip?: string;
  objectives?: string[];
}

interface CoursePhase {
  id: string;
  title: string;
  duration: number;
  color: string;
  description: string;
  exercises: PhaseExercise[];
}

interface Course {
  id: string;
  title: string;
  duration: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  description: string;
  objectives: string[];
  profId: string | null;
  phases: CoursePhase[];
  createdAt: string;
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

interface CourseTemplate {
  title: string;
  duration: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
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

interface CourseBuilderProps {
  course: Course | null;
  profs: ProfData[];
  templates: CourseTemplate[];
  onSave: (course: Course) => void;
  onCancel: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).substr(2, 9);

const PHASE_COLORS = [
  "#c8440a",
  "#b8860b",
  "#2d6a4f",
  "#3a5ba0",
  "#7b2d8b",
  "#c44569",
];

const PHASE_COLOR_LABELS: Record<string, string> = {
  "#c8440a": "Feu",
  "#b8860b": "Or",
  "#2d6a4f": "Forêt",
  "#3a5ba0": "Ciel",
  "#7b2d8b": "Magie",
  "#c44569": "Rose",
};

const emptyExercise = (): PhaseExercise => ({
  name: "",
  tag: "",
  description: "",
  steps: [""],
  tip: "",
  objectives: [],
});

const emptyPhase = (): CoursePhase => ({
  id: genId(),
  title: "",
  duration: 15,
  color: PHASE_COLORS[0],
  description: "",
  exercises: [],
});

const emptyCourse = (): Course => ({
  id: genId(),
  title: "",
  duration: 60,
  level: "Débutant",
  description: "",
  objectives: [],
  profId: null,
  phases: [],
  createdAt: new Date().toISOString(),
});

// ── Component ──────────────────────────────────────────────────────────

export default function CourseBuilder({
  course,
  profs,
  templates,
  onSave,
  onCancel,
}: CourseBuilderProps) {
  const isEditing = course !== null;
  const [form, setForm] = useState<Course>(
    course
      ? { ...course, phases: course.phases.map((p) => ({ ...p })) }
      : emptyCourse()
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateFlash, setTemplateFlash] = useState(false);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(
    new Set()
  );
  const [newObjective, setNewObjective] = useState("");
  const [newExerciseObjectives, setNewExerciseObjectives] = useState<
    Record<string, string>
  >({});
  const formRef = useRef<HTMLDivElement>(null);

  // ── Form updaters ──

  const set = <K extends keyof Course>(key: K, value: Course[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updatePhase = (idx: number, patch: Partial<CoursePhase>) =>
    setForm((f) => ({
      ...f,
      phases: f.phases.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));

  const updateExercise = (
    phaseIdx: number,
    exIdx: number,
    patch: Partial<PhaseExercise>
  ) =>
    setForm((f) => ({
      ...f,
      phases: f.phases.map((p, pi) =>
        pi === phaseIdx
          ? {
              ...p,
              exercises: p.exercises.map((e, ei) =>
                ei === exIdx ? { ...e, ...patch } : e
              ),
            }
          : p
      ),
    }));

  // ── Template application ──

  const applyTemplate = (t: CourseTemplate) => {
    setForm({
      ...form,
      title: t.title,
      duration: t.duration,
      level: t.level,
      description: t.description,
      objectives: [...t.objectives],
      phases: t.phases.map((p) => ({
        id: genId(),
        title: p.title,
        duration: p.duration,
        color: p.color,
        description: p.description,
        exercises: p.exercises.map((e) => ({
          ...e,
          steps: [...e.steps],
          objectives: e.objectives ? [...e.objectives] : [],
        })),
      })),
    });
    setShowTemplates(false);
    setTemplateFlash(true);
    setCollapsedPhases(new Set());
    setTimeout(() => setTemplateFlash(false), 1200);
  };

  // ── Phase reorder ──

  const movePhase = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= form.phases.length) return;
    const next = [...form.phases];
    [next[idx], next[target]] = [next[target], next[idx]];
    set("phases", next);
  };

  // ── Toggle collapse ──

  const toggleCollapse = (id: string) =>
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Save ──

  const handleSave = () => {
    onSave({
      ...form,
      createdAt: isEditing ? form.createdAt : new Date().toISOString(),
    });
  };

  // ── Total phase duration ──

  const totalPhaseDuration = form.phases.reduce(
    (sum, p) => sum + p.duration,
    0
  );

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={formRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto p-4 sm:p-6"
    >
      {/* Flash overlay when template is applied */}
      <AnimatePresence>
        {templateFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl sm:text-8xl"
            >
              <Sparkles className="w-20 h-20 sm:w-32 sm:h-32 text-gold drop-shadow-lg" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute mt-40 font-serif text-2xl sm:text-3xl text-accent font-bold"
            >
              Template appliqué !
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-bold">
              {isEditing ? "Modifier le cours" : "Créer un cours"}
            </h1>
            <p className="text-muted text-sm font-mono">
              {isEditing
                ? "Ajustez les détails de votre cours"
                : "Construisez votre prochain cours d'impro"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Template picker ── */}
      {templates.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold/10 border-2 border-gold/30 text-gold hover:bg-gold/20 hover:border-gold/50 transition-all font-mono text-sm font-semibold"
          >
            <LayoutTemplate className="w-4 h-4" />
            Générer depuis un template
            <motion.span
              animate={{ rotate: showTemplates ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {templates.map((t, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => applyTemplate(t)}
                      className="text-left p-4 rounded-xl border-2 border-warm hover:border-accent/50 bg-white hover:bg-accent/5 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-serif text-ink font-bold text-sm group-hover:text-accent transition-colors">
                          {t.title}
                        </h3>
                        <span className="text-[10px] font-mono bg-fun-azur/10 text-muted px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                          {t.duration} min
                        </span>
                      </div>
                      <p className="text-muted text-xs line-clamp-2 mb-2">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {t.level}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          {t.phases.length} phases
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Basic Info ── */}
      <motion.div
        layout
        className="bg-white rounded-2xl border-2 border-warm p-5 sm:p-6 mb-6"
      >
        <h2 className="font-serif text-lg text-ink font-bold mb-5 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Informations générales
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider">
              Titre du cours
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex: L'art de l'écoute active"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-warm bg-cream text-ink placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors font-sans"
            />
          </div>

          {/* Duration + Level row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Durée totale (min)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                value={form.duration}
                onChange={(e) =>
                  set("duration", Math.max(1, parseInt(e.target.value) || 0))
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-warm bg-cream text-ink focus:border-accent/50 focus:outline-none transition-colors font-sans"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Niveau
              </label>
              <select
                value={form.level}
                onChange={(e) =>
                  set(
                    "level",
                    e.target.value as
                      | "Débutant"
                      | "Intermédiaire"
                      | "Avancé"
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-warm bg-cream text-ink focus:border-accent/50 focus:outline-none transition-colors font-sans appearance-none cursor-pointer"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Décrivez l'esprit et le contenu du cours..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-warm bg-cream text-ink placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors font-sans resize-none"
            />
          </div>

          {/* Objectives */}
          <div>
            <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Objectifs
            </label>
            <div className="space-y-2 mb-2">
              <AnimatePresence>
                {form.objectives.map((obj, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const next = [...form.objectives];
                        next[i] = e.target.value;
                        set("objectives", next);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-warm bg-cream text-ink text-sm focus:border-accent/50 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() =>
                        set(
                          "objectives",
                          form.objectives.filter((_, j) => j !== i)
                        )
                      }
                      className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newObjective.trim()) {
                    set("objectives", [
                      ...form.objectives,
                      newObjective.trim(),
                    ]);
                    setNewObjective("");
                  }
                }}
                placeholder="Ajouter un objectif..."
                className="flex-1 px-3 py-2 rounded-lg border-2 border-dashed border-warm bg-transparent text-ink text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
              />
              <button
                onClick={() => {
                  if (newObjective.trim()) {
                    set("objectives", [
                      ...form.objectives,
                      newObjective.trim(),
                    ]);
                    setNewObjective("");
                  }
                }}
                className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prof selector */}
          <div>
            <label className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Prof assigné
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set("profId", null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                  form.profId === null
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-warm bg-cream text-muted hover:border-muted/50"
                }`}
              >
                <span className="font-mono text-xs">Aucun</span>
              </button>
              {profs.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => set("profId", prof.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                    form.profId === prof.id
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-warm bg-cream text-muted hover:border-muted/50"
                  }`}
                >
                  {prof.photo ? (
                    <img
                      src={prof.photo}
                      alt={prof.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: prof.color }}
                    >
                      {prof.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-sans font-medium">{prof.name}</span>
                  {form.profId === prof.id && (
                    <Check className="w-3.5 h-3.5 text-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Phase Builder ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-ink font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-gold" />
            Phases du cours
          </h2>
          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-xs px-3 py-1 rounded-full ${
                totalPhaseDuration > form.duration
                  ? "bg-red-100 text-red-600"
                  : totalPhaseDuration === form.duration
                  ? "bg-green-100 text-green-700"
                  : "bg-fun-azur/10 text-muted"
              }`}
            >
              {totalPhaseDuration}/{form.duration} min
            </span>
          </div>
        </div>

        {/* Duration bar */}
        {form.phases.length > 0 && (
          <div className="h-3 rounded-full bg-fun-azur/10 overflow-hidden flex mb-5">
            {form.phases.map((phase) => (
              <motion.div
                key={phase.id}
                layout
                className="h-full first:rounded-l-full last:rounded-r-full"
                style={{
                  backgroundColor: phase.color,
                  width: `${Math.max(
                    (phase.duration / Math.max(form.duration, 1)) * 100,
                    2
                  )}%`,
                }}
                title={`${phase.title || "Sans titre"} — ${phase.duration} min`}
              />
            ))}
          </div>
        )}

        {/* Phase cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {form.phases.map((phase, phaseIdx) => {
              const isCollapsed = collapsedPhases.has(phase.id);
              return (
                <motion.div
                  key={phase.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border-2 overflow-hidden"
                  style={{ borderColor: phase.color + "40" }}
                >
                  {/* Phase header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    style={{ backgroundColor: phase.color + "10" }}
                    onClick={() => toggleCollapse(phase.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="font-serif font-bold text-ink flex-1 text-sm">
                      {phase.title || "Nouvelle phase"}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {phase.duration} min
                    </span>
                    <span className="font-mono text-[10px] text-muted/60">
                      {phase.exercises.length} exercice
                      {phase.exercises.length !== 1 ? "s" : ""}
                    </span>

                    {/* Reorder */}
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => movePhase(phaseIdx, -1)}
                        disabled={phaseIdx === 0}
                        className="p-1 rounded text-muted hover:text-ink disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePhase(phaseIdx, 1)}
                        disabled={phaseIdx === form.phases.length - 1}
                        className="p-1 rounded text-muted hover:text-ink disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        set(
                          "phases",
                          form.phases.filter((_, i) => i !== phaseIdx)
                        );
                      }}
                      className="p-1 rounded text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <motion.span
                      animate={{ rotate: isCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronUp className="w-4 h-4 text-muted" />
                    </motion.span>
                  </div>

                  {/* Phase body */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 space-y-4 bg-cream/70">
                          {/* Phase basics */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block font-mono text-[10px] text-muted mb-1 uppercase tracking-wider">
                                Titre de la phase
                              </label>
                              <input
                                type="text"
                                value={phase.title}
                                onChange={(e) =>
                                  updatePhase(phaseIdx, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Ex: Échauffement corporel"
                                className="w-full px-3 py-2 rounded-lg border-2 border-warm bg-cream text-ink text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block font-mono text-[10px] text-muted mb-1 uppercase tracking-wider">
                                Durée (min)
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={180}
                                value={phase.duration}
                                onChange={(e) =>
                                  updatePhase(phaseIdx, {
                                    duration: Math.max(
                                      1,
                                      parseInt(e.target.value) || 0
                                    ),
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border-2 border-warm bg-cream text-ink text-sm focus:border-accent/50 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Color picker */}
                          <div>
                            <label className="block font-mono text-[10px] text-muted mb-1.5 uppercase tracking-wider">
                              Couleur
                            </label>
                            <div className="flex gap-2">
                              {PHASE_COLORS.map((c) => (
                                <button
                                  key={c}
                                  onClick={() =>
                                    updatePhase(phaseIdx, { color: c })
                                  }
                                  className={`w-8 h-8 rounded-lg transition-all ${
                                    phase.color === c
                                      ? "ring-2 ring-offset-2 ring-ink scale-110"
                                      : "hover:scale-105"
                                  }`}
                                  style={{ backgroundColor: c }}
                                  title={PHASE_COLOR_LABELS[c] || c}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Phase description */}
                          <div>
                            <label className="block font-mono text-[10px] text-muted mb-1 uppercase tracking-wider">
                              Description
                            </label>
                            <textarea
                              value={phase.description}
                              onChange={(e) =>
                                updatePhase(phaseIdx, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Décrivez l'objectif et l'ambiance de cette phase..."
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border-2 border-warm bg-cream text-ink text-sm placeholder:text-muted/50 focus:border-accent/50 focus:outline-none transition-colors resize-none"
                            />
                          </div>

                          {/* Exercises */}
                          <div>
                            <h4 className="font-mono text-[10px] text-muted mb-3 uppercase tracking-wider flex items-center gap-1.5">
                              <Lightbulb className="w-3 h-3" />
                              Exercices ({phase.exercises.length})
                            </h4>

                            <div className="space-y-3">
                              {phase.exercises.map((ex, exIdx) => (
                                <motion.div
                                  key={exIdx}
                                  layout
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="rounded-xl border border-warm bg-cream/50 p-4 space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div className="sm:col-span-2">
                                        <label className="block font-mono text-[10px] text-muted mb-0.5">
                                          Nom
                                        </label>
                                        <input
                                          type="text"
                                          value={ex.name}
                                          onChange={(e) =>
                                            updateExercise(
                                              phaseIdx,
                                              exIdx,
                                              { name: e.target.value }
                                            )
                                          }
                                          placeholder="Ex: Le miroir"
                                          className="w-full px-3 py-1.5 rounded-lg border border-warm bg-warm/30 text-ink text-sm placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
                                        />
                                      </div>
                                      <div>
                                        <label className="block font-mono text-[10px] text-muted mb-0.5 flex items-center gap-1">
                                          <Tag className="w-2.5 h-2.5" />
                                          Tag
                                        </label>
                                        <input
                                          type="text"
                                          value={ex.tag || ""}
                                          onChange={(e) =>
                                            updateExercise(
                                              phaseIdx,
                                              exIdx,
                                              { tag: e.target.value }
                                            )
                                          }
                                          placeholder="écoute, corps..."
                                          className="w-full px-3 py-1.5 rounded-lg border border-warm bg-warm/30 text-ink text-sm placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        updatePhase(phaseIdx, {
                                          exercises:
                                            phase.exercises.filter(
                                              (_, i) => i !== exIdx
                                            ),
                                        })
                                      }
                                      className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors mt-4"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Exercise description */}
                                  <div>
                                    <label className="block font-mono text-[10px] text-muted mb-0.5">
                                      Description
                                    </label>
                                    <textarea
                                      value={ex.description}
                                      onChange={(e) =>
                                        updateExercise(
                                          phaseIdx,
                                          exIdx,
                                          { description: e.target.value }
                                        )
                                      }
                                      placeholder="Décrivez l'exercice..."
                                      rows={2}
                                      className="w-full px-3 py-1.5 rounded-lg border border-warm bg-warm/30 text-ink text-sm placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors resize-none"
                                    />
                                  </div>

                                  {/* Steps */}
                                  <div>
                                    <label className="block font-mono text-[10px] text-muted mb-1 flex items-center gap-1">
                                      <ListOrdered className="w-2.5 h-2.5" />
                                      Étapes
                                    </label>
                                    <div className="space-y-1.5">
                                      {ex.steps.map((step, stepIdx) => (
                                        <div
                                          key={stepIdx}
                                          className="flex items-center gap-2"
                                        >
                                          <span className="font-mono text-[10px] text-muted/60 w-4 text-center shrink-0">
                                            {stepIdx + 1}.
                                          </span>
                                          <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => {
                                              const next = [...ex.steps];
                                              next[stepIdx] = e.target.value;
                                              updateExercise(
                                                phaseIdx,
                                                exIdx,
                                                { steps: next }
                                              );
                                            }}
                                            placeholder="Décrivez cette étape..."
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-warm/60 bg-cream/70 text-ink text-xs placeholder:text-muted/40 focus:border-accent/50 focus:outline-none transition-colors"
                                          />
                                          <button
                                            onClick={() => {
                                              const next = ex.steps.filter(
                                                (_, i) => i !== stepIdx
                                              );
                                              updateExercise(
                                                phaseIdx,
                                                exIdx,
                                                {
                                                  steps:
                                                    next.length > 0
                                                      ? next
                                                      : [""],
                                                }
                                              );
                                            }}
                                            className="p-1 rounded text-muted/40 hover:text-red-400 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() =>
                                        updateExercise(phaseIdx, exIdx, {
                                          steps: [...ex.steps, ""],
                                        })
                                      }
                                      className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-muted hover:text-accent transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Ajouter une étape
                                    </button>
                                  </div>

                                  {/* Tip */}
                                  <div>
                                    <label className="block font-mono text-[10px] text-muted mb-0.5 flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      Conseil du prof
                                    </label>
                                    <input
                                      type="text"
                                      value={ex.tip || ""}
                                      onChange={(e) =>
                                        updateExercise(phaseIdx, exIdx, {
                                          tip: e.target.value,
                                        })
                                      }
                                      placeholder="Un petit conseil pour bien mener cet exercice..."
                                      className="w-full px-3 py-1.5 rounded-lg border border-gold/30 bg-gold/5 text-ink text-sm placeholder:text-muted/40 focus:border-gold/50 focus:outline-none transition-colors"
                                    />
                                  </div>

                                  {/* Exercise objectives */}
                                  <div>
                                    <label className="block font-mono text-[10px] text-muted mb-1 flex items-center gap-1">
                                      <Target className="w-2.5 h-2.5" />
                                      Objectifs de l'exercice
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                                      {(ex.objectives || []).map(
                                        (obj, objIdx) => (
                                          <span
                                            key={objIdx}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-ink"
                                            style={{
                                              backgroundColor:
                                                phase.color + "20",
                                            }}
                                          >
                                            {obj}
                                            <button
                                              onClick={() =>
                                                updateExercise(
                                                  phaseIdx,
                                                  exIdx,
                                                  {
                                                    objectives: (
                                                      ex.objectives || []
                                                    ).filter(
                                                      (_, i) => i !== objIdx
                                                    ),
                                                  }
                                                )
                                              }
                                              className="hover:text-red-500 transition-colors"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </span>
                                        )
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={
                                          newExerciseObjectives[
                                            `${phase.id}-${exIdx}`
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          setNewExerciseObjectives((p) => ({
                                            ...p,
                                            [`${phase.id}-${exIdx}`]:
                                              e.target.value,
                                          }))
                                        }
                                        onKeyDown={(e) => {
                                          const key = `${phase.id}-${exIdx}`;
                                          const val =
                                            newExerciseObjectives[key]?.trim();
                                          if (e.key === "Enter" && val) {
                                            updateExercise(phaseIdx, exIdx, {
                                              objectives: [
                                                ...(ex.objectives || []),
                                                val,
                                              ],
                                            });
                                            setNewExerciseObjectives((p) => ({
                                              ...p,
                                              [key]: "",
                                            }));
                                          }
                                        }}
                                        placeholder="Ajouter un objectif..."
                                        className="flex-1 px-2 py-1 rounded border border-dashed border-warm/60 bg-transparent text-[10px] text-ink placeholder:text-muted/40 focus:border-accent/40 focus:outline-none transition-colors"
                                      />
                                      <button
                                        onClick={() => {
                                          const key = `${phase.id}-${exIdx}`;
                                          const val =
                                            newExerciseObjectives[key]?.trim();
                                          if (val) {
                                            updateExercise(phaseIdx, exIdx, {
                                              objectives: [
                                                ...(ex.objectives || []),
                                                val,
                                              ],
                                            });
                                            setNewExerciseObjectives((p) => ({
                                              ...p,
                                              [key]: "",
                                            }));
                                          }
                                        }}
                                        className="p-1 rounded text-muted hover:text-accent transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            <button
                              onClick={() =>
                                updatePhase(phaseIdx, {
                                  exercises: [
                                    ...phase.exercises,
                                    emptyExercise(),
                                  ],
                                })
                              }
                              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed text-sm font-mono transition-all hover:bg-accent/5"
                              style={{
                                borderColor: phase.color + "40",
                                color: phase.color,
                              }}
                            >
                              <Plus className="w-4 h-4" />
                              Ajouter un exercice
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add phase button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            set("phases", [...form.phases, emptyPhase()])
          }
          className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-dashed border-gold/40 text-gold hover:border-gold/60 hover:bg-gold/5 transition-all font-mono text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter une phase
        </motion.button>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-warm">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-warm text-muted hover:bg-warm/50 transition-all font-mono text-sm"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all font-mono text-sm font-semibold shadow-lg shadow-accent/20"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </motion.button>
      </div>
    </motion.div>
  );
}
