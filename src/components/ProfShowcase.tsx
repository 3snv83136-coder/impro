import { motion } from "motion/react";
import { Sparkles, Theater, Users } from "lucide-react";

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

/* ── Mini Radar Chart ─────────────────────────────────────────────── */

function MiniRadar({
  attributes,
  color,
}: {
  attributes: { label: string; value: number }[];
  color: string;
}) {
  const size = 150;
  const center = size / 2;
  const radius = 52;
  const n = attributes.length;

  if (n < 3) {
    return (
      <p className="text-[0.6rem] text-muted italic text-center py-4">
        Pas assez d'attributs
      </p>
    );
  }

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridLevels = [3, 6, 10];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[150px] h-[150px] mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => {
        const points = Array.from({ length: n }, (_, i) => getPoint(i, level));
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#e8dfc8"
            strokeWidth={level === 10 ? 1.2 : 0.4}
          />
        );
      })}
      {/* Spokes */}
      {attributes.map((_, i) => {
        const p = getPoint(i, 10);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e8dfc8"
            strokeWidth={0.4}
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={attributes
          .map((a, i) => {
            const p = getPoint(i, a.value);
            return `${p.x},${p.y}`;
          })
          .join(" ")}
        fill={color + "25"}
        stroke={color}
        strokeWidth={1.8}
      />
      {/* Data points */}
      {attributes.map((a, i) => {
        const p = getPoint(i, a.value);
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />;
      })}
      {/* Labels */}
      {attributes.map((a, i) => {
        const labelRadius = radius + 16;
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = center + labelRadius * Math.cos(angle);
        const ly = center + labelRadius * Math.sin(angle);
        const textAnchor =
          Math.abs(Math.cos(angle)) < 0.15
            ? "middle"
            : Math.cos(angle) > 0
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={textAnchor}
            dominantBaseline="central"
            className="text-[0.35rem] fill-muted font-mono uppercase"
          >
            {a.label.length > 12 ? a.label.slice(0, 11) + "..." : a.label}
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

/* ── Prof Card ────────────────────────────────────────────────────── */

function ProfCard({ prof, index }: { prof: ProfData; index: number; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-cream rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-warm/60 flex flex-col"
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
            <img
              src={prof.photo}
              alt={prof.name}
              className="w-full h-full object-cover"
            />
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
      </div>
    </motion.div>
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
  return (
    <section className="py-8 px-4">
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
            <ProfCard key={prof.id} prof={prof} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
