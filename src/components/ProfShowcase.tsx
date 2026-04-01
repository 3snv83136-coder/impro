import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Users, ArrowLeft, Award, Star } from "lucide-react";

interface ProfData {
  id: string;
  photo: string | null;
  name: string;
  bio: string;
  specialties: string[];
  color: string;
  attributes: { id: string; label: string; value: number }[];
}

interface ProfShowcaseProps {
  profs: ProfData[];
}

/* ── Full Radar Chart (big version for detail view) ──────────────── */

function FullRadar({
  attributes,
  color,
}: {
  attributes: { label: string; value: number }[];
  color: string;
}) {
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const n = attributes.length;

  if (n < 3) {
    return (
      <p className="text-sm text-muted italic text-center py-4">
        Pas assez d'attributs pour le radar.
      </p>
    );
  }

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {gridLevels.map((level) => {
        const points = Array.from({ length: n }, (_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#e8dfc8"
            strokeWidth={level === 10 ? 1.5 : 0.5}
          />
        );
      })}
      {attributes.map((_, i) => {
        const p = getPoint(i, 10);
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e8dfc8" strokeWidth={0.5} />
        );
      })}
      <polygon
        points={attributes.map((a, i) => { const p = getPoint(i, a.value); return `${p.x},${p.y}`; }).join(" ")}
        fill={color + "20"}
        stroke={color}
        strokeWidth={2}
      />
      {attributes.map((a, i) => {
        const p = getPoint(i, a.value);
        return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />;
      })}
      {/* Labels — FULL text, no truncation */}
      {attributes.map((a, i) => {
        const labelRadius = radius + 22;
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = center + labelRadius * Math.cos(angle);
        const ly = center + labelRadius * Math.sin(angle);
        const textAnchor =
          Math.abs(Math.cos(angle)) < 0.15 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
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

/* ── Mini Radar Chart (card version) ─────────────────────────────── */

function MiniRadar({
  attributes,
  color,
}: {
  attributes: { label: string; value: number }[];
  color: string;
}) {
  const size = 160;
  const center = size / 2;
  const radius = 50;
  const n = attributes.length;

  if (n < 3) return null;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [5, 10];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[140px] h-[140px] mx-auto">
      {gridLevels.map((level) => {
        const points = Array.from({ length: n }, (_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#e8dfc8"
            strokeWidth={level === 10 ? 1 : 0.3}
          />
        );
      })}
      <polygon
        points={attributes.map((a, i) => { const p = getPoint(i, a.value); return `${p.x},${p.y}`; }).join(" ")}
        fill={color + "25"}
        stroke={color}
        strokeWidth={1.5}
      />
      {attributes.map((a, i) => {
        const p = getPoint(i, a.value);
        return <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />;
      })}
      {/* Labels — full text */}
      {attributes.map((a, i) => {
        const labelRadius = radius + 18;
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = center + labelRadius * Math.cos(angle);
        const ly = center + labelRadius * Math.sin(angle);
        const textAnchor =
          Math.abs(Math.cos(angle)) < 0.15 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="text-[0.3rem] fill-muted font-mono uppercase"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Initials placeholder ─────────────────────────────────────────── */

function Initials({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="w-full h-full flex items-center justify-center text-2xl font-serif font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials || "?"}
    </div>
  );
}

/* ── Prof Detail View (when card is clicked) ─────────────────────── */

function ProfDetail({ prof, onBack }: { key?: string; prof: ProfData; onBack: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted hover:text-accent font-mono text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à l'équipe
      </button>

      {/* Photo + Identity */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-warm mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 shadow-lg flex-shrink-0"
            style={{ borderColor: prof.color }}
          >
            {prof.photo ? (
              <img src={prof.photo} alt={prof.name} className="w-full h-full object-cover" />
            ) : (
              <Initials name={prof.name} color={prof.color} />
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mb-2">{prof.name}</h1>
            <p className="text-muted leading-relaxed mb-4">{prof.bio}</p>
            {prof.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {prof.specialties.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-[0.75rem] font-medium text-white"
                    style={{ backgroundColor: prof.color }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attributes list */}
      {prof.attributes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-warm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: prof.color + '15' }}>
              <Award size={20} style={{ color: prof.color }} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">Compétences</h2>
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Profil du professeur</p>
            </div>
          </div>
          <div className="space-y-3">
            {prof.attributes.map((attr) => (
              <div key={attr.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[0.75rem] uppercase tracking-wider text-ink">{attr.label}</span>
                  <span className="font-mono text-sm font-medium" style={{ color: prof.color }}>{attr.value}/10</span>
                </div>
                <div className="h-2.5 bg-warm/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${attr.value * 10}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: prof.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Radar */}
      {prof.attributes.length >= 3 && (
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
          <FullRadar attributes={prof.attributes} color={prof.color} />
        </div>
      )}
    </motion.div>
  );
}

/* ── Prof Card ────────────────────────────────────────────────────── */

function ProfCard({ prof, index, onClick }: { prof: ProfData; index: number; key?: string; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-cream rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-warm/60 flex flex-col text-left cursor-pointer w-full"
    >
      {/* Color accent top bar */}
      <div
        className="h-2 w-full"
        style={{
          background: `linear-gradient(90deg, ${prof.color}, ${prof.color}88, ${prof.color}44)`,
        }}
      />

      <div className="p-5 flex flex-col items-center gap-4 flex-1">
        {/* Photo */}
        <div
          className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-md"
          style={{ borderColor: prof.color }}
        >
          {prof.photo ? (
            <img src={prof.photo} alt={prof.name} className="w-full h-full object-cover" />
          ) : (
            <Initials name={prof.name} color={prof.color} />
          )}
        </div>

        {/* Name */}
        <h3 className="text-xl font-serif font-bold text-ink text-center">
          {prof.name}
        </h3>

        {/* Bio */}
        <p className="text-sm text-muted leading-relaxed text-center line-clamp-3">
          {prof.bio}
        </p>

        {/* Specialties */}
        {prof.specialties.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {prof.specialties.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[0.65rem] font-medium text-white"
                style={{ backgroundColor: prof.color + "cc" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mini Radar */}
        {prof.attributes.length >= 3 && (
          <div className="mt-auto pt-2">
            <MiniRadar attributes={prof.attributes} color={prof.color} />
          </div>
        )}

        {/* Hint */}
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted/50 mt-1">
          Cliquer pour voir le profil
        </span>
      </div>
    </motion.button>
  );
}

/* ── Empty State ──────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-warm/50 flex items-center justify-center">
        <Users className="w-10 h-10 text-muted" />
      </div>
      <h3 className="font-serif text-xl text-ink">Aucun professeur</h3>
      <p className="text-sm text-muted max-w-sm">
        L'équipe pédagogique n'a pas encore été constituée. Revenez bientôt pour
        découvrir nos incroyables coachs d'impro !
      </p>
    </motion.div>
  );
}

/* ── Main Showcase ────────────────────────────────────────────────── */

export default function ProfShowcase({ profs }: ProfShowcaseProps) {
  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);
  const selectedProf = profs.find((p) => p.id === selectedProfId) || null;

  return (
    <section className="py-8 px-4">
      <AnimatePresence mode="wait">
        {selectedProf ? (
          <ProfDetail
            key="detail"
            prof={selectedProf}
            onBack={() => setSelectedProfId(null)}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Title section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted">
                  Les artistes qui vous guident
                </span>
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink">
                Notre Équipe
              </h2>
              <p className="mt-3 text-muted text-sm max-w-md mx-auto leading-relaxed">
                Des passionnés de scène, de rire et de partage. Chacun apporte son
                énergie unique pour faire briller votre talent d'improvisateur.
              </p>
              <motion.div
                className="mt-4 mx-auto w-16 h-1 rounded-full bg-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              />
            </motion.div>

            {/* Grid or empty */}
            {profs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {profs.map((prof, i) => (
                  <ProfCard
                    key={prof.id}
                    prof={prof}
                    index={i}
                    onClick={() => setSelectedProfId(prof.id)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
