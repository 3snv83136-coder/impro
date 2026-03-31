"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PHASES, CONTEXTES_SOLO, CONTEXTES_DUOS, CONTEXTES_SCENES,
  MANTRAS_JOUEUR, MANTRAS_COACH, MANTRAS_OBS,
} from "@/lib/data";

type Tab = "session" | "fiches" | "participants" | "projector";
type FicheRole = "coach" | "joueur" | "observateur";
type FichePhase = "warmup" | "theory" | "solo" | "duos" | "scenes" | "debrief";
type Participant = { id: string; name: string; role: FicheRole; passages: number };

const R = { coach: { bg: "#1a0a0a", accent: "#e53935", text: "#fce4e4" }, joueur: { bg: "#0a1020", accent: "#42a5f5", text: "#e3f2fd" }, observateur: { bg: "#0a0a1a", accent: "#ab47bc", text: "#f3e5f5" } };
const RL = { coach: "🎙 Coach", joueur: "🎭 Joueur", observateur: "👁 Observateur" };

function fmt(s: number) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
function rand<T>(a: T[]): T { return a[Math.floor(Math.random()*a.length)]; }

/* ── RING ── */
function Ring({ pct, color, size = 180 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.4;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2a2a2a" strokeWidth="8"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-pct)}
        style={{ transition: "stroke-dashoffset 1s linear" }}/>
    </svg>
  );
}

/* ── RED BUTTON ── */
function Btn({ children, onClick, variant = "red", small }: { children: React.ReactNode; onClick?: () => void; variant?: "red"|"ghost"|"dark"; small?: boolean }) {
  const base = `font-semibold rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer border-0 ${small ? "text-xs px-3 py-1.5" : "text-sm px-5 py-2.5"}`;
  const styles = { red: "bg-[#e53935] text-white hover:bg-[#ff5252]", ghost: "bg-transparent text-[#888] border border-[#2a2a2a] hover:border-[#e53935] hover:text-white", dark: "bg-[#1e1e1e] text-[#f5f5f5] border border-[#2a2a2a] hover:border-[#e53935]" };
  return <button onClick={onClick} className={`${base} ${styles[variant]}`} style={{ fontFamily: "'Syne', sans-serif" }}>{children}</button>;
}

/* ── BADGE ── */
function PhasePill({ p, active, onClick }: { p: typeof PHASES[0]; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer hover:scale-105"
      style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, letterSpacing:"0.05em", background: active ? p.color : "transparent", borderColor: active ? p.color : "#2a2a2a", color: active ? "#fff" : "#888" }}>
      {p.emoji} {p.label}
    </button>
  );
}

/* ══════════════════════ SESSION ══════════════════════ */
function SessionTab() {
  const [pi, setPi] = useState(0);
  const [t, setT] = useState(PHASES[0].duration);
  const [run, setRun] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [ctx, setCtx] = useState<{emoji:string;label:string}|null>(null);
  const [notes, setNotes] = useState<Record<string,string>>({});
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);
  const ph = PHASES[pi];

  const beep = useCallback(() => {
    try {
      const ac = new (window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      const o = ac.createOscillator(); const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.frequency.value = 880; g.gain.setValueAtTime(0.4, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+1);
      o.start(); o.stop(ac.currentTime+1);
    } catch {}
  }, []);

  useEffect(() => {
    if (run) { ref.current = setInterval(() => setT(v => { if(v<=1){setRun(false);setAlarm(true);beep();return 0;} return v-1; }), 1000); }
    return () => { if(ref.current) clearInterval(ref.current); };
  }, [run, beep]);

  const go = (i: number) => { setPi(i); setT(PHASES[i].duration); setRun(false); setAlarm(false); setCtx(null); };
  const draw = () => { const c = ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:ph.id==="scenes"?CONTEXTES_SCENES:[]; if(c.length) setCtx(rand(c)); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      {/* Phase pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PHASES.map((p,i) => <PhasePill key={p.id} p={p} active={i===pi} onClick={() => go(i)}/>)}
      </div>

      {/* Timer card */}
      <div className={`rounded-2xl p-6 mb-5 border ${alarm?"alarm-pulse":""}`}
        style={{ background:"linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)", borderColor: ph.color, boxShadow:`0 0 40px ${ph.color}22` }}>
        
        {/* Red top bar */}
        <div className="h-0.5 w-full rounded-full mb-5" style={{ background:`linear-gradient(90deg, ${ph.color}, transparent)` }}/>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className={`relative flex-shrink-0 ${alarm?"alarm-pulse":""}`}>
            <Ring pct={t/ph.duration} color={ph.color}/>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ fontFamily:"'Syne',sans-serif", color: ph.color }}>{fmt(t)}</span>
              <span className="text-xs mt-1" style={{ color:"#555" }}>{fmt(ph.duration)}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>
              Phase {pi+1}/{PHASES.length}
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:"'Syne',sans-serif", color: ph.color }}>{ph.emoji} {ph.subtitle}</h2>
            <p className="text-sm mb-4" style={{ color:"#888" }}>{ph.description}</p>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => {setRun(!run);setAlarm(false);}}>
                {run ? "⏸ Pause" : t===0 ? "↺ Relancer" : "▶ Démarrer"}
              </Btn>
              <Btn variant="ghost" onClick={() => {setT(ph.duration);setRun(false);setAlarm(false);}}>↺ Reset</Btn>
              {pi < PHASES.length-1 && <Btn variant="dark" onClick={() => go(pi+1)}>Suivant →</Btn>}
            </div>
          </div>
        </div>

        {alarm && (
          <div className="mt-4 text-center text-sm font-bold py-2.5 rounded-xl" style={{ background:"#e5393520", border:"1px solid #e53935", color:"#ff5252", fontFamily:"'Syne',sans-serif" }}>
            ⏰ Temps écoulé — passez à la phase suivante !
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
          { role:"coach" as FicheRole, actions: ph.coachActions },
          { role:"joueur" as FicheRole, actions: ph.playerActions },
        ].map(({role, actions}) => (
          <div key={role} className="rounded-xl p-4 border card-hover" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
            <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color: R[role].accent }}>
              {RL[role]}
            </div>
            <ul className="space-y-2">
              {actions.map((a,i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color:"#aaa" }}>
                  <span style={{ color: R[role].accent, flexShrink:0 }}>▸</span>{a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {"observerActions" in ph && (
        <div className="rounded-xl p-4 border mb-4 card-hover" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
          <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color: R.observateur.accent }}>
            {RL.observateur}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {(ph as typeof ph & {observerActions:string[]}).observerActions.map((a,i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color:"#aaa" }}>
                <span style={{ color: R.observateur.accent, flexShrink:0 }}>▸</span>{a}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context draw */}
      {["solo","duos","scenes"].includes(ph.id) && (
        <div className="rounded-xl p-4 border mb-4" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>
              🎲 Tirage de contexte
            </span>
            <Btn small onClick={draw}>Tirer au sort</Btn>
          </div>
          {ctx ? (
            <div className="text-center py-4 rounded-xl text-lg font-bold fade-up border"
              style={{ fontFamily:"'Syne',sans-serif", background:"#1e1e1e", borderColor: ph.color, color: ph.color }}>
              {ctx.emoji} {ctx.label}
            </div>
          ) : (
            <p className="text-sm text-center py-2" style={{ color:"#555" }}>Appuie pour révéler un contexte</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="rounded-xl p-4 border" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
        <div className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>📝 Notes</div>
        <textarea className="w-full text-sm bg-[#0d0d0d] rounded-lg p-3 resize-none outline-none text-[#aaa] placeholder-[#444]"
          style={{ minHeight:"72px", border:"1px solid #2a2a2a" }}
          placeholder="Ce qui a fonctionné, ce qui a résisté…"
          value={notes[`${pi}`]||""}
          onChange={e => setNotes(n => ({...n,[`${pi}`]:e.target.value}))}/>
      </div>
    </div>
  );
}

/* ══════════════════════ FICHES ══════════════════════ */
function FichesTab() {
  const [view, setView] = useState<"roles"|"phases">("roles");
  const [role, setRole] = useState<FicheRole>("coach");
  const [phase, setPhase] = useState<FichePhase>("warmup");
  const ph = PHASES.find(p => p.id===phase)!;

  const mantras: Record<FicheRole,string[]> = { coach:MANTRAS_COACH, joueur:MANTRAS_JOUEUR, observateur:MANTRAS_OBS };
  const erreurs: Record<FicheRole,{titre:string;fix:string}[]> = {
    coach: [
      {titre:"Parler pendant la scène",fix:"Attendre le freeze ou la fin."},
      {titre:"Feedback trop long",fix:"1–2 observations max."},
      {titre:"Dépasser le temps",fix:"Couper à l'heure dite."},
      {titre:"Question rhétorique",fix:"Si tu poses une question, attends la réponse."},
      {titre:"Cibler une seule personne",fix:"Varier les passes."},
      {titre:"Corriger l'intention",fix:"Corriger la perception, pas l'intention."},
    ],
    joueur: [
      {titre:"Annoncer le décor",fix:"Ne jamais dire « comme tu le sais… »"},
      {titre:"Geste flou",fix:"Un objet avec résistance, poids, texture."},
      {titre:"Ignorer le sol",fix:"Marbre ≠ plage ≠ vaisseau. Le sol change tout."},
      {titre:"Jouer en parallèle",fix:"Même espace, même lumière que le partenaire."},
      {titre:"Figer au Freeze",fix:"Position tenue mais regard vivant."},
    ],
    observateur: [
      {titre:"Réagir pendant la scène",fix:"Silence total — aucune réaction."},
      {titre:"« Tu aurais dû… »",fix:"« Je n'ai pas vu… » ou « Il m'a manqué… »"},
      {titre:"Retour trop long",fix:"3 points max."},
      {titre:"Valider l'intention",fix:"Ce que j'ai perçu, pas ce qu'ils voulaient."},
    ],
  };

  const Card = ({ children, accent }: { children: React.ReactNode; accent?: string }) => (
    <div className="rounded-xl p-4 border card-hover" style={{ background:"#141414", borderColor: accent ? `${accent}44` : "#2a2a2a" }}>{children}</div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      <div className="flex gap-2 mb-6">
        {(["roles","phases"] as const).map(v => (
          <Btn key={v} variant={view===v?"red":"ghost"} onClick={() => setView(v)}>
            {v==="roles" ? "👤 Par rôle" : "📋 Par exercice"}
          </Btn>
        ))}
      </div>

      {view==="roles" && (
        <>
          <div className="flex gap-2 mb-5">
            {(["coach","joueur","observateur"] as FicheRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 border cursor-pointer"
                style={{ fontFamily:"'Syne',sans-serif", background: role===r ? R[r].bg : "transparent", borderColor: role===r ? R[r].accent : "#2a2a2a", color: role===r ? R[r].accent : "#555" }}>
                {RL[r]}
              </button>
            ))}
          </div>

          {/* Hero */}
          <div className="rounded-2xl p-6 mb-5 border" style={{ background: R[role].bg, borderColor: R[role].accent }}>
            <div className="h-0.5 w-16 rounded-full mb-4" style={{ background: R[role].accent }}/>
            <div className="text-xs uppercase tracking-widest mb-1 opacity-40" style={{ fontFamily:"'Syne',sans-serif" }}>Fiche de poste</div>
            <h2 className="text-3xl font-bold mb-1" style={{ fontFamily:"'Syne',sans-serif", color: R[role].accent }}>{RL[role]}</h2>
            <p className="text-sm opacity-50 italic">
              {role==="coach"&&"Le chef d'orchestre silencieux qui voit tout"}
              {role==="joueur"&&"Incarner, ne pas expliquer — montrer, ne pas dire"}
              {role==="observateur"&&"Les yeux du public — le miroir précis"}
            </p>
          </div>

          {/* Mantras */}
          <Card accent={R[role].accent}>
            <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Mantras</div>
            <ul className="space-y-2">
              {mantras[role].map((m,i) => (
                <li key={i} className="flex items-start gap-3 py-2 border-b border-[#2a2a2a] last:border-0">
                  <span className="text-2xl leading-none opacity-20" style={{ color: R[role].accent }}>"</span>
                  <span className="text-sm italic" style={{ color:"#bbb" }}>{m}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Pièges à éviter</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {erreurs[role].map((e,i) => (
                <div key={i} className="rounded-lg p-3 border card-hover" style={{ background:"#1a0808", borderColor:"#3a1414" }}>
                  <div className="text-sm font-semibold mb-1" style={{ color:"#ff5252", fontFamily:"'Syne',sans-serif" }}>{e.titre}</div>
                  <div className="text-xs" style={{ color:"#888" }}>→ {e.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view==="phases" && (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {PHASES.map(p => <PhasePill key={p.id} p={p} active={p.id===phase} onClick={() => setPhase(p.id as FichePhase)}/>)}
          </div>

          <div className="rounded-2xl p-6 mb-5 border" style={{ background:"#141414", borderColor: ph.color, boxShadow:`0 0 30px ${ph.color}22` }}>
            <div className="h-0.5 w-16 rounded-full mb-4" style={{ background: ph.color }}/>
            <div className="text-xs uppercase tracking-widest mb-1 opacity-40" style={{ fontFamily:"'Syne',sans-serif" }}>{PHASES.findIndex(p=>p.id===phase)+1}/{PHASES.length} · {fmt(ph.duration)}</div>
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily:"'Syne',sans-serif", color: ph.color }}>{ph.emoji} {ph.subtitle}</h2>
            <p className="text-sm" style={{ color:"#888" }}>{ph.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(["coach","joueur","observateur"] as FicheRole[]).map(r => {
              const actions = r==="coach"?ph.coachActions:r==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
              if(!actions.length) return null;
              return (
                <div key={r} className="rounded-xl p-4 border" style={{ background: R[r].bg, borderColor:`${R[r].accent}44` }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily:"'Syne',sans-serif", color: R[r].accent }}>{RL[r]}</div>
                  <ul className="space-y-1.5">
                    {actions.map((a,i) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: R[r].text, opacity:0.8 }}>
                        <span style={{ color: R[r].accent, flexShrink:0 }}>▸</span>{a}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {["solo","duos","scenes"].includes(ph.id) && (
            <div className="rounded-xl p-4 border" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
              <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Contextes disponibles</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:CONTEXTES_SCENES).map((c,i) => (
                  <div key={i} className="rounded-lg px-3 py-2 text-xs flex items-center gap-2 border" style={{ background:"#1e1e1e", borderColor:"#2a2a2a", color:"#888" }}>
                    {c.emoji} {c.label}
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

/* ══════════════════════ PARTICIPANTS ══════════════════════ */
function ParticipantsTab() {
  const [parts, setParts] = useState<Participant[]>([
    {id:"1",name:"Alice",role:"joueur",passages:0},
    {id:"2",name:"Bruno",role:"joueur",passages:0},
    {id:"3",name:"Chloé",role:"observateur",passages:0},
  ]);
  const [name, setName] = useState("");

  const add = () => { if(!name.trim())return; setParts(p=>[...p,{id:Date.now()+"",name:name.trim(),role:"joueur",passages:0}]); setName(""); };
  const setRole = (id:string,r:FicheRole) => setParts(p=>p.map(x=>x.id===id?{...x,role:r}:x));
  const inc = (id:string) => setParts(p=>p.map(x=>x.id===id?{...x,passages:x.passages+1}:x));
  const rem = (id:string) => setParts(p=>p.filter(x=>x.id!==id));
  const total = parts.reduce((s,p)=>s+p.passages,0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-up">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {l:"Participants",v:parts.length,c:"#e53935"},
          {l:"Passages total",v:total,c:"#42a5f5"},
          {l:"Moy. / joueur",v:parts.length?(total/parts.length).toFixed(1):0,c:"#ab47bc"},
        ].map(s=>(
          <div key={s.l} className="rounded-xl p-4 border text-center" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
            <div className="text-3xl font-bold mb-0.5" style={{ fontFamily:"'Syne',sans-serif", color:s.c }}>{s.v}</div>
            <div className="text-xs uppercase tracking-widest" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Add */}
      <div className="rounded-xl p-4 border mb-4" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
        <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Ajouter</div>
        <div className="flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-lg text-sm outline-none bg-[#0d0d0d] text-[#f5f5f5] placeholder-[#444]"
            style={{ border:"1px solid #2a2a2a" }}
            placeholder="Prénom…" value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <Btn onClick={add}>+ Ajouter</Btn>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 mb-4">
        {parts.map(p=>(
          <div key={p.id} className="rounded-xl px-4 py-3 border flex items-center gap-3 card-hover" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: R[p.role].bg, color: R[p.role].accent, fontFamily:"'Syne',sans-serif", border:`1px solid ${R[p.role].accent}44` }}>
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate" style={{ fontFamily:"'Syne',sans-serif" }}>{p.name}</div>
              <div className="text-xs" style={{ color:"#555" }}>{p.passages} passage{p.passages>1?"s":""}</div>
            </div>
            <div className="flex gap-1">
              {(["coach","joueur","observateur"] as FicheRole[]).map(r=>(
                <button key={r} onClick={()=>setRole(p.id,r)}
                  className="text-xs px-2 py-1 rounded-full transition-all cursor-pointer border"
                  style={{ background:p.role===r?R[r].bg:"transparent", color:p.role===r?R[r].accent:"#555", borderColor:p.role===r?R[r].accent:"#2a2a2a" }}
                  title={RL[r]}>
                  {r==="coach"?"🎙":r==="joueur"?"🎭":"👁"}
                </button>
              ))}
            </div>
            <button onClick={()=>inc(p.id)}
              className="px-3 py-1 rounded-full text-xs font-bold text-white transition-all hover:scale-110 cursor-pointer"
              style={{ background:"#e53935", fontFamily:"'Syne',sans-serif" }}>+1</button>
            <button onClick={()=>rem(p.id)} className="text-[#444] hover:text-[#e53935] transition-colors text-xl leading-none cursor-pointer">×</button>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      {parts.length>0 && (
        <div className="rounded-xl p-4 border" style={{ background:"#141414", borderColor:"#2a2a2a" }}>
          <div className="text-xs uppercase tracking-widest mb-3 font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Équilibre des passages</div>
          <div className="space-y-2">
            {parts.map(p=>{
              const max = Math.max(...parts.map(x=>x.passages),1);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-20 text-xs truncate" style={{ color:"#888" }}>{p.name}</div>
                  <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background:"#1e1e1e" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width:`${(p.passages/max)*100}%`, background: R[p.role].accent }}/>
                  </div>
                  <div className="text-xs font-bold w-5 text-right" style={{ fontFamily:"'Syne',sans-serif", color: R[p.role].accent }}>{p.passages}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ PROJECTOR ══════════════════════ */
function ProjectorTab({ onBack }: { onBack: () => void }) {
  const [pi, setPi] = useState(0);
  const [t, setT] = useState(PHASES[0].duration);
  const [run, setRun] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [ctx, setCtx] = useState<{emoji:string;label:string}|null>(null);
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);
  const ph = PHASES[pi];

  useEffect(() => {
    if(run){ref.current=setInterval(()=>setT(v=>{if(v<=1){setRun(false);setAlarm(true);return 0;}return v-1;}),1000);}
    return()=>{if(ref.current)clearInterval(ref.current);};
  },[run]);

  const go=(i:number)=>{setPi(i);setT(PHASES[i].duration);setRun(false);setAlarm(false);setCtx(null);};
  const draw=()=>{const c=ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:ph.id==="scenes"?CONTEXTES_SCENES:[];if(c.length)setCtx(rand(c));};

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${alarm?"alarm-pulse":""}`}
      style={{ background:"#0a0a0a" }}>
      
      {/* Back */}
      <button onClick={onBack} className="fixed top-4 left-4 z-50 px-4 py-2 rounded-full text-xs font-bold border cursor-pointer"
        style={{ fontFamily:"'Syne',sans-serif", background:"#141414", borderColor:"#2a2a2a", color:"#888" }}>← Retour</button>

      {/* Phase nav */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {PHASES.map((p,i)=>(
          <button key={p.id} onClick={()=>go(i)} className="text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all"
            style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, background:i===pi?p.color:"transparent", borderColor:i===pi?p.color:"#2a2a2a", color:i===pi?"#fff":"#555" }}>
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Big ring */}
      <div className="relative mb-6">
        <Ring pct={t/ph.duration} color={ph.color} size={260}/>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-7xl font-bold" style={{ fontFamily:"'Syne',sans-serif", color: ph.color }}>{fmt(t)}</span>
          <span className="text-sm mt-1" style={{ color:"#444" }}>{fmt(ph.duration)} total</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-center mb-2" style={{ fontFamily:"'Syne',sans-serif", color: ph.color }}>
        {ph.emoji} {ph.subtitle}
      </h1>
      <p className="text-lg text-center mb-8" style={{ color:"#555" }}>{ph.description}</p>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        {[
          {label: run?"⏸":"▶", action:()=>{setRun(!run);setAlarm(false);}},
          {label:"↺", action:()=>{setT(ph.duration);setRun(false);setAlarm(false);}},
        ].map((b,i)=>(
          <button key={i} onClick={b.action}
            className="w-16 h-16 rounded-full text-2xl font-bold transition-all hover:scale-110 cursor-pointer border"
            style={{ background:"#141414", borderColor: ph.color, color: ph.color, fontFamily:"'Syne',sans-serif" }}>
            {b.label}
          </button>
        ))}
        {["solo","duos","scenes"].includes(ph.id) && (
          <button onClick={draw}
            className="w-16 h-16 rounded-full text-2xl font-bold transition-all hover:scale-110 cursor-pointer border"
            style={{ background:"#141414", borderColor:"#2a2a2a", color:"#888" }}>🎲</button>
        )}
      </div>

      {ctx && (
        <div className="text-3xl font-bold text-center py-5 px-10 rounded-2xl border fade-up"
          style={{ fontFamily:"'Syne',sans-serif", background:"#141414", borderColor: ph.color, color: ph.color }}>
          {ctx.emoji} {ctx.label}
        </div>
      )}

      {alarm && (
        <div className="mt-4 text-2xl font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#e53935" }}>
          ⏰ Temps écoulé !
        </div>
      )}
    </div>
  );
}

/* ══════════════════════ MAIN ══════════════════════ */
export default function ImproApp() {
  const [tab, setTab] = useState<Tab>("session");

  if(tab==="projector") return <ProjectorTab onBack={()=>setTab("session")}/>;

  const tabs = [
    {id:"session" as Tab, label:"Séance", icon:"⏱"},
    {id:"fiches" as Tab, label:"Fiches", icon:"📋"},
    {id:"participants" as Tab, label:"Participants", icon:"👥"},
    {id:"projector" as Tab, label:"Projecteur", icon:"📽"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d" }}>
      {/* Header */}
      <header style={{ background:"#0a0a0a", borderBottom:"1px solid #1e1e1e" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"#e53935" }}>
              <span className="text-white text-sm font-bold" style={{ fontFamily:"'Syne',sans-serif" }}>IQ</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest mb-0" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>Improvisation</div>
              <h1 className="text-lg font-bold leading-none" style={{ fontFamily:"'Syne',sans-serif", color:"#e53935" }}>Qui ? Quoi ? Où ?</h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold" style={{ fontFamily:"'Syne',sans-serif", color:"#555" }}>1h · 10 participants</div>
          </div>
        </div>
        {/* Red line */}
        <div className="h-0.5 w-full" style={{ background:"linear-gradient(90deg, #e53935, transparent)" }}/>
      </header>

      {/* Nav */}
      <nav style={{ background:"#0a0a0a", borderBottom:"1px solid #1e1e1e", position:"sticky", top:0, zIndex:40 }}>
        <div className="max-w-3xl mx-auto flex">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex-1 px-2 py-3 text-xs font-bold transition-all cursor-pointer border-b-2"
              style={{ fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em",
                color: tab===t.id?"#e53935":"#555",
                borderColor: tab===t.id?"#e53935":"transparent",
                background:"transparent" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>

      {tab==="session" && <SessionTab/>}
      {tab==="fiches" && <FichesTab/>}
      {tab==="participants" && <ParticipantsTab/>}
    </div>
  );
}
