import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Plus,
  Trash2,
  Edit3,
  Theater,
  Clock,
  GraduationCap,
  User,
  Camera,
  Sparkles,
  LogOut,
  Drama,
  BookOpen,
  Users,
} from "lucide-react";

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

interface BackOfficeProps {
  courses: Course[];
  profs: ProfData[];
  onCreateCourse: () => void;
  onEditCourse: (id: string) => void;
  onDeleteCourse: (id: string) => void;
  onCreateProf: () => void;
  onEditProf: (id: string) => void;
  onDeleteProf: (id: string) => void;
  onExit: () => void;
}

const PASSWORD = "groupelundi";

const levelColors: Record<string, string> = {
  "Débutant": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Intermédiaire": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Avancé": "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

export default function BackOffice({
  courses,
  profs,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onCreateProf,
  onEditProf,
  onDeleteProf,
  onExit,
}: BackOfficeProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"cours" | "profs">("cours");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  const handleDelete = (type: "course" | "prof", id: string) => {
    if (deleteConfirm === id) {
      if (type === "course") onDeleteCourse(id);
      else onDeleteProf(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const getProfName = (profId: string | null): string => {
    if (!profId) return "Non assigné";
    const prof = profs.find((p) => p.id === profId);
    return prof ? prof.name : "Inconnu";
  };

  // ─── Password Gate ─────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #3a0a14 0%, #5c0a1a 40%, #4a0e1a 100%)' }}>
        {/* Spotlight effect */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(197,150,27,0.12) 0%, rgba(139,26,43,0.06) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(139,26,43,0.1) 0%, transparent 60%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md px-6"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
              className="inline-block mb-4"
            >
              <Theater size={56} className="text-gold mx-auto" />
            </motion.div>
            <h1 className="font-serif text-3xl text-cream mb-2">
              Coulisses
            </h1>
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted">
              Espace d&apos;administration
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <motion.div
              animate={error ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.5 }}
              className={`
                bg-burgundy/80 backdrop-blur-sm border-2 rounded-sm p-8
                transition-colors duration-300
                ${error ? "border-red-500/60" : "border-gold/20 focus-within:border-gold/50"}
              `}
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock size={18} className="text-gold" />
                <label
                  htmlFor="bo-password"
                  className="font-mono text-xs tracking-[0.15em] uppercase text-muted"
                >
                  Mot de passe
                </label>
              </div>

              <input
                id="bo-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Le mot secret..."
                autoFocus
                className={`
                  w-full bg-stage/60 border rounded-sm px-4 py-3
                  text-cream placeholder:text-muted/50 font-sans
                  outline-none transition-all duration-200
                  focus:ring-2 focus:ring-gold/30
                  ${error ? "border-red-500/60" : "border-warm/20"}
                `}
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-sm mt-3 font-sans"
                  >
                    Mauvais mot de passe ! Essaie encore, comédien.
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  mt-6 w-full bg-gradient-to-r from-gold to-gold-light
                  text-ink font-serif text-lg py-3 rounded-sm
                  shadow-lg shadow-gold/20
                  hover:shadow-xl hover:shadow-gold/30
                  transition-shadow duration-200
                "
              >
                Entrer en scène
              </motion.button>
            </motion.div>
          </form>

          <p className="text-center text-muted/40 text-xs font-mono mt-6 tracking-wider">
            Accès réservé aux metteurs en scène
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Authenticated View ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="border-b px-4 sm:px-8 py-4" style={{ background: '#1a0a0a', borderColor: 'rgba(197,150,27,0.3)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Theater size={24} className="text-gold" />
            <div>
              <h1 className="font-serif text-xl text-cream">Coulisses</h1>
              <p className="font-mono text-[0.6rem] tracking-[0.15em] uppercase text-muted">
                Back Office
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExit}
              className="flex items-center gap-2 bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1.5 rounded-lg transition-colors text-sm font-mono"
            >
              <span>Retour au site</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAuthenticated(false)}
              className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors text-sm font-mono"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-parchment border-b border-gold/20 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex">
          <button
            onClick={() => {
              setActiveTab("cours");
              setDeleteConfirm(null);
            }}
            className={`
              flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-wider uppercase
              border-b-2 transition-all duration-200
              ${
                activeTab === "cours"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }
            `}
          >
            <BookOpen size={16} />
            Cours
            {courses.length > 0 && (
              <span className="bg-accent/15 text-accent text-xs px-2 py-0.5 rounded-full">
                {courses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("profs");
              setDeleteConfirm(null);
            }}
            className={`
              flex items-center gap-2 px-6 py-3 font-mono text-sm tracking-wider uppercase
              border-b-2 transition-all duration-200
              ${
                activeTab === "profs"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }
            `}
          >
            <Users size={16} />
            Profs
            {profs.length > 0 && (
              <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full">
                {profs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "cours" ? (
            <motion.div
              key="cours"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Cours Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-ink">
                  Les Cours
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCreateCourse}
                  className="
                    flex items-center gap-2 bg-accent
                    text-gold-light font-sans text-sm px-5 py-2.5 rounded-sm
                    shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
                    transition-shadow
                  "
                >
                  <Plus size={18} />
                  Nouveau Cours
                </motion.button>
              </div>

              {/* Courses List */}
              {courses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Sparkles size={48} className="text-gold/40" />
                  </motion.div>
                  <h3 className="font-serif text-xl text-ink/60 mb-2">
                    Aucun cours pour l&apos;instant !
                  </h3>
                  <p className="text-muted/60 font-sans text-sm max-w-md mx-auto">
                    La scène est vide, le public attend... Crée ton premier
                    cours et que le spectacle commence !
                  </p>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {courses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="
                        bg-cream border border-gold/20 rounded-sm p-5
                        hover:border-gold/40 transition-all duration-200
                        group
                      "
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-serif text-lg text-ink truncate">
                              {course.title}
                            </h3>
                            <span
                              className={`
                                text-xs font-mono px-2.5 py-0.5 rounded-full border
                                ${levelColors[course.level] || "bg-muted/20 text-muted border-muted/30"}
                              `}
                            >
                              {course.level}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-muted text-sm font-mono flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-gold/60" />
                              {formatDuration(course.duration)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User size={14} className="text-gold/60" />
                              {getProfName(course.profId)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <GraduationCap
                                size={14}
                                className="text-gold/60"
                              />
                              {course.phases.length} phase
                              {course.phases.length !== 1 ? "s" : ""}
                            </span>
                            <span className="text-muted/40 text-xs">
                              {formatDate(course.createdAt)}
                            </span>
                          </div>

                          {course.description && (
                            <p className="text-muted/70 text-sm mt-2 line-clamp-1 font-sans">
                              {course.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEditCourse(course.id)}
                            className="
                              p-2.5 rounded-lg bg-gold/10 text-gold
                              hover:bg-gold/20 transition-colors
                            "
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleDelete("course", course.id)
                            }
                            className={`
                              p-2.5 rounded-lg transition-colors
                              ${
                                deleteConfirm === course.id
                                  ? "bg-red-500/30 text-red-300 ring-2 ring-red-500/40"
                                  : "bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400"
                              }
                            `}
                            title={
                              deleteConfirm === course.id
                                ? "Confirmer la suppression"
                                : "Supprimer"
                            }
                          >
                            <Trash2 size={16} />
                          </motion.button>

                          <AnimatePresence>
                            {deleteConfirm === course.id && (
                              <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-red-400 text-xs font-mono whitespace-nowrap"
                              >
                                Cliquer pour confirmer
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="profs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Profs Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl text-ink">
                  Les Profs
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCreateProf}
                  className="
                    flex items-center gap-2 bg-gradient-to-r from-gold to-gold/80
                    text-ink font-sans text-sm font-medium px-5 py-2.5 rounded-xl
                    shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30
                    transition-shadow
                  "
                >
                  <Plus size={18} />
                  Nouveau Prof
                </motion.button>
              </div>

              {/* Profs List */}
              {profs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Drama size={48} className="text-accent/40" />
                  </motion.div>
                  <h3 className="font-serif text-xl text-ink/60 mb-2">
                    Pas encore de profs !
                  </h3>
                  <p className="text-muted/60 font-sans text-sm max-w-md mx-auto">
                    Une troupe sans metteur en scène ? Impossible !
                    Ajoute ton premier prof pour diriger le show.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {profs.map((prof, i) => (
                    <motion.div
                      key={prof.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="
                        bg-cream border border-gold/20 rounded-sm overflow-hidden
                        hover:border-gold/40 transition-all duration-200 group
                      "
                    >
                      <div
                        className="h-1.5"
                        style={{
                          background: `linear-gradient(to right, ${prof.color || "#b8860b"}, ${prof.color || "#c8440a"}80)`,
                        }}
                      />

                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Photo */}
                          <div
                            className="
                              w-16 h-16 rounded-full shrink-0 flex items-center justify-center
                              border-2 border-gold/20 overflow-hidden
                              bg-gradient-to-br from-warm to-cream
                            "
                          >
                            {prof.photo ? (
                              <img
                                src={prof.photo}
                                alt={prof.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera
                                size={24}
                                className="text-muted/40"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-lg text-ink mb-1">
                              {prof.name}
                            </h3>

                            {prof.specialties && prof.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {prof.specialties.slice(0, 3).map((s, si) => (
                                  <span
                                    key={si}
                                    className="text-[0.65rem] font-mono px-2 py-0.5 rounded-sm bg-accent/15 text-accent/80 border border-accent/20"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-muted/70 text-sm font-sans line-clamp-2">
                              {prof.bio}
                            </p>
                          </div>
                        </div>

                        {/* Attributes preview */}
                        {prof.attributes.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                            {prof.attributes.slice(0, 3).map((attr) => (
                              <div
                                key={attr.id}
                                className="flex items-center gap-2"
                              >
                                <span className="text-muted/50 text-xs font-mono">
                                  {attr.label}
                                </span>
                                <div className="w-16 h-1.5 bg-warm/40 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${(attr.value / 10) * 100}%`,
                                    }}
                                    transition={{
                                      delay: i * 0.1 + 0.3,
                                      duration: 0.6,
                                    }}
                                    className="h-full rounded-full"
                                    style={{
                                      background: `linear-gradient(to right, ${prof.color || "#b8860b"}, ${prof.color || "#c8440a"})`,
                                    }}
                                  />
                                </div>
                                <span className="text-ink/50 text-xs font-mono">
                                  {attr.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 pt-3 border-t border-gold/10 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEditProf(prof.id)}
                            className="
                              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                              bg-gold/10 text-gold text-sm font-mono
                              hover:bg-gold/20 transition-colors
                            "
                          >
                            <Edit3 size={14} />
                            Modifier
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete("prof", prof.id)}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                              text-sm font-mono transition-colors
                              ${
                                deleteConfirm === prof.id
                                  ? "bg-red-500/30 text-red-300 ring-2 ring-red-500/40"
                                  : "bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400"
                              }
                            `}
                          >
                            <Trash2 size={14} />
                            {deleteConfirm === prof.id
                              ? "Confirmer ?"
                              : "Supprimer"}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
