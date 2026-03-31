"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PHASES,
  CONTEXTES_SOLO,
  CONTEXTES_DUOS,
  CONTEXTES_SCENES,
  MANTRAS_JOUEUR,
  MANTRAS_COACH,
  MANTRAS_OBS,
} from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "session" | "fiches" | "participants" | "projector";
type FicheRole = "coach" | "joueur" | "observateur";
type FichePhase = "warmup" | "theory" | "solo" | "duos" | "scenes" | "debrief";
type Participant = { id: string; name: string; role: FicheRole; passages: number };

const ROLE_COLORS: Record<FicheRole, { bg: string; accent: string; text: string }> = {
  coach:      { bg: "#1c1208", accent: "#f0a020", text: "#f0e8d8" },
  joueur:     { bg: "#0d1a2a", accent: "#38b2e8", text: "#e0eefc" },
  observateur:{ bg: "#1a0d1a", accent: "#c060e0", text: "#f0e0ff" },
};

const ROLE_LABELS: Record<FicheRole, string> = {
  coach: "🎙 Coach",
  joueur: "🎭 Joueur",
  observateur: "👁 Observateur",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimerRing({ pct, color }: { pct: number; color: string }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="rotate-[-90deg]">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#e6ddd0" strokeWidth="10" />
      <circle
        cx="100" cy="100" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

function PhaseBadge({ phase, isActive }: { phase: typeof PHASES[0]; isActive: boolean }) {
  return (
    <div
      className="text-xs font-medium px-3 py-1 rounded-full border transition-all"
      style={{
        background: isActive ? phase.color : "transparent",
        borderColor: phase.color,
        color: isActive ? "#fff" : phase.color,
        fontFamily: "'Syne', sans-serif",
        letterSpacing: "0.05em",
      }}
    >
      {phase.emoji} {phase.label}
    </div>
  );
}

// ─── SESSION TAB ─────────────────────────────────────────────────────────────
function SessionTab() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [running, setRunning] = useState(false);
  const [alarming, setAlarming] = useState(false);
  const [drawnContext, setDrawnContext] = useState<{ emoji: string; label: string } | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const phase = PHASES[phaseIdx];
  const pct = timeLeft / phase.duration;

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setRunning(false);
            setAlarming(true);
            playBeep();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, playBeep]);

  const goToPhase = (idx: number) => {
    setPhaseIdx(idx);
    setTimeLeft(PHASES[idx].duration);
    setRunning(false);
    setAlarming(false);
    setDrawnContext(null);
  };

  const drawContext = () => {
    const contexts =
      phase.id === "solo" ? CONTEXTES_SOLO :
      phase.id === "duos" ? CONTEXTES_DUOS :
      phase.id === "scenes" ? CONTEXTES_SCENES : [];
    if (contexts.length) setDrawnContext(randomFrom(contexts));
  };

  const noteKey = `${phaseIdx}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      {/* Phase nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PHASES.map((p, i) => (
          <button key={p.id} onClick={() => goToPhase(i)} className="cursor-pointer">
            <PhaseBadge phase={p} isActive={i === phaseIdx} />
          </button>
        ))}
      </div>

      {/* Main timer card */}
      <div
        className="rounded-2xl p-6 mb-6 text-white"
        style={{ background: phase.color }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Ring + time */}
          <div className={`relative ${alarming ? "alarm-pulse" : ""}`}>
            <TimerRing pct={pct} color="rgba(255,255,255,0.9)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                {fmt(timeLeft)}
              </span>
              <span className="text-xs opacity-60 mt-1">{fmt(phase.duration)} total</span>
            </div>
          </div>

          {/* Phase info */}
          <div className="flex-1">
            <div className="text-xs opacity-50 uppercase tracking-widest mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              Phase {phaseIdx + 1} / {PHASES.length}
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              {phase.emoji} {phase.subtitle}
            </h2>
            <p className="text-sm opacity-70 mb-4">{phase.description}</p>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setRunning(!running); setAlarming(false); }}
                className="px-5 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{
                  background: running ? "rgba(255,255,255,0.2)" : "white",
                  color: running ? "white" : phase.color,
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                {running ? "⏸ Pause" : timeLeft === 0 ? "🔄 Relancer" : "▶ Démarrer"}
              </button>
              <button
                onClick={() => { setTimeLeft(phase.duration); setRunning(false); setAlarming(false); }}
                className="px-5 py-2 rounded-full text-sm opacity-70 hover:opacity-100 transition-all border border-white/30"
              >
                ↺ Reset
              </button>
              {phaseIdx < PHASES.length - 1 && (
                <button
                  onClick={() => goToPhase(phaseIdx + 1)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 bg-white/20 hover:bg-white/30"
                >
                  Phase suivante →
                </button>
              )}
            </div>
          </div>
        </div>

        {alarming && (
          <div className="mt-4 text-center text-sm font-semibold bg-white/20 rounded-xl p-3">
            ⏰ Temps écoulé — passez à la phase suivante !
          </div>
        )}
      </div>

      {/* Actions grid + context drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Coach actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "#f0a020" }}>
            🎙 Coach — à faire
          </h3>
          <ul className="space-y-2">
            {phase.coachActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#7a6a58]">
                <span className="text-[#f0a020] mt-0.5">▸</span> {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Player actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "#38b2e8" }}>
            🎭 Joueur — à faire
          </h3>
          <ul className="space-y-2">
            {phase.playerActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#7a6a58]">
                <span className="text-[#38b2e8] mt-0.5">▸</span> {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Observer actions if any */}
      {"observerActions" in phase && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "#c060e0" }}>
            👁 Observateur — à faire
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(phase as typeof phase & { observerActions: string[] }).observerActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#7a6a58]">
                <span className="text-[#c060e0] mt-0.5">▸</span> {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Context drawer */}
      {["solo", "duos", "scenes"].includes(phase.id) && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-widest font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "#7a6a58" }}>
              🎲 Tirage de contexte
            </h3>
            <button
              onClick={drawContext}
              className="text-sm px-4 py-1.5 rounded-full font-semibold text-white transition-all hover:scale-105"
              style={{ background: phase.color, fontFamily: "'Syne', sans-serif" }}
            >
              Tirer au sort
            </button>
          </div>
          {drawnContext ? (
            <div
              className="text-center py-4 rounded-xl text-lg font-semibold fade-up"
              style={{ background: phase.colorLight, fontFamily: "'Syne', sans-serif" }}
            >
              {drawnContext.emoji} {drawnContext.label}
            </div>
          ) : (
            <p className="text-sm text-[#7a6a58] text-center py-2">Appuie sur « Tirer au sort » pour révéler un contexte au groupe</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-xs uppercase tracking-widest mb-2 font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: "#7a6a58" }}>
          📝 Notes de phase
        </h3>
        <textarea
          className="w-full text-sm text-[#18120a] bg-[#f7f3ee] rounded-lg p-3 resize-none outline-none focus:ring-2"
          style={{ minHeight: "80px", border: "1px solid #e6ddd0" }}
          placeholder="Observations, ce qui a fonctionné, ce qui a résisté…"
          value={notes[noteKey] || ""}
          onChange={(e) => setNotes((n) => ({ ...n, [noteKey]: e.target.value }))}
        />
      </div>
    </div>
  );
}

// ─── FICHES TAB ───────────────────────────────────────────────────────────────
function FichesTab() {
  const [view, setView] = useState<"roles" | "phases">("roles");
  const [activeRole, setActiveRole] = useState<FicheRole>("coach");
  const [activePhase, setActivePhase] = useState<FichePhase>("warmup");

  const phase = PHASES.find((p) => p.id === activePhase)!;
  const roleStyle = ROLE_COLORS[activeRole];

  const mantras: Record<FicheRole, string[]> = {
    coach: MANTRAS_COACH,
    joueur: MANTRAS_JOUEUR,
    observateur: MANTRAS_OBS,
  };

  const erreurs: Record<FicheRole, { titre: string; fix: string }[]> = {
    coach: [
      { titre: "Parler pendant la scène", fix: "Attendre le freeze ou la fin, jamais pendant." },
      { titre: "Feedback trop long", fix: "1 à 2 observations max. Plus = les joueurs saturent." },
      { titre: "Laisser dépasser le temps", fix: "Couper à l'heure dite, même si ça dérange." },
      { titre: "Poser une question rhétorique", fix: "Si tu poses une question, attends une réponse vraie." },
      { titre: "Cibler une seule personne", fix: "Varier les passes, surveiller qui n'a pas encore joué." },
      { titre: "Corriger l'intention", fix: "Tu corriges ce que le public a perçu, pas ce qu'ils voulaient faire." },
    ],
    joueur: [
      { titre: "Annoncer le décor", fix: "Ne jamais dire « comme tu le sais, on est à l'hôpital… »" },
      { titre: "Geste flou", fix: "Mimer vaguement ≠ manipuler un objet avec résistance précise." },
      { titre: "Ignorer le sol", fix: "Marbre d'hôpital ≠ plage ≠ vaisseau. Le sol change tout." },
      { titre: "Jouer en parallèle", fix: "Avec un partenaire, votre espace est partagé. Regardez-vous." },
      { titre: "Figer au Freeze", fix: "Au Freeze, tu gardes la position mais restes présent dans le regard." },
    ],
    observateur: [
      { titre: "Rire / réagir pendant la scène", fix: "Ça casse la concentration du joueur et biais ta lecture." },
      { titre: "« Tu aurais dû… »", fix: "Remplace par « Je n'ai pas vu… » ou « Il m'a manqué… »" },
      { titre: "Retour trop long", fix: "3 points max. Le reste se dilue et démotive." },
      { titre: "Valider l'intention", fix: "Ce n'est pas « tu voulais faire X » — c'est ce que j'ai perçu." },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      {/* View switcher */}
      <div className="flex gap-2 mb-6">
        {(["roles", "phases"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              fontFamily: "'Syne', sans-serif",
              background: view === v ? "#18120a" : "#e6ddd0",
              color: view === v ? "#f7f3ee" : "#7a6a58",
            }}
          >
            {v === "roles" ? "👤 Par rôle" : "📋 Par exercice"}
          </button>
        ))}
      </div>

      {view === "roles" && (
        <>
          {/* Role tabs */}
          <div className="flex gap-2 mb-4">
            {(["coach", "joueur", "observateur"] as FicheRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  background: activeRole === r ? ROLE_COLORS[r].bg : "#e6ddd0",
                  color: activeRole === r ? ROLE_COLORS[r].accent : "#7a6a58",
                }}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          {/* Role hero */}
          <div className="rounded-2xl p-6 mb-4" style={{ background: roleStyle.bg }}>
            <div className="text-xs uppercase tracking-widest mb-2 opacity-40" style={{ fontFamily: "'Syne', sans-serif", color: roleStyle.text }}>
              Fiche de poste
            </div>
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: roleStyle.accent }}>
              {ROLE_LABELS[activeRole]}
            </h2>
            <p className="text-sm opacity-60" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", color: roleStyle.text }}>
              {activeRole === "coach" && "Le chef d'orchestre silencieux qui voit tout"}
              {activeRole === "joueur" && "Incarner, ne pas expliquer — montrer, ne pas dire"}
              {activeRole === "observateur" && "Les yeux du public — le miroir précis"}
            </p>
          </div>

          {/* Mantras */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
            <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Mantras
            </h3>
            <ul className="space-y-2">
              {mantras[activeRole].map((m, i) => (
                <li key={i} className="flex items-start gap-3 py-2 border-b border-[#e6ddd0] last:border-0">
                  <span className="text-[#d4c8b8] text-xl leading-none">"</span>
                  <span className="text-sm" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Erreurs */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Pièges à éviter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {erreurs[activeRole].map((e, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: "#fff5f5", border: "1px solid #fccaca" }}>
                  <div className="text-sm font-medium text-red-800 mb-1">{e.titre}</div>
                  <div className="text-xs text-[#4a5568]">→ {e.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === "phases" && (
        <>
          {/* Phase tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PHASES.map((p) => (
              <button key={p.id} onClick={() => setActivePhase(p.id as FichePhase)}>
                <PhaseBadge phase={p} isActive={p.id === activePhase} />
              </button>
            ))}
          </div>

          {/* Phase hero */}
          <div className="rounded-2xl p-6 mb-4 text-white" style={{ background: phase.color }}>
            <div className="text-xs opacity-50 uppercase tracking-widest mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
              {PHASES.findIndex((p) => p.id === activePhase) + 1} / {PHASES.length} · {fmt(phase.duration)}
            </div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
              {phase.emoji} {phase.subtitle}
            </h2>
            <p className="text-sm opacity-70 mt-1">{phase.description}</p>
          </div>

          {/* 3 role cards for phase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(["coach", "joueur", "observateur"] as FicheRole[]).map((role) => {
              const actions =
                role === "coach" ? phase.coachActions :
                role === "joueur" ? phase.playerActions :
                ("observerActions" in phase ? (phase as typeof phase & { observerActions: string[] }).observerActions : []);
              if (actions.length === 0) return null;
              return (
                <div key={role} className="rounded-xl p-4" style={{ background: ROLE_COLORS[role].bg }}>
                  <div className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: "'Syne', sans-serif", color: ROLE_COLORS[role].accent }}>
                    {ROLE_LABELS[role]}
                  </div>
                  <ul className="space-y-2">
                    {actions.map((a, i) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: ROLE_COLORS[role].text, opacity: 0.85 }}>
                        <span style={{ color: ROLE_COLORS[role].accent }}>▸</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Contexts if applicable */}
          {["solo", "duos", "scenes"].includes(phase.id) && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Contextes disponibles
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(phase.id === "solo" ? CONTEXTES_SOLO : phase.id === "duos" ? CONTEXTES_DUOS : CONTEXTES_SCENES).map((c, i) => (
                  <div key={i} className="rounded-lg px-3 py-2 text-sm text-[#7a6a58] flex items-center gap-2" style={{ background: "#f7f3ee" }}>
                    <span>{c.emoji}</span> {c.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── PARTICIPANTS TAB ─────────────────────────────────────────────────────────
function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Participant 1", role: "joueur", passages: 0 },
    { id: "2", name: "Participant 2", role: "joueur", passages: 0 },
    { id: "3", name: "Participant 3", role: "joueur", passages: 0 },
  ]);
  const [newName, setNewName] = useState("");

  const addParticipant = () => {
    if (!newName.trim()) return;
    setParticipants((p) => [
      ...p,
      { id: Date.now().toString(), name: newName.trim(), role: "joueur", passages: 0 },
    ]);
    setNewName("");
  };

  const updateRole = (id: string, role: FicheRole) => {
    setParticipants((p) => p.map((x) => (x.id === id ? { ...x, role } : x)));
  };

  const incrementPassage = (id: string) => {
    setParticipants((p) => p.map((x) => (x.id === id ? { ...x, passages: x.passages + 1 } : x)));
  };

  const remove = (id: string) => {
    setParticipants((p) => p.filter((x) => x.id !== id));
  };

  const totalPassages = participants.reduce((s, p) => s + p.passages, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Participants", value: participants.length, color: "#18120a" },
          { label: "Passages total", value: totalPassages, color: "#c8440a" },
          { label: "Moy. / joueur", value: participants.length ? (totalPassages / participants.length).toFixed(1) : 0, color: "#5b8fd4" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: s.color }}>{s.value}</div>
            <div className="text-xs text-[#7a6a58] uppercase tracking-widest" style={{ fontFamily: "'Syne', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add participant */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Ajouter un participant
        </h3>
        <div className="flex gap-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
            style={{ background: "#f7f3ee", border: "1px solid #e6ddd0" }}
            placeholder="Prénom…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addParticipant()}
          />
          <button
            onClick={addParticipant}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "#18120a", fontFamily: "'Syne', sans-serif" }}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Participants list */}
      <div className="space-y-2">
        {participants.map((p) => (
          <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 card-hover">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: ROLE_COLORS[p.role].bg, fontFamily: "'Syne', sans-serif" }}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate" style={{ fontFamily: "'Syne', sans-serif" }}>{p.name}</div>
              <div className="text-xs text-[#7a6a58]">{p.passages} passage{p.passages > 1 ? "s" : ""}</div>
            </div>

            {/* Role selector */}
            <div className="flex gap-1">
              {(["coach", "joueur", "observateur"] as FicheRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => updateRole(p.id, r)}
                  className="text-xs px-2 py-1 rounded-full transition-all"
                  style={{
                    background: p.role === r ? ROLE_COLORS[r].bg : "#f0ece6",
                    color: p.role === r ? ROLE_COLORS[r].accent : "#7a6a58",
                    fontFamily: "'Syne', sans-serif",
                  }}
                  title={ROLE_LABELS[r]}
                >
                  {r === "coach" ? "🎙" : r === "joueur" ? "🎭" : "👁"}
                </button>
              ))}
            </div>

            {/* Passage counter */}
            <button
              onClick={() => incrementPassage(p.id)}
              className="px-3 py-1 rounded-full text-sm font-bold text-white transition-all hover:scale-110"
              style={{ background: "#c8440a", fontFamily: "'Syne', sans-serif" }}
              title="Ajouter un passage"
            >
              +1
            </button>

            {/* Remove */}
            <button
              onClick={() => remove(p.id)}
              className="text-[#d4c8b8] hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Passage heatmap */}
      {participants.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm mt-4">
          <h3 className="text-xs uppercase tracking-widest mb-3 font-semibold text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>
            Équilibre des passages
          </h3>
          <div className="space-y-2">
            {participants.map((p) => {
              const max = Math.max(...participants.map((x) => x.passages), 1);
              const pct = (p.passages / max) * 100;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-[#7a6a58] truncate">{p.name}</div>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "#f0ece6" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: ROLE_COLORS[p.role].bg === "#1c1208" ? "#f0a020" : ROLE_COLORS[p.role].accent }}
                    />
                  </div>
                  <div className="text-xs font-bold w-6 text-right" style={{ fontFamily: "'Syne', sans-serif" }}>{p.passages}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROJECTOR TAB ────────────────────────────────────────────────────────────
function ProjectorTab() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
  const [running, setRunning] = useState(false);
  const [alarming, setAlarming] = useState(false);
  const [drawnContext, setDrawnContext] = useState<{ emoji: string; label: string } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phase = PHASES[phaseIdx];
  const pct = timeLeft / phase.duration;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { setRunning(false); setAlarming(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const goToPhase = (idx: number) => {
    setPhaseIdx(idx);
    setTimeLeft(PHASES[idx].duration);
    setRunning(false);
    setAlarming(false);
    setDrawnContext(null);
  };

  const drawContext = () => {
    const contexts = phase.id === "solo" ? CONTEXTES_SOLO : phase.id === "duos" ? CONTEXTES_DUOS : phase.id === "scenes" ? CONTEXTES_SCENES : [];
    if (contexts.length) setDrawnContext(randomFrom(contexts));
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-8 ${alarming ? "alarm-pulse" : ""}`}
      style={{ background: phase.color }}
    >
      {/* Phase nav */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-60">
        {PHASES.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goToPhase(i)}
            className="text-white text-xs px-3 py-1 rounded-full border border-white/30 hover:border-white/80 transition-all"
            style={{ fontFamily: "'Syne', sans-serif", opacity: i === phaseIdx ? 1 : 0.5 }}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Big timer */}
      <div className="relative mb-6">
        <TimerRing pct={pct} color="rgba(255,255,255,0.9)" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {fmt(timeLeft)}
          </span>
        </div>
      </div>

      {/* Phase name */}
      <h1 className="text-5xl font-bold text-white text-center mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
        {phase.emoji} {phase.subtitle}
      </h1>
      <p className="text-white/60 text-lg text-center mb-8" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}>
        {phase.description}
      </p>

      {/* Controls */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setRunning(!running); setAlarming(false); }}
          className="px-8 py-3 rounded-full text-xl font-bold transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", fontFamily: "'Syne', sans-serif", backdropFilter: "blur(8px)" }}
        >
          {running ? "⏸" : "▶"}
        </button>
        <button
          onClick={() => { setTimeLeft(phase.duration); setRunning(false); setAlarming(false); }}
          className="px-8 py-3 rounded-full text-xl font-bold transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.1)", color: "white", fontFamily: "'Syne', sans-serif" }}
        >
          ↺
        </button>
        {["solo", "duos", "scenes"].includes(phase.id) && (
          <button
            onClick={drawContext}
            className="px-8 py-3 rounded-full text-xl font-bold transition-all hover:scale-105"
            style={{ background: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Syne', sans-serif" }}
          >
            🎲
          </button>
        )}
      </div>

      {/* Drawn context */}
      {drawnContext && (
        <div
          className="text-3xl font-bold text-center py-5 px-10 rounded-2xl fade-up"
          style={{ background: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Syne', sans-serif", backdropFilter: "blur(8px)" }}
        >
          {drawnContext.emoji} {drawnContext.label}
        </div>
      )}

      {alarming && (
        <div className="text-white text-2xl font-bold mt-4" style={{ fontFamily: "'Syne', sans-serif" }}>
          ⏰ Temps écoulé !
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function ImproApp() {
  const [tab, setTab] = useState<Tab>("session");

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "session", label: "Séance", emoji: "⏱" },
    { id: "fiches", label: "Fiches", emoji: "📋" },
    { id: "participants", label: "Participants", emoji: "👥" },
    { id: "projector", label: "Projecteur", emoji: "📽" },
  ];

  if (tab === "projector") {
    return (
      <div>
        <button
          onClick={() => setTab("session")}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: "rgba(0,0,0,0.4)", fontFamily: "'Syne', sans-serif", backdropFilter: "blur(8px)" }}
        >
          ← Retour
        </button>
        <ProjectorTab />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ background: "#1a1208" }} className="px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7a6a58] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
              Improvisation théâtrale
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif", color: "#f0a020" }}>
              Qui ? Quoi ? Où ?
            </h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#7a6a58]" style={{ fontFamily: "'Syne', sans-serif" }}>1h · 10 participants</div>
            <div className="text-xs text-[#7a6a58]">Niveau intermédiaire</div>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ background: "#18120a", borderBottom: "1px solid #2a2010" }} className="sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 px-2 py-3 text-xs font-semibold transition-all"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: tab === t.id ? "#f0a020" : "#7a6a58",
                borderBottom: tab === t.id ? "2px solid #f0a020" : "2px solid transparent",
                letterSpacing: "0.05em",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      {tab === "session" && <SessionTab />}
      {tab === "fiches" && <FichesTab />}
      {tab === "participants" && <ParticipantsTab />}
    </div>
  );
}
