import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useState, useEffect, useRef } from "react";
import { Clock, Users, GraduationCap, Lightbulb, ArrowRight, ArrowLeft, CheckCircle2, Play, Pause, RotateCcw } from "lucide-react";

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

interface ProfData {
  id: string;
  photo: string | null;
  name: string;
  bio: string;
  specialties: string[];
  color: string;
  attributes: { id: string; label: string; value: number }[];
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

interface CourseViewProps {
  course: Course;
  prof: ProfData | null;
  onBack: () => void;
}

export default function CourseView({ course, prof, onBack }: CourseViewProps) {
  const [completedPhases, setCompletedPhases] = useState<Record<string, boolean>>({});
  const totalDuration = course.phases.reduce((sum, p) => sum + p.duration, 0);

  const togglePhase = (id: string) => {
    setCompletedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Build time ranges for each phase
  let timeAccum = 0;
  const phasesWithTime = course.phases.map(phase => {
    const start = timeAccum;
    timeAccum += phase.duration;
    return { ...phase, timeRange: `${start} – ${timeAccum} min` };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-fun-pink font-mono text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour aux cours
      </button>

      {/* Course header */}
      <div className="card-pop rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div className="flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream mb-2">{course.title}</h1>
            <p className="text-sm text-muted leading-relaxed mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="flex items-center gap-1.5 font-mono text-[0.7rem] text-muted">
                <Clock size={14} className="text-gold" />
                {course.duration} min
              </span>
              <span className={`font-mono text-[0.65rem] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                course.level === 'Débutant' ? 'bg-fun-teal/20 text-fun-teal' :
                course.level === 'Avancé' ? 'bg-fun-purple/20 text-fun-purple' :
                'bg-fun-sky/20 text-fun-sky'
              }`}>
                {course.level}
              </span>
            </div>
          </div>
          {prof && (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm overflow-hidden border-2"
                style={{ borderColor: prof.color, backgroundColor: prof.color + '20' }}
              >
                {prof.photo ? (
                  <img src={prof.photo} alt={prof.name} className="w-full h-full object-cover" />
                ) : (
                  <span style={{ color: prof.color }}>{prof.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">Prof</div>
                <div className="font-medium text-sm text-cream">{prof.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Objectives */}
        {course.objectives.length > 0 && (
          <div className="mt-4 pt-4 border-t border-fun-purple/15">
            <div className="font-mono text-[0.65rem] uppercase tracking-wider text-muted mb-2">Objectifs</div>
            <div className="flex flex-wrap gap-2">
              {course.objectives.map((obj, i) => (
                <span key={i} className="text-[0.75rem] px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                  {obj}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {course.phases.length > 0 && (
        <div className="card-pop rounded-xl p-4 mb-8">
          <div className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-muted mb-2">
            Structure · {totalDuration} min
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {course.phases.map(phase => (
              <div
                key={phase.id}
                className="h-full rounded-sm"
                style={{ backgroundColor: phase.color, flex: phase.duration }}
                title={phase.title}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2.5">
            {course.phases.map(phase => (
              <div key={phase.id} className="flex items-center gap-1.5 text-[0.65rem] text-muted font-mono">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: phase.color, boxShadow: `0 0 6px ${phase.color}60` }} />
                {phase.title} · {phase.duration} min
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phases */}
      {phasesWithTime.map(phase => (
        <PhaseSection
          key={phase.id}
          id={phase.id}
          time={phase.timeRange}
          duration={phase.duration}
          title={phase.title}
          color={phase.color}
          intro={phase.description}
          isCompleted={completedPhases[phase.id]}
          onToggle={() => togglePhase(phase.id)}
        >
          {phase.exercises.map((ex, i) => (
            <ExerciseCard
              key={i}
              name={ex.name}
              tag={ex.tag}
              description={ex.description}
              steps={ex.steps}
              tip={ex.tip}
              objectifs={ex.objectives}
            />
          ))}
        </PhaseSection>
      ))}
    </motion.div>
  );
}

function PhaseSection({ id, time, duration, title, color, intro, isCompleted, onToggle, children }: {
  id: string;
  key?: string;
  time: string;
  duration: number;
  title: string;
  color: string;
  intro: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  children: ReactNode;
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
          <span className="font-mono text-[0.65rem] px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(124,58,237,0.15)', color: '#8b7fa8' }}>
            {time}
          </span>
          <h2 className={`font-serif text-lg sm:text-xl font-bold transition-all ${isCompleted ? 'text-muted line-through' : 'text-cream'}`}>
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          <PhaseTimer duration={duration} />
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 px-3 py-1.5 sm:py-1 rounded-full text-[0.65rem] sm:text-[0.7rem] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
              isCompleted ? 'bg-fun-teal/20 text-fun-teal' : 'bg-fun-purple/15 text-muted hover:bg-fun-purple/25'
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

function PhaseTimer({ duration }: { duration: number }) {
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
    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full font-mono text-[0.65rem] sm:text-[0.75rem] text-cream ${isFinished ? 'animate-pulse bg-fun-pink' : ''}`} style={!isFinished ? { background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' } : {}}>
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

function ExerciseCard({ name, tag, description, steps, tip, objectifs }: {
  key?: number;
  name: string;
  tag?: string;
  description: string;
  steps: string[];
  tip?: string;
  objectifs?: string[];
}) {
  return (
    <div className="card-pop rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-1.5">
        <h3 className="font-sans font-medium text-base text-cream">{name}</h3>
        {tag && <span className="font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-fun-purple/15 text-fun-purple">{tag}</span>}
      </div>
      <p className="text-[0.88rem] text-muted mb-3 leading-relaxed">{description}</p>

      <ul className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <li key={i} className="text-[0.85rem] pl-7 relative border-t border-fun-purple/10 pt-2 first:border-t-0 first:pt-0 text-cream/80">
            <span className="absolute left-0 top-2 first:top-0 w-5 h-5 rounded-full bg-fun-purple/20 text-fun-purple font-mono text-[0.7rem] flex items-center justify-center">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>

      {tip && (
        <div className="rounded-lg p-3.5 mt-3 flex gap-3 items-start" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
          <Lightbulb size={16} className="text-gold mt-0.5 shrink-0" />
          <div className="text-[0.83rem] text-gold/80 leading-relaxed">
            {tip}
          </div>
        </div>
      )}

      {objectifs && objectifs.length > 0 && (
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

function getObjClass(obj: string) {
  switch (obj.toLowerCase()) {
    case 'qui': return 'bg-fun-teal/20 text-fun-teal';
    case 'quoi': return 'bg-fun-sky/20 text-fun-sky';
    case 'où': return 'bg-fun-pink/20 text-fun-pink';
    case 'corps': return 'bg-fun-purple/20 text-fun-purple';
    case 'écoute': return 'bg-fun-orange/20 text-fun-orange';
    default: return 'bg-fun-purple/10 text-muted';
  }
}
