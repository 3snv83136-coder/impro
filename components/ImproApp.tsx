"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  PHASES, CONTEXTES_SOLO, CONTEXTES_DUOS, CONTEXTES_SCENES,
  MANTRAS_JOUEUR, MANTRAS_COACH, MANTRAS_OBS,
} from "@/lib/data";

type Tab = "session" | "fiches" | "participants" | "projector";
type Role = "coach" | "joueur" | "observateur";
type PhaseId = "warmup"|"theory"|"solo"|"duos"|"scenes"|"debrief";
type Participant = { id:string; name:string; role:Role; passages:number };

// ── Comme J'aime–inspired palette ───────────────────────────────────────────
const PC = ["#00b67a","#f58220","#e4007c","#00a5b5","#6b2fa0","#e63946"];
const PBG = ["#e6f9f2","#fff3e6","#fde8f3","#e0f6f8","#f3ebfa","#fde8ea"];

const ROLES: Record<Role,{color:string;bg:string;emoji:string;label:string}> = {
  coach:       { color:"#e4007c", bg:"#fde8f3", emoji:"🎬", label:"Coach" },
  joueur:      { color:"#00b67a", bg:"#e6f9f2", emoji:"🎭", label:"Joueur" },
  observateur: { color:"#6b2fa0", bg:"#f3ebfa", emoji:"👁",  label:"Observateur" },
};

function fmt(s:number){ return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function rand<T>(a:T[]):T{ return a[Math.floor(Math.random()*a.length)]; }

// ── Timer Ring ──────────────────────────────────────────────────────────────
function TimerRing({ pct, color, size=150, time, alarm }:
  { pct:number; color:string; size?:number; time:string; alarm?:boolean }) {
  const stroke = 8;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={`relative ${alarm ? "alarm-bounce" : ""}`} style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c*(1-Math.max(0,Math.min(1,pct)))}
          style={{ transition:"stroke-dashoffset 1s linear" }}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-3xl text-[#2d2d2d]">{time}</span>
      </div>
    </div>
  );
}

// ── Phase Pills ─────────────────────────────────────────────────────────────
function PhasePills({ active, onSelect }: { active:number; onSelect:(i:number)=>void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-1">
      {PHASES.map((p, i) => {
        const isActive = i === active;
        const isDone = i < active;
        const color = PC[i];
        return (
          <button key={p.id} onClick={() => onSelect(i)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer flex-shrink-0"
            style={{
              background: isActive ? color : isDone ? PBG[i] : "#f5f5f5",
              color: isActive ? "#fff" : isDone ? color : "#a0a0a0",
              border: isActive ? `2px solid ${color}` : isDone ? `2px solid ${color}40` : "2px solid #e5e5e5",
            }}>
            <span>{p.emoji}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── CTA Button (Comme J'aime style) ─────────────────────────────────────────
function CTA({ children, color, variant="solid", onClick, className="" }:
  { children:React.ReactNode; color:string; variant?:"solid"|"outline"|"soft"; onClick:()=>void; className?:string }) {
  const base = "px-6 py-3 rounded-full font-extrabold text-sm cursor-pointer inline-flex items-center gap-2";
  const styles = variant === "solid"
    ? { background:color, color:"#fff", border:`2px solid ${color}`, boxShadow:`0 4px 14px ${color}30` }
    : variant === "outline"
    ? { background:"#fff", color, border:`2px solid ${color}` }
    : { background:`${color}10`, color, border:`2px solid transparent` };
  return (
    <button onClick={onClick} className={`${base} hover:opacity-90 hover:scale-[1.02] ${className}`} style={styles}>
      {children}
    </button>
  );
}

// ── Card (white, rounded, shadow) ───────────────────────────────────────────
function Card({ children, className="", border="" }:
  { children:React.ReactNode; className?:string; border?:string }) {
  return (
    <div className={`rounded-[20px] bg-white p-5 ${className}`}
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: border ? `3px solid ${border}` : "1px solid #f0f0f0",
      }}>
      {children}
    </div>
  );
}

// ── Colored accent card ─────────────────────────────────────────────────────
function AccentCard({ children, color, bg, className="" }:
  { children:React.ReactNode; color:string; bg:string; className?:string }) {
  return (
    <div className={`rounded-[20px] p-5 ${className}`}
      style={{ background:bg, border:`2px solid ${color}25` }}>
      {children}
    </div>
  );
}

// ── Stat Pill ───────────────────────────────────────────────────────────────
function StatPill({ value, label, color, bg }: { value:string|number; label:string; color:string; bg:string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background:bg }}>
      <div className="font-black text-3xl" style={{ color }}>{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b6b6b] mt-1">{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION TAB
// ══════════════════════════════════════════════════════════════════════════════
function SessionTab() {
  const [pi, setPi] = useState(0);
  const [t, setT] = useState(PHASES[0].duration);
  const [run, setRun] = useState(false);
  const [alarm, setAlarm] = useState(false);
  const [ctx, setCtx] = useState<{emoji:string;label:string}|null>(null);
  const [ctxKey, setCtxKey] = useState(0);
  const [notes, setNotes] = useState<Record<string,string>>({});
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);
  const ph = PHASES[pi];
  const color = PC[pi];
  const bg = PBG[pi];

  const beep = useCallback(() => {
    try {
      const ac = new (window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      [523,659,784].forEach((f,i) => {
        const o=ac.createOscillator(), g=ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type="sine"; o.frequency.value=f;
        g.gain.setValueAtTime(0,ac.currentTime+i*0.12);
        g.gain.linearRampToValueAtTime(0.3,ac.currentTime+i*0.12+0.05);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.12+0.2);
        o.start(ac.currentTime+i*0.12); o.stop(ac.currentTime+i*0.12+0.25);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (run) {
      ref.current = setInterval(() => setT(v => {
        if (v <= 1) { setRun(false); setAlarm(true); beep(); return 0; }
        return v - 1;
      }), 1000);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [run, beep]);

  const go = (i:number) => { setPi(i); setT(PHASES[i].duration); setRun(false); setAlarm(false); setCtx(null); };
  const draw = () => {
    const c = ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:ph.id==="scenes"?CONTEXTES_SCENES:[];
    if (c.length) { setCtx(rand(c)); setCtxKey(k=>k+1); }
  };

  return (
    <div className="fade-up">
      {/* Phase pills */}
      <div className="border-b border-[#f0f0f0] bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <PhasePills active={pi} onSelect={go}/>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 stagger">
        {/* Timer card */}
        <Card className="flex flex-col items-center !p-8" border={color}>
          <TimerRing pct={t/ph.duration} color={color} size={150} time={fmt(t)} alarm={alarm}/>

          <div className="mt-5 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold"
              style={{ background:bg, color }}>
              {ph.emoji} Phase {pi+1}/{PHASES.length} · {fmt(ph.duration)}
            </span>
            <h2 className="font-black text-2xl sm:text-3xl mt-3" style={{color:"#6b2fa0"}}>{ph.subtitle}</h2>
            <p className="text-sm text-[#6b6b6b] mt-2 max-w-md mx-auto leading-relaxed">{ph.description}</p>
          </div>

          <div className="flex gap-2.5 mt-6 flex-wrap justify-center">
            <CTA color={color} onClick={()=>{setRun(!run);setAlarm(false);}}>
              {run ? "⏸ Pause" : t===0 ? "↻ Relancer" : "▶ Démarrer"}
            </CTA>
            <CTA color="#6b6b6b" variant="outline" onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>
              ↻ Reset
            </CTA>
            {pi < PHASES.length-1 && (
              <CTA color={PC[pi+1]} variant="soft" onClick={()=>go(pi+1)}>Suivant ▸</CTA>
            )}
            {["solo","duos","scenes"].includes(ph.id) && (
              <CTA color={color} variant="outline" onClick={draw}>🎲 Contexte</CTA>
            )}
          </div>

          {alarm && (
            <div className="mt-5 px-6 py-3 rounded-full font-extrabold text-sm pop"
              style={{ background:bg, color, border:`2px solid ${color}` }}>
              🔔 Temps écoulé — phase suivante !
            </div>
          )}
        </Card>

        {/* Context */}
        {ctx && (
          <div key={ctxKey} className="pop">
            <Card className="text-center !py-4" border={color}>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0a0a0] mb-1">Contexte tiré</div>
              <div className="font-black text-xl" style={{ color }}>{ctx.emoji} {ctx.label}</div>
            </Card>
          </div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coach */}
          <AccentCard color={ROLES.coach.color} bg={ROLES.coach.bg}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{background:"#fff"}}>{ROLES.coach.emoji}</div>
              <span className="font-extrabold text-sm" style={{color:ROLES.coach.color}}>Instructions Coach</span>
            </div>
            <ul className="space-y-2">
              {ph.coachActions.map((a,i)=>(
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#2d2d2d] leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:ROLES.coach.color}}/>{a}
                </li>
              ))}
            </ul>
          </AccentCard>

          {/* Joueur */}
          <AccentCard color={ROLES.joueur.color} bg={ROLES.joueur.bg}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{background:"#fff"}}>{ROLES.joueur.emoji}</div>
              <span className="font-extrabold text-sm" style={{color:ROLES.joueur.color}}>Objectifs Joueur</span>
            </div>
            <ul className="space-y-2">
              {ph.playerActions.map((a,i)=>(
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#2d2d2d] leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:ROLES.joueur.color}}/>{a}
                </li>
              ))}
            </ul>
          </AccentCard>

          {/* Notes */}
          <Card>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f5f5f5] flex items-center justify-center text-sm">✏️</div>
              <span className="font-extrabold text-sm text-[#6b6b6b]">Notes de séance</span>
            </div>
            <textarea
              className="w-full text-[13px] font-semibold rounded-2xl p-3 resize-none outline-none border-2 border-[#f0f0f0] focus:border-[#6b2fa0] focus:ring-2 focus:ring-[#6b2fa020] transition-all bg-[#f9f9f9] text-[#2d2d2d] placeholder:text-[#c0c0c0]"
              style={{ minHeight:"110px" }}
              placeholder="Observations, feedback..."
              value={notes[`${pi}`]||""}
              onChange={e=>setNotes(n=>({...n,[`${pi}`]:e.target.value}))}/>
          </Card>
        </div>

        {/* Observer */}
        {"observerActions" in ph && (
          <AccentCard color={ROLES.observateur.color} bg={ROLES.observateur.bg}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{background:"#fff"}}>{ROLES.observateur.emoji}</div>
              <span className="font-extrabold text-sm" style={{color:ROLES.observateur.color}}>Notes Observateur</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(ph as typeof ph & {observerActions:string[]}).observerActions.map((a,i)=>(
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#2d2d2d] leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:ROLES.observateur.color}}/>{a}
                </div>
              ))}
            </div>
          </AccentCard>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FICHES TAB
// ══════════════════════════════════════════════════════════════════════════════
function FichesTab() {
  const [view, setView] = useState<"roles"|"phases">("roles");
  const [role, setRole] = useState<Role>("coach");
  const [phase, setPhase] = useState<PhaseId>("warmup");
  const ph = PHASES.find(p=>p.id===phase)!;
  const phIdx = PHASES.findIndex(p=>p.id===phase);
  const color = PC[phIdx];
  const bg = PBG[phIdx];
  const cfg = ROLES[role];

  const mantras:Record<Role,string[]> = { coach:MANTRAS_COACH, joueur:MANTRAS_JOUEUR, observateur:MANTRAS_OBS };
  const erreurs:Record<Role,{titre:string;fix:string}[]> = {
    coach:[
      {titre:"Parler pendant la scène",fix:"Attendre le freeze ou la fin."},
      {titre:"Feedback trop long",fix:"1–2 observations max."},
      {titre:"Dépasser le temps",fix:"Couper à l'heure dite."},
      {titre:"Question rhétorique",fix:"Attendre la réponse vraie."},
      {titre:"Cibler une seule personne",fix:"Varier les passes."},
      {titre:"Corriger l'intention",fix:"Corriger la perception."},
    ],
    joueur:[
      {titre:"Annoncer le décor",fix:"Montrer, ne pas dire."},
      {titre:"Geste flou",fix:"Résistance, poids, texture."},
      {titre:"Ignorer le sol",fix:"Marbre ≠ plage ≠ vaisseau."},
      {titre:"Jouer en parallèle",fix:"Même espace, même lumière."},
      {titre:"Figer au Freeze",fix:"Position tenue, regard vivant."},
    ],
    observateur:[
      {titre:"Réagir pendant la scène",fix:"Silence total."},
      {titre:"« Tu aurais dû… »",fix:"« Je n'ai pas vu… »"},
      {titre:"Retour trop long",fix:"3 points max."},
      {titre:"Valider l'intention",fix:"Ce que j'ai perçu."},
    ],
  };

  return (
    <div className="fade-up">
      {/* Sub-nav */}
      <div className="bg-white border-b border-[#f0f0f0]">
        <div className="flex max-w-3xl mx-auto px-4 gap-1">
          {(["roles","phases"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="px-5 py-3 text-sm font-extrabold cursor-pointer relative"
              style={{ color: view===v ? "#6b2fa0" : "#a0a0a0" }}>
              {v==="roles" ? "🎭 Par rôle" : "📋 Par exercice"}
              {view===v && <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-[#6b2fa0]"/>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-3xl mx-auto w-full space-y-5 stagger">
        {view==="roles" && (
          <>
            {/* Role selector pills */}
            <div className="flex gap-2 flex-wrap">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const c=ROLES[r];
                const active = role===r;
                return (
                  <button key={r} onClick={()=>setRole(r)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold cursor-pointer"
                    style={{
                      background: active ? c.bg : "#f5f5f5",
                      color: active ? c.color : "#a0a0a0",
                      border: active ? `2px solid ${c.color}` : "2px solid #e5e5e5",
                    }}>
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>

            {/* Hero card */}
            <Card border={cfg.color} className="pop">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{background:cfg.bg}}>
                  {cfg.emoji}
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a0a0a0]">Fiche de poste</div>
                  <h2 className="font-black text-2xl" style={{color:cfg.color}}>{cfg.label}</h2>
                  <p className="text-sm text-[#6b6b6b] mt-0.5">
                    {role==="coach"&&"Chef d'orchestre silencieux 🧭"}
                    {role==="joueur"&&"Montrer, ne pas dire 🎭"}
                    {role==="observateur"&&"Les yeux du public 👁"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Mantras */}
            <Card>
              <div className="font-extrabold text-xs uppercase tracking-[0.15em] text-[#a0a0a0] mb-4">✨ Mantras</div>
              <div className="space-y-0">
                {mantras[role].map((m,i)=>(
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-[#f0f0f0] last:border-0">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{background:cfg.bg,color:cfg.color}}>{i+1}</span>
                    <span className="text-sm text-[#2d2d2d] italic leading-relaxed">« {m} »</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pièges */}
            <div>
              <div className="font-extrabold text-xs uppercase tracking-[0.15em] text-[#a0a0a0] mb-3">⚠️ Pièges à éviter</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {erreurs[role].map((e,i)=>(
                  <Card key={i} className="!p-4">
                    <div className="text-sm font-extrabold text-[#e63946] mb-1.5">✕ {e.titre}</div>
                    <div className="text-sm font-bold text-[#00b67a]">✓ {e.fix}</div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {view==="phases" && (
          <>
            <Card className="!px-3 !py-1">
              <PhasePills active={phIdx} onSelect={(i)=>setPhase(PHASES[i].id as PhaseId)}/>
            </Card>

            <Card border={color} className="pop">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:bg}}>
                  {ph.emoji}
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-[#a0a0a0] uppercase tracking-wide">
                    Phase {phIdx+1}/{PHASES.length} · {fmt(ph.duration)}
                  </div>
                  <h2 className="font-black text-xl" style={{color}}>{ph.subtitle}</h2>
                  <p className="text-sm text-[#6b6b6b] mt-0.5">{ph.description}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const rc=ROLES[r];
                const actions=r==="coach"?ph.coachActions:r==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
                if(!actions.length)return null;
                return (
                  <AccentCard key={r} color={rc.color} bg={rc.bg}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                        style={{background:"#fff"}}>{rc.emoji}</div>
                      <span className="text-xs font-extrabold" style={{color:rc.color}}>{rc.label}</span>
                    </div>
                    <ul className="space-y-2">
                      {actions.map((a,i)=>(
                        <li key={i} className="flex items-start gap-2 text-[13px] text-[#2d2d2d] leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:rc.color}}/>{a}
                        </li>
                      ))}
                    </ul>
                  </AccentCard>
                );
              })}
            </div>

            {["solo","duos","scenes"].includes(ph.id)&&(
              <Card>
                <div className="font-extrabold text-xs uppercase tracking-[0.15em] text-[#a0a0a0] mb-3">🎭 Contextes</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:CONTEXTES_SCENES).map((c,i)=>(
                    <div key={i} className="rounded-xl px-4 py-3 text-sm font-bold"
                      style={{background:bg, color:"#2d2d2d"}}>
                      {c.emoji} {c.label}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PARTICIPANTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ParticipantsTab() {
  const [parts, setParts] = useState<Participant[]>([
    {id:"1",name:"Alice",role:"joueur",passages:0},
    {id:"2",name:"Bruno",role:"coach",passages:0},
    {id:"3",name:"Chloé",role:"observateur",passages:0},
  ]);
  const [name, setName] = useState("");

  const add=()=>{ if(!name.trim())return; setParts(p=>[...p,{id:Date.now()+"",name:name.trim(),role:"joueur",passages:0}]); setName(""); };
  const setRoleFn=(id:string,r:Role)=>setParts(p=>p.map(x=>x.id===id?{...x,role:r}:x));
  const inc=(id:string)=>setParts(p=>p.map(x=>x.id===id?{...x,passages:x.passages+1}:x));
  const rem=(id:string)=>setParts(p=>p.filter(x=>x.id!==id));
  const total=parts.reduce((s,p)=>s+p.passages,0);

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto w-full fade-up space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 stagger">
        <StatPill value={parts.length} label="Présents" color="#00b67a" bg="#e6f9f2"/>
        <StatPill value={total} label="Passages" color="#6b2fa0" bg="#f3ebfa"/>
        <StatPill value={parts.length?(total/parts.length).toFixed(1):"0"} label="Moyenne" color="#f58220" bg="#fff3e6"/>
      </div>

      {/* Add */}
      <Card>
        <div className="font-extrabold text-xs uppercase tracking-[0.15em] text-[#a0a0a0] mb-3">➕ Ajouter un participant</div>
        <div className="flex gap-3">
          <input className="flex-1 px-4 py-3 rounded-full text-sm font-bold outline-none border-2 border-[#e5e5e5] bg-[#f9f9f9] focus:border-[#6b2fa0] focus:ring-2 focus:ring-[#6b2fa020] transition-all text-[#2d2d2d] placeholder:text-[#c0c0c0]"
            placeholder="Prénom..." value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <CTA color="#00b67a" onClick={add}>Ajouter</CTA>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-2 stagger">
        {parts.map(p=>{
          const cfg=ROLES[p.role];
          return (
            <Card key={p.id} className="!p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{background:cfg.bg,color:cfg.color,border:`2px solid ${cfg.color}40`}}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-[#2d2d2d]">{p.name}</div>
                <div className="text-xs font-bold text-[#a0a0a0]">{p.passages} passage{p.passages>1?"s":""}</div>
              </div>
              <div className="flex gap-1">
                {(["coach","joueur","observateur"] as Role[]).map(r=>{
                  const rc=ROLES[r];
                  const active = p.role===r;
                  return (
                    <button key={r} onClick={()=>setRoleFn(p.id,r)}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer"
                      style={{
                        background: active ? rc.bg : "#f5f5f5",
                        border: active ? `2px solid ${rc.color}` : "2px solid #e5e5e5",
                      }}
                      title={rc.label}>{rc.emoji}</button>
                  );
                })}
              </div>
              <CTA color="#00b67a" variant="soft" onClick={()=>inc(p.id)} className="!px-3 !py-1.5 text-xs">+1</CTA>
              <button onClick={()=>rem(p.id)} className="text-[#e5e5e5] hover:text-[#e63946] text-xl cursor-pointer transition-colors leading-none font-bold">×</button>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      {parts.length>0&&(
        <Card>
          <div className="font-extrabold text-xs uppercase tracking-[0.15em] text-[#a0a0a0] mb-4">📊 Équilibre des passages</div>
          <div className="space-y-3">
            {parts.map(p=>{
              const max=Math.max(...parts.map(x=>x.passages),1);
              const cfg=ROLES[p.role];
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-14 text-xs font-bold text-[#6b6b6b] truncate">{p.name}</div>
                  <div className="flex-1 h-3 rounded-full overflow-hidden bg-[#f5f5f5]">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${(p.passages/max)*100}%`, background:cfg.color }}/>
                  </div>
                  <div className="w-5 text-right text-xs font-black" style={{color:cfg.color}}>{p.passages}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTOR TAB
// ══════════════════════════════════════════════════════════════════════════════
function ProjectorTab({onBack}:{onBack:()=>void}) {
  const [pi,setPi]=useState(0);
  const [t,setT]=useState(PHASES[0].duration);
  const [run,setRun]=useState(false);
  const [alarm,setAlarm]=useState(false);
  const [ctx,setCtx]=useState<{emoji:string;label:string}|null>(null);
  const [ctxKey,setCtxKey]=useState(0);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const ph=PHASES[pi]; const color=PC[pi]; const bg=PBG[pi];

  useEffect(()=>{
    if(run){ref.current=setInterval(()=>setT(v=>{if(v<=1){setRun(false);setAlarm(true);return 0;}return v-1;}),1000);}
    return()=>{if(ref.current)clearInterval(ref.current);};
  },[run]);

  const go=(i:number)=>{setPi(i);setT(PHASES[i].duration);setRun(false);setAlarm(false);setCtx(null);};
  const draw=()=>{
    const c=ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:ph.id==="scenes"?CONTEXTES_SCENES:[];
    if(c.length){setCtx(rand(c));setCtxKey(k=>k+1);}
  };

  return (
    <div className={`min-h-dvh flex flex-col items-center justify-center p-8 relative bg-white ${alarm?"alarm-bounce":""}`}>
      <button onClick={onBack}
        className="fixed top-4 left-4 z-50 px-5 py-2.5 rounded-full text-sm font-extrabold cursor-pointer bg-[#f5f5f5] text-[#6b6b6b] hover:bg-[#e5e5e5] transition-colors border-2 border-[#e5e5e5]">
        ← Retour
      </button>

      <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#f0f0f0] px-4">
        <PhasePills active={pi} onSelect={go}/>
      </div>

      <div className="mt-14">
        <TimerRing pct={t/ph.duration} color={color} size={280} time={fmt(t)} alarm={alarm}/>
      </div>

      <h1 className="font-black text-4xl md:text-5xl text-center mt-8 mb-2" style={{color:"#6b2fa0"}}>
        {ph.emoji} {ph.subtitle}
      </h1>
      <p className="text-lg text-center text-[#6b6b6b] mb-8 max-w-lg">{ph.description}</p>

      <div className="flex gap-3 flex-wrap justify-center">
        <CTA color={color} onClick={()=>{setRun(!run);setAlarm(false);}}>
          {run ? "⏸ Pause" : "▶ Démarrer"}
        </CTA>
        <CTA color="#6b6b6b" variant="outline" onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>↻ Reset</CTA>
        {["solo","duos","scenes"].includes(ph.id) && (
          <CTA color={color} variant="outline" onClick={draw}>🎲 Contexte</CTA>
        )}
      </div>

      {ctx&&(
        <div key={ctxKey} className="mt-8 px-8 py-5 rounded-[20px] font-black text-2xl pop"
          style={{background:bg,color,border:`3px solid ${color}`,boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
          {ctx.emoji} {ctx.label}
        </div>
      )}

      {alarm&&(
        <div className="mt-6 font-black text-2xl pop" style={{color}}>
          🔔 Temps écoulé !
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
export default function ImproApp() {
  const [tab, setTab] = useState<Tab>("session");

  if (tab==="projector") return <ProjectorTab onBack={()=>setTab("session")}/>;

  const TABS: {id:Tab; icon:string; label:string}[] = [
    {id:"session", icon:"⏱", label:"Session"},
    {id:"fiches",  icon:"📋", label:"Fiches"},
    {id:"participants", icon:"👥", label:"Troupe"},
    {id:"projector", icon:"📽", label:"Scène"},
  ];

  return (
    <div className="min-h-dvh bg-white">
      {/* Header — Comme J'aime style: white, clean, purple accents */}
      <header className="bg-white border-b-[3px] border-[#6b2fa0] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0 mr-8">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
                style={{background:"#f3ebfa",border:"2px solid #6b2fa040"}}>
                🎭
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-base" style={{color:"#6b2fa0"}}>Qui · Quoi · Où</div>
                <div className="text-[10px] font-bold text-[#a0a0a0] -mt-0.5">Impro Coach</div>
              </div>
            </div>

            {/* Desktop tabs */}
            <nav className="hidden md:flex flex-1 h-full">
              {TABS.map(t=>{
                const active = tab===t.id;
                return (
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    className="flex items-center gap-2 px-5 h-full text-sm font-extrabold cursor-pointer relative"
                    style={{ color: active ? "#6b2fa0" : "#a0a0a0" }}>
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                    {active && (
                      <div className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-[#e4007c]"/>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile title */}
            <div className="flex-1 md:hidden text-center">
              <span className="font-black text-sm" style={{color:"#6b2fa0"}}>
                {TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement bar */}
      <div className="bg-[#6b2fa0] text-white text-center py-2 px-4">
        <span className="text-xs font-extrabold">
          🎭 Séance Qui · Quoi · Où — 6 phases · 1h de pratique · {PHASES.length} exercices
        </span>
      </div>

      {/* Content */}
      <main className="pb-20 md:pb-8">
        {tab==="session"&&<SessionTab/>}
        {tab==="fiches"&&<FichesTab/>}
        {tab==="participants"&&<ParticipantsTab/>}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#6b2fa0] z-40 safe-bottom">
        <div className="flex justify-around py-2 max-w-md mx-auto">
          {TABS.map(t=>{
            const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-4 cursor-pointer rounded-xl transition-all"
                style={{
                  color: active ? "#6b2fa0" : "#a0a0a0",
                  background: active ? "#f3ebfa" : "transparent",
                }}>
                <span className="text-lg">{t.icon}</span>
                <span className="text-[10px] font-extrabold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
