"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  PHASES, CONTEXTES_SOLO, CONTEXTES_DUOS, CONTEXTES_SCENES,
  MANTRAS_JOUEUR, MANTRAS_COACH, MANTRAS_OBS,
} from "@/lib/data";

type Tab = "session"|"fiches"|"participants"|"projector";
type Role = "coach"|"joueur"|"observateur";
type PhaseId = "warmup"|"theory"|"solo"|"duos"|"scenes"|"debrief";
type Participant = { id:string; name:string; role:Role; passages:number };

// ── Phase config ──────────────────────────────────────────────────────────
const PC = [
  { bg:"#22c55e", light:"#dcfce7", dark:"#16a34a", text:"#14532d" },
  { bg:"#3b82f6", light:"#dbeafe", dark:"#2563eb", text:"#1e3a8a" },
  { bg:"#9333ea", light:"#f3e8ff", dark:"#7c22ce", text:"#4a044e" },
  { bg:"#ef4444", light:"#fee2e2", dark:"#dc2626", text:"#7f1d1d" },
  { bg:"#f97316", light:"#ffedd5", dark:"#ea6c00", text:"#7c2d12" },
  { bg:"#06b6d4", light:"#cffafe", dark:"#0891b2", text:"#164e63" },
];

const ROLE_CFG = {
  coach:       { color:"#ef4444", light:"#fee2e2", dark:"#dc2626", emoji:"🧑‍💼", label:"Coach" },
  joueur:      { color:"#3b82f6", light:"#dbeafe", dark:"#2563eb", emoji:"🎭",   label:"Joueur" },
  observateur: { color:"#9333ea", light:"#f3e8ff", dark:"#7c22ce", emoji:"👁",   label:"Observateur" },
};

function fmt(s:number){ return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function rand<T>(a:T[]):T{ return a[Math.floor(Math.random()*a.length)]; }

// ── Ring component ─────────────────────────────────────────────────────────
function Ring({ pct, color, size=160, children }: { pct:number; color:string; size?:number; children?:React.ReactNode }) {
  const r = size * 0.42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c*(1-Math.max(0,Math.min(1,pct)))}
          style={{ transition:"stroke-dashoffset 1s linear" }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ── Primary Button ─────────────────────────────────────────────────────────
function Btn({
  children, onClick, color="#6c63ff", outline=false, sm=false, disabled=false
}:{
  children:React.ReactNode; onClick?:()=>void;
  color?:string; outline?:boolean; sm?:boolean; disabled?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="rounded-xl font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        padding: sm ? "6px 14px" : "10px 22px",
        fontSize: sm ? "0.78rem" : "0.875rem",
        background: outline ? "white" : color,
        color: outline ? color : "white",
        border: `2px solid ${color}`,
        fontFamily:"'Inter',sans-serif",
        fontWeight:600,
        boxShadow: outline ? "none" : `0 2px 8px ${color}40`,
      }}>
      {children}
    </button>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────
function Card({ children, className="", style={} }: { children:React.ReactNode; className?:string; style?:React.CSSProperties }) {
  return (
    <div className={`rounded-2xl bg-white ${className}`}
      style={{ boxShadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)", border:"1px solid #e2e8f0", ...style }}>
      {children}
    </div>
  );
}

// ── Badge ───────────────────────────────────────────────────────────────────
function Badge({ children, color, bg }: { children:React.ReactNode; color:string; bg:string }) {
  return (
    <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold"
      style={{ background:bg, color }}>
      {children}
    </span>
  );
}

// ── Phase Tab ───────────────────────────────────────────────────────────────
function PhaseTab({ p, color, active, onClick, idx }: { p:typeof PHASES[0]; color:typeof PC[0]; active:boolean; idx:number; onClick:()=>void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 flex-shrink-0"
      style={{
        fontFamily:"'Inter',sans-serif",
        color: active ? color.bg : "#94a3b8",
        borderColor: active ? color.bg : "transparent",
        background: "transparent",
      }}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: active ? color.bg : "#f1f5f9",
          color: active ? "white" : "#94a3b8",
        }}>
        {idx+1}
      </span>
      <span className="hidden sm:inline">{p.label}</span>
      <span className="sm:hidden">{p.emoji}</span>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SESSION
// ══════════════════════════════════════════════════════════════════════════════
function SessionTab() {
  const [pi,setPi]=useState(0);
  const [t,setT]=useState(PHASES[0].duration);
  const [run,setRun]=useState(false);
  const [alarm,setAlarm]=useState(false);
  const [ctx,setCtx]=useState<{emoji:string;label:string}|null>(null);
  const [ctxKey,setCtxKey]=useState(0);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const ph=PHASES[pi]; const pc=PC[pi];

  const beep=useCallback(()=>{
    try {
      const ac=new (window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      [523,659,784].forEach((f,i)=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.value=f;
        g.gain.setValueAtTime(0,ac.currentTime+i*0.12);
        g.gain.linearRampToValueAtTime(0.25,ac.currentTime+i*0.12+0.05);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.12+0.2);
        o.start(ac.currentTime+i*0.12);o.stop(ac.currentTime+i*0.12+0.25);
      });
    } catch {}
  },[]);

  useEffect(()=>{
    if(run){ref.current=setInterval(()=>setT(v=>{if(v<=1){setRun(false);setAlarm(true);beep();return 0;}return v-1;}),1000);}
    return()=>{if(ref.current)clearInterval(ref.current);};
  },[run,beep]);

  const go=(i:number)=>{setPi(i);setT(PHASES[i].duration);setRun(false);setAlarm(false);setCtx(null);};
  const draw=()=>{
    const c=ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:ph.id==="scenes"?CONTEXTES_SCENES:[];
    if(c.length){setCtx(rand(c));setCtxKey(k=>k+1);}
  };

  const pct=t/ph.duration;

  return (
    <div className="fade-up">
      {/* Phase sub-nav */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {PHASES.map((p,i)=>(
            <PhaseTab key={p.id} p={p} color={PC[i]} active={i===pi} idx={i} onClick={()=>go(i)}/>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Timer card */}
          <Card className={`p-6 col-span-1 flex flex-col items-center justify-center ${alarm?"alarm-pulse":""}`}>
            <Badge color={pc.dark} bg={pc.light}>{ph.emoji} Phase {pi+1}/{PHASES.length}</Badge>
            <div className="my-5">
              <Ring pct={pct} color={pc.bg} size={180}>
                <span className="text-4xl font-bold" style={{color:pc.bg,fontFamily:"'Inter',sans-serif",letterSpacing:"-1px"}}>{fmt(t)}</span>
                <span className="text-xs font-medium mt-0.5" style={{color:"#94a3b8"}}>{fmt(ph.duration)}</span>
              </Ring>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-[#f1f5f9] overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct*100}%`,background:pc.bg}}/>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Btn color={pc.bg} onClick={()=>{setRun(!run);setAlarm(false);}}>
                {run?"⏸ Pause":t===0?"↺ Relancer":"▶ Démarrer"}
              </Btn>
              <Btn outline color={pc.bg} onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>↺</Btn>
              {pi<PHASES.length-1&&<Btn outline color={pc.bg} onClick={()=>go(pi+1)}>Suivant →</Btn>}
            </div>
            {alarm&&(
              <div className="mt-3 w-full text-center text-sm font-semibold py-2 rounded-xl bounce-in"
                style={{background:pc.light,color:pc.dark}}>
                🎉 Temps écoulé !
              </div>
            )}
          </Card>

          {/* Phase info */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
            <Card className="p-5 flex-1">
              <h2 className="text-xl font-bold mb-1" style={{color:"#1e1b4b"}}>{ph.emoji} {ph.subtitle}</h2>
              <p className="text-sm mb-4" style={{color:"#64748b"}}>{ph.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Coach */}
                <div className="rounded-xl p-4" style={{background:ROLE_CFG.coach.light}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{ROLE_CFG.coach.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{color:ROLE_CFG.coach.dark}}>Coach</span>
                  </div>
                  <ul className="space-y-1.5">
                    {ph.coachActions.map((a,i)=>(
                      <li key={i} className="flex items-start gap-2 text-xs" style={{color:"#374151"}}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:ROLE_CFG.coach.color}}/>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Joueur */}
                <div className="rounded-xl p-4" style={{background:ROLE_CFG.joueur.light}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{ROLE_CFG.joueur.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{color:ROLE_CFG.joueur.dark}}>Joueur</span>
                  </div>
                  <ul className="space-y-1.5">
                    {ph.playerActions.map((a,i)=>(
                      <li key={i} className="flex items-start gap-2 text-xs" style={{color:"#374151"}}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:ROLE_CFG.joueur.color}}/>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {"observerActions" in ph && (
                <div className="mt-3 rounded-xl p-4" style={{background:ROLE_CFG.observateur.light}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{ROLE_CFG.observateur.emoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{color:ROLE_CFG.observateur.dark}}>Observateur</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(ph as typeof ph&{observerActions:string[]}).observerActions.map((a,i)=>(
                      <div key={i} className="flex items-start gap-2 text-xs" style={{color:"#374151"}}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:ROLE_CFG.observateur.color}}/>
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Context + Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["solo","duos","scenes"].includes(ph.id)?(
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold" style={{color:"#1e1b4b"}}>🎲 Contexte aléatoire</span>
                    <Btn sm color={pc.bg} onClick={draw}>Tirer !</Btn>
                  </div>
                  {ctx?(
                    <div key={ctxKey} className="rounded-xl px-4 py-3 text-sm font-semibold text-center bounce-in"
                      style={{background:pc.light,color:pc.dark}}>
                      {ctx.emoji} {ctx.label}
                    </div>
                  ):(
                    <div className="rounded-xl px-4 py-3 text-xs text-center" style={{background:"#f8fafc",color:"#94a3b8"}}>
                      Appuie pour révéler un contexte surprise
                    </div>
                  )}
                </Card>
              ):<div/>}

              <Card className="p-4">
                <div className="text-sm font-semibold mb-2" style={{color:"#1e1b4b"}}>📝 Notes</div>
                <textarea
                  className="w-full text-xs rounded-xl p-3 resize-none outline-none"
                  style={{minHeight:"80px",background:"#f8fafc",border:"1.5px solid #e2e8f0",color:"#374151",fontFamily:"'Inter',sans-serif"}}
                  placeholder="Observations, feedback de phase…"
                  value={notes[`${pi}`]||""}
                  onChange={e=>setNotes(n=>({...n,[`${pi}`]:e.target.value}))}/>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FICHES
// ══════════════════════════════════════════════════════════════════════════════
function FichesTab() {
  const [view,setView]=useState<"roles"|"phases">("roles");
  const [role,setRole]=useState<Role>("coach");
  const [phase,setPhase]=useState<PhaseId>("warmup");
  const ph=PHASES.find(p=>p.id===phase)!;
  const phIdx=PHASES.findIndex(p=>p.id===phase);
  const pc=PC[phIdx];
  const cfg=ROLE_CFG[role];

  const mantras:Record<Role,string[]>={coach:MANTRAS_COACH,joueur:MANTRAS_JOUEUR,observateur:MANTRAS_OBS};
  const erreurs:Record<Role,{titre:string;fix:string}[]>={
    coach:[
      {titre:"Parler pendant la scène",fix:"Attendre le freeze ou la fin."},
      {titre:"Feedback trop long",fix:"1–2 observations max."},
      {titre:"Dépasser le temps",fix:"Couper à l'heure dite."},
      {titre:"Question rhétorique",fix:"Attendre la vraie réponse."},
      {titre:"Cibler une seule personne",fix:"Varier les passes."},
      {titre:"Corriger l'intention",fix:"Corriger la perception, pas l'intention."},
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
      {/* Toggle */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 py-2">
          {(["roles","phases"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
              style={{
                background: view===v?"#6c63ff":"transparent",
                color: view===v?"white":"#64748b",
                fontFamily:"'Inter',sans-serif",
              }}>
              {v==="roles"?"👤 Par rôle":"📋 Par exercice"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {view==="roles"&&(
          <>
            {/* Role selector */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const c=ROLE_CFG[r];
                return (
                  <button key={r} onClick={()=>setRole(r)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                    style={{
                      background: role===r?c.color:"white",
                      color: role===r?"white":c.color,
                      border:`2px solid ${role===r?c.color:c.color+"33"}`,
                      boxShadow: role===r?`0 2px 8px ${c.color}40`:"0 1px 3px rgba(0,0,0,0.06)",
                      fontFamily:"'Inter',sans-serif",
                    }}>
                    {c.emoji} {c.label}
                  </button>
                );
              })}
            </div>

            {/* Hero */}
            <Card className="p-6 mb-5 bounce-in" style={{borderLeft:`4px solid ${cfg.color}`}}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:cfg.light}}>
                  {cfg.emoji}
                </div>
                <div>
                  <Badge color={cfg.dark} bg={cfg.light}>Fiche de poste</Badge>
                  <h2 className="text-2xl font-bold mt-1" style={{color:"#1e1b4b"}}>{cfg.label}</h2>
                  <p className="text-sm" style={{color:"#64748b"}}>
                    {role==="coach"&&"Chef d'orchestre silencieux — voir, ne pas dire"}
                    {role==="joueur"&&"Incarner, montrer, ne pas expliquer"}
                    {role==="observateur"&&"Les yeux du public — le miroir précis"}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Mantras */}
              <Card className="p-5">
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#94a3b8"}}>✨ Mantras</div>
                <ul className="space-y-3">
                  {mantras[role].map((m,i)=>(
                    <li key={i} className="flex items-start gap-3 pb-3 border-b border-[#f1f5f9] last:border-0 last:pb-0">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{background:cfg.light,color:cfg.color}}>{i+1}</span>
                      <span className="text-sm italic font-medium" style={{color:"#374151"}}>« {m} »</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Pièges */}
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#94a3b8"}}>⚠️ Pièges à éviter</div>
                <div className="space-y-2">
                  {erreurs[role].map((e,i)=>(
                    <Card key={i} className="p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-base flex-shrink-0">❌</span>
                        <div>
                          <div className="text-sm font-semibold" style={{color:"#1e1b4b"}}>{e.titre}</div>
                          <div className="text-xs mt-0.5" style={{color:"#64748b"}}>✅ {e.fix}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {view==="phases"&&(
          <>
            {/* Phase pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5" style={{scrollbarWidth:"none"}}>
              {PHASES.map((p,i)=>(
                <button key={p.id} onClick={()=>setPhase(p.id as PhaseId)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                  style={{
                    background: p.id===phase?PC[i].bg:"white",
                    color: p.id===phase?"white":PC[i].bg,
                    border:`2px solid ${p.id===phase?PC[i].bg:PC[i].bg+"33"}`,
                    boxShadow: p.id===phase?`0 2px 8px ${PC[i].bg}40`:"0 1px 3px rgba(0,0,0,0.06)",
                    fontFamily:"'Inter',sans-serif",
                  }}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>

            <Card className="p-5 mb-5 bounce-in" style={{borderLeft:`4px solid ${pc.bg}`}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:pc.light}}>{ph.emoji}</div>
                <div>
                  <Badge color={pc.dark} bg={pc.light}>Phase {phIdx+1}/{PHASES.length} · {fmt(ph.duration)}</Badge>
                  <h2 className="text-xl font-bold mt-1" style={{color:"#1e1b4b"}}>{ph.subtitle}</h2>
                  <p className="text-sm" style={{color:"#64748b"}}>{ph.description}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const rc=ROLE_CFG[r];
                const actions=r==="coach"?ph.coachActions:r==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
                if(!actions.length)return null;
                return (
                  <Card key={r} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                        style={{background:rc.light}}>{rc.emoji}</div>
                      <span className="text-sm font-semibold" style={{color:rc.color}}>{rc.label}</span>
                    </div>
                    <ul className="space-y-2">
                      {actions.map((a,i)=>(
                        <li key={i} className="flex items-start gap-2 text-xs" style={{color:"#374151"}}>
                          <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:rc.color}}/>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>

            {["solo","duos","scenes"].includes(ph.id)&&(
              <Card className="p-4">
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:"#94a3b8"}}>🎭 Contextes disponibles</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:CONTEXTES_SCENES).map((c,i)=>(
                    <div key={i} className="rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-2"
                      style={{background:pc.light,color:pc.dark}}>
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
// PARTICIPANTS
// ══════════════════════════════════════════════════════════════════════════════
function ParticipantsTab() {
  const [parts,setParts]=useState<Participant[]>([
    {id:"1",name:"Alice",role:"joueur",passages:0},
    {id:"2",name:"Bruno",role:"coach",passages:0},
    {id:"3",name:"Chloé",role:"observateur",passages:0},
  ]);
  const [name,setName]=useState("");

  const add=()=>{if(!name.trim())return;setParts(p=>[...p,{id:Date.now()+"",name:name.trim(),role:"joueur",passages:0}]);setName("");};
  const setRole=(id:string,r:Role)=>setParts(p=>p.map(x=>x.id===id?{...x,role:r}:x));
  const inc=(id:string)=>setParts(p=>p.map(x=>x.id===id?{...x,passages:x.passages+1}:x));
  const rem=(id:string)=>setParts(p=>p.filter(x=>x.id!==id));
  const total=parts.reduce((s,p)=>s+p.passages,0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 fade-up">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {l:"Participants",v:parts.length,c:"#22c55e",bg:"#dcfce7"},
          {l:"Passages total",v:total,c:"#3b82f6",bg:"#dbeafe"},
          {l:"Moy./joueur",v:parts.length?(total/parts.length).toFixed(1):0,c:"#9333ea",bg:"#f3e8ff"},
        ].map(s=>(
          <Card key={s.l} className="p-4 text-center">
            <div className="text-4xl font-bold mb-1" style={{color:s.c}}>{s.v}</div>
            <Badge color={s.c} bg={s.bg}>{s.l}</Badge>
          </Card>
        ))}
      </div>

      {/* Add */}
      <Card className="p-4 mb-4">
        <div className="text-sm font-semibold mb-3" style={{color:"#64748b"}}>Ajouter un participant</div>
        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",color:"#1e1b4b",fontFamily:"'Inter',sans-serif"}}
            placeholder="Prénom…" value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <Btn color="#6c63ff" onClick={add}>＋ Ajouter</Btn>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-2 mb-5">
        {parts.map(p=>{
          const cfg=ROLE_CFG[p.role];
          return (
            <Card key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{background:cfg.light,color:cfg.color}}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.name}</div>
                <Badge color={cfg.color} bg={cfg.light}>{cfg.label} · {p.passages} passage{p.passages>1?"s":""}</Badge>
              </div>
              {/* Role switcher */}
              <div className="flex gap-1">
                {(["coach","joueur","observateur"] as Role[]).map(r=>{
                  const rc=ROLE_CFG[r];
                  return (
                    <button key={r} onClick={()=>setRole(p.id,r)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110"
                      style={{
                        background: p.role===r?rc.light:"transparent",
                        border:`1.5px solid ${p.role===r?rc.color:"#e2e8f0"}`,
                      }}
                      title={rc.label}>{rc.emoji}</button>
                  );
                })}
              </div>
              <Btn sm color="#6c63ff" onClick={()=>inc(p.id)}>+1</Btn>
              <button onClick={()=>rem(p.id)} className="text-xl leading-none cursor-pointer text-[#cbd5e1] hover:text-[#ef4444] transition-colors">×</button>
            </Card>
          );
        })}
      </div>

      {/* Progress bars */}
      {parts.length>0&&(
        <Card className="p-5">
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#94a3b8"}}>📊 Équilibre des passages</div>
          <div className="space-y-3">
            {parts.map(p=>{
              const max=Math.max(...parts.map(x=>x.passages),1);
              const cfg=ROLE_CFG[p.role];
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium truncate" style={{color:"#374151"}}>{p.name}</div>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-[#f1f5f9]">
                    <div className="h-full rounded-full transition-all duration-700" style={{width:`${(p.passages/max)*100}%`,background:cfg.color}}/>
                  </div>
                  <div className="w-6 text-right text-sm font-bold" style={{color:cfg.color}}>{p.passages}</div>
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
// PROJECTOR
// ══════════════════════════════════════════════════════════════════════════════
function ProjectorTab({onBack}:{onBack:()=>void}) {
  const [pi,setPi]=useState(0);
  const [t,setT]=useState(PHASES[0].duration);
  const [run,setRun]=useState(false);
  const [alarm,setAlarm]=useState(false);
  const [ctx,setCtx]=useState<{emoji:string;label:string}|null>(null);
  const [ctxKey,setCtxKey]=useState(0);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const ph=PHASES[pi]; const pc=PC[pi];

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
    <div className="min-h-screen flex flex-col" style={{background:"#f4f6fb"}}>
      {/* Top bar */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center justify-between">
        <button onClick={onBack}
          className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
          style={{background:"#f1f5f9",color:"#64748b"}}>← Retour</button>
        <div className="flex gap-2 overflow-x-auto" style={{scrollbarWidth:"none"}}>
          {PHASES.map((p,i)=>(
            <button key={p.id} onClick={()=>go(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: i===pi?PC[i].bg:"white",
                color: i===pi?"white":PC[i].bg,
                border:`2px solid ${i===pi?PC[i].bg:PC[i].bg+"33"}`,
              }}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main projector */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Badge color={pc.dark} bg={pc.light}>Phase {pi+1}/{PHASES.length}</Badge>
        <div className="my-8">
          <Ring pct={t/ph.duration} color={pc.bg} size={300}>
            <span className="text-7xl font-bold" style={{color:pc.bg,fontFamily:"'Inter',sans-serif",letterSpacing:"-2px"}}>{fmt(t)}</span>
          </Ring>
        </div>

        <h1 className="text-5xl font-bold text-center mb-2" style={{color:"#1e1b4b"}}>{ph.emoji} {ph.subtitle}</h1>
        <p className="text-xl text-center mb-8" style={{color:"#64748b"}}>{ph.description}</p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Btn color={pc.bg} onClick={()=>{setRun(!run);setAlarm(false);}}>
            {run?"⏸ Pause":"▶ Démarrer"}
          </Btn>
          <Btn outline color={pc.bg} onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>↺ Reset</Btn>
          {["solo","duos","scenes"].includes(ph.id)&&<Btn outline color={pc.bg} onClick={draw}>🎲 Contexte</Btn>}
        </div>

        {ctx&&(
          <div key={ctxKey} className="mt-8 px-10 py-5 rounded-2xl text-2xl font-bold text-center bounce-in"
            style={{background:pc.light,color:pc.dark,border:`2px solid ${pc.bg}33`}}>
            {ctx.emoji} {ctx.label}
          </div>
        )}
        {alarm&&<div className="mt-6 text-2xl font-bold bounce-in" style={{color:pc.bg}}>🎉 Temps écoulé !</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function ImproApp() {
  const [tab,setTab]=useState<Tab>("session");

  if(tab==="projector") return <ProjectorTab onBack={()=>setTab("session")}/>;

  const TABS=[
    {id:"session" as Tab, icon:"⏱", label:"Séance"},
    {id:"fiches"  as Tab, icon:"📋", label:"Fiches"},
    {id:"participants" as Tab, icon:"👥", label:"Équipe"},
    {id:"projector" as Tab, icon:"📽", label:"Projecteur"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f4f6fb"}}>
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-40"
        style={{boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                style={{background:"linear-gradient(135deg,#6c63ff,#9333ea)"}}>🎭</div>
              <span className="font-bold text-base" style={{color:"#1e1b4b",fontFamily:"'Inter',sans-serif"}}>
                Qui · Quoi · Où
              </span>
            </div>

            {/* Nav tabs */}
            <nav className="flex flex-1 overflow-x-auto h-full" style={{scrollbarWidth:"none"}}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className="flex items-center gap-2 px-4 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap h-full border-b-2 flex-shrink-0"
                  style={{
                    color: tab===t.id?"#6c63ff":"#64748b",
                    borderColor: tab===t.id?"#6c63ff":"transparent",
                    background:"transparent",
                    fontFamily:"'Inter',sans-serif",
                  }}>
                  <span>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Badge color="#6c63ff" bg="#ede9ff">1h · 10 joueurs</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {tab==="session"&&<SessionTab/>}
      {tab==="fiches"&&<FichesTab/>}
      {tab==="participants"&&<ParticipantsTab/>}
    </div>
  );
}
