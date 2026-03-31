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

// ── Phase colors matching the screenshot ──────────────────────────────────
const PC = ["#00ff88","#1cb0f6","#9b59b6","#ff4b4b","#ff9600","#00d4ff"];
const PC_DARK = ["#004422","#003850","#2d1050","#500000","#502800","#003040"];

const ROLE_CFG = {
  coach:       { color:"#ff4b4b", bg:"#1f0a0a", border:"#ff4b4b44", emoji:"🧑‍💼", label:"Coach Instructions" },
  joueur:      { color:"#1cb0f6", bg:"#0a1f30", border:"#1cb0f644", emoji:"🎭", label:"Player Goals" },
  observateur: { color:"#ce82ff", bg:"#1a0a2a", border:"#ce82ff44", emoji:"👁",  label:"Observer Notes" },
};

function fmt(s:number){ return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function rand<T>(a:T[]):T{ return a[Math.floor(Math.random()*a.length)]; }

// ── Neon Ring ──────────────────────────────────────────────────────────────
function NeonRing({ pct, color, size=220, children }: { pct:number; color:string; size?:number; children?:React.ReactNode }) {
  const r = size * 0.42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ffffff0a" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={c}
          strokeDashoffset={c*(1-Math.max(0,Math.min(1,pct)))}
          style={{ transition:"stroke-dashoffset 1s linear", filter:`drop-shadow(0 0 8px ${color}) drop-shadow(0 0 20px ${color}88)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ── Chevron Phase Bar ──────────────────────────────────────────────────────
function PhaseBar({ active, onSelect }: { active:number; onSelect:(i:number)=>void }) {
  return (
    <div className="flex w-full overflow-x-auto" style={{ scrollbarWidth:"none", gap:0 }}>
      {PHASES.map((p, i) => {
        const isActive = i === active;
        const color = PC[i];
        return (
          <button key={p.id} onClick={() => onSelect(i)}
            className="relative flex-1 min-w-[80px] flex items-center justify-center py-2.5 px-2 text-xs font-extrabold transition-all cursor-pointer"
            style={{
              fontFamily:"'Nunito',sans-serif",
              background: isActive ? color : "#1c2128",
              color: isActive ? "#000" : color,
              clipPath: i===0
                ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                : i===PHASES.length-1
                ? "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)"
                : "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)",
              textShadow: isActive ? "none" : `0 0 8px ${color}`,
              border: "none",
              outline: "none",
            }}>
            <span className="truncate">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Neon Card ──────────────────────────────────────────────────────────────
function NeonCard({ children, color, className="" }: { children:React.ReactNode; color:string; className?:string }) {
  return (
    <div className={`rounded-xl p-4 ${className}`}
      style={{
        background:"#1c2128",
        border:`1.5px solid ${color}`,
        boxShadow:`0 0 12px ${color}33, inset 0 0 12px ${color}08`,
      }}>
      {children}
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
    <div className="flex flex-col" style={{ minHeight:"calc(100vh - 100px)" }}>
      {/* Chevron bar */}
      <div style={{ background:"#161b22", borderBottom:"1px solid #30363d" }}>
        <PhaseBar active={pi} onSelect={go}/>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full fade-up">
        {/* Timer centered */}
        <div className={`flex flex-col items-center mb-6 ${alarm?"alarm-pulse":""}`}>
          <NeonRing pct={t/ph.duration} color={color} size={220}>
            <span className="font-black text-5xl" style={{
              fontFamily:"'Share Tech Mono','Nunito',sans-serif",
              color, textShadow:`0 0 20px ${color}, 0 0 40px ${color}88`
            }}>{fmt(t)}</span>
            <span className="text-xs font-bold mt-1" style={{color:"#7d8590"}}>{fmt(ph.duration)}</span>
          </NeonRing>

          <h2 className="text-3xl font-black mt-4 mb-2 text-center"
            style={{ color, textShadow:`0 0 12px ${color}88`, fontFamily:"'Nunito',sans-serif" }}>
            {ph.emoji} {ph.subtitle}
          </h2>
          <p className="text-sm text-center" style={{ color:"#7d8590" }}>{ph.description}</p>

          {/* Controls */}
          <div className="flex gap-3 mt-4 flex-wrap justify-center">
            {[
              { label: run?"⏸ Pause":t===0?"↺ Relancer":"▶ Start", action: ()=>{setRun(!run);setAlarm(false);}, primary:true },
              { label:"↺", action:()=>{setT(ph.duration);setRun(false);setAlarm(false);}, primary:false },
              ...(pi<PHASES.length-1 ? [{ label:"Next →", action:()=>go(pi+1), primary:false }] : []),
              ...( ["solo","duos","scenes"].includes(ph.id) ? [{ label:"🎲 Context", action:draw, primary:false }] : [] ),
            ].map((b,i) => (
              <button key={i} onClick={b.action}
                className="px-5 py-2 rounded-lg font-extrabold text-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  fontFamily:"'Nunito',sans-serif",
                  background: b.primary ? color : "transparent",
                  color: b.primary ? "#000" : color,
                  border: `2px solid ${color}`,
                  boxShadow: b.primary ? `0 0 12px ${color}88` : "none",
                  textShadow: b.primary ? "none" : `0 0 8px ${color}`,
                }}>
                {b.label}
              </button>
            ))}
          </div>

          {alarm && (
            <div className="mt-4 px-6 py-3 rounded-xl font-extrabold text-sm bounce-in"
              style={{ background:`${color}22`, border:`1.5px solid ${color}`, color, textShadow:`0 0 8px ${color}` }}>
              ⏰ Temps écoulé — phase suivante !
            </div>
          )}
        </div>

        {/* Context drawn */}
        {ctx && (
          <div key={ctxKey} className="mb-5 bounce-in">
            <NeonCard color={color} className="text-center py-3">
              <span className="text-xl font-extrabold" style={{ color, textShadow:`0 0 8px ${color}` }}>
                {ctx.emoji} {ctx.label}
              </span>
            </NeonCard>
          </div>
        )}

        {/* 3 cards: Coach | Player | Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coach */}
          <NeonCard color={ROLE_CFG.coach.color}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{ROLE_CFG.coach.emoji}</span>
              <span className="font-extrabold text-sm" style={{ color:ROLE_CFG.coach.color, textShadow:`0 0 8px ${ROLE_CFG.coach.color}` }}>
                Coach Instructions
              </span>
            </div>
            <ul className="space-y-1.5">
              {ph.coachActions.map((a,i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-semibold" style={{color:"#c9d1d9"}}>
                  <span style={{color:ROLE_CFG.coach.color, flexShrink:0}}>•</span>{a}
                </li>
              ))}
            </ul>
          </NeonCard>

          {/* Player */}
          <NeonCard color={ROLE_CFG.joueur.color}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{ROLE_CFG.joueur.emoji}</span>
              <span className="font-extrabold text-sm" style={{ color:ROLE_CFG.joueur.color, textShadow:`0 0 8px ${ROLE_CFG.joueur.color}` }}>
                Player Goals
              </span>
            </div>
            <ul className="space-y-1.5">
              {ph.playerActions.map((a,i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-semibold" style={{color:"#c9d1d9"}}>
                  <span style={{color:ROLE_CFG.joueur.color, flexShrink:0}}>•</span>{a}
                </li>
              ))}
            </ul>
          </NeonCard>

          {/* Notes */}
          <NeonCard color="#30363d">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✏️</span>
              <span className="font-extrabold text-sm" style={{ color:"#e6edf3" }}>Session Notes</span>
            </div>
            <textarea
              className="w-full text-xs font-semibold rounded-lg p-2 resize-none outline-none"
              style={{
                minHeight:"100px", background:"#0d1117",
                border:"1px solid #30363d", color:"#c9d1d9",
                fontFamily:"'Nunito',sans-serif",
              }}
              placeholder="Observations, feedback…"
              value={notes[`${pi}`]||""}
              onChange={e=>setNotes(n=>({...n,[`${pi}`]:e.target.value}))}/>
          </NeonCard>
        </div>

        {/* Observer card if applicable */}
        {"observerActions" in ph && (
          <div className="mt-4">
            <NeonCard color={ROLE_CFG.observateur.color}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{ROLE_CFG.observateur.emoji}</span>
                <span className="font-extrabold text-sm" style={{ color:ROLE_CFG.observateur.color, textShadow:`0 0 8px ${ROLE_CFG.observateur.color}` }}>
                  Observer Notes
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(ph as typeof ph & {observerActions:string[]}).observerActions.map((a,i)=>(
                  <div key={i} className="flex items-start gap-2 text-xs font-semibold" style={{color:"#c9d1d9"}}>
                    <span style={{color:ROLE_CFG.observateur.color,flexShrink:0}}>•</span>{a}
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
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
  const cfg = ROLE_CFG[role];

  const mantras:Record<Role,string[]> = { coach:MANTRAS_COACH, joueur:MANTRAS_JOUEUR, observateur:MANTRAS_OBS };
  const erreurs:Record<Role,{titre:string;fix:string}[]> = {
    coach:[
      {titre:"Parler pendant la scène",fix:"Attendre le freeze ou la fin."},
      {titre:"Feedback trop long",fix:"1–2 observations max."},
      {titre:"Dépasser le temps",fix:"Couper à l'heure dite."},
      {titre:"Question rhétorique",fix:"Attendre la réponse vraie."},
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
      {/* Sub-nav */}
      <div style={{ background:"#161b22", borderBottom:"1px solid #30363d" }}>
        <div className="flex max-w-4xl mx-auto px-4">
          {(["roles","phases"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className="px-5 py-3 text-xs font-extrabold transition-all cursor-pointer border-b-2"
              style={{
                fontFamily:"'Nunito',sans-serif",
                color: view===v?"#00ff88":"#7d8590",
                borderColor: view===v?"#00ff88":"transparent",
                textShadow: view===v?"0 0 8px #00ff88":"none",
                background:"transparent",
              }}>
              {v==="roles"?"👤 Par rôle":"📋 Par exercice"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto w-full">
        {view==="roles" && (
          <>
            {/* Role tabs */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const c=ROLE_CFG[r];
                return (
                  <button key={r} onClick={()=>setRole(r)}
                    className="px-5 py-2 rounded-lg font-extrabold text-sm cursor-pointer transition-all hover:scale-105"
                    style={{
                      fontFamily:"'Nunito',sans-serif",
                      background: role===r ? `${c.color}22` : "transparent",
                      color: c.color,
                      border: `2px solid ${role===r?c.color:c.color+"44"}`,
                      textShadow: role===r?`0 0 8px ${c.color}`:"none",
                      boxShadow: role===r?`0 0 12px ${c.color}44`:"none",
                    }}>
                    {c.emoji} {c.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            {/* Hero */}
            <NeonCard color={cfg.color} className="mb-5 bounce-in">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{cfg.emoji}</div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{color:"#7d8590"}}>Fiche de poste</div>
                  <h2 className="text-2xl font-black" style={{color:cfg.color,textShadow:`0 0 12px ${cfg.color}`,fontFamily:"'Nunito',sans-serif"}}>
                    {cfg.label}
                  </h2>
                  <p className="text-xs font-semibold italic mt-1" style={{color:"#7d8590"}}>
                    {role==="coach"&&"Chef d'orchestre silencieux 🧭"}
                    {role==="joueur"&&"Montrer, ne pas dire 🎭"}
                    {role==="observateur"&&"Les yeux du public 👁"}
                  </p>
                </div>
              </div>
            </NeonCard>

            {/* Mantras */}
            <NeonCard color={cfg.color} className="mb-5">
              <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#7d8590"}}>✨ Mantras</div>
              <ul className="space-y-2">
                {mantras[role].map((m,i)=>(
                  <li key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{borderColor:"#30363d"}}>
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{background:`${cfg.color}22`,color:cfg.color}}>{i+1}</span>
                    <span className="text-sm font-bold italic" style={{color:"#e6edf3"}}>« {m} »</span>
                  </li>
                ))}
              </ul>
            </NeonCard>

            {/* Pièges */}
            <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#7d8590"}}>⚠️ Pièges à éviter</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {erreurs[role].map((e,i)=>(
                <NeonCard key={i} color="#ff4b4b44">
                  <div className="text-sm font-extrabold mb-1" style={{color:"#ff6b6b"}}>❌ {e.titre}</div>
                  <div className="text-xs font-semibold" style={{color:"#c9d1d9"}}>✅ {e.fix}</div>
                </NeonCard>
              ))}
            </div>
          </>
        )}

        {view==="phases" && (
          <>
            <div style={{background:"#161b22",borderBottom:"1px solid #30363d",margin:"0 -1rem 1.5rem",padding:"0.5rem 1rem"}}>
              <PhaseBar active={phIdx} onSelect={(i)=>setPhase(PHASES[i].id as PhaseId)}/>
            </div>

            <NeonCard color={color} className="mb-5 bounce-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{ph.emoji}</div>
                <div>
                  <div className="text-xs font-extrabold" style={{color:"#7d8590"}}>{phIdx+1}/{PHASES.length} · {fmt(ph.duration)}</div>
                  <h2 className="text-xl font-black" style={{color,textShadow:`0 0 12px ${color}`,fontFamily:"'Nunito',sans-serif"}}>{ph.subtitle}</h2>
                </div>
              </div>
              <p className="text-sm font-semibold" style={{color:"#7d8590"}}>{ph.description}</p>
            </NeonCard>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {(["coach","joueur","observateur"] as Role[]).map(r=>{
                const rc=ROLE_CFG[r];
                const actions=r==="coach"?ph.coachActions:r==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
                if(!actions.length)return null;
                return (
                  <NeonCard key={r} color={rc.color}>
                    <div className="flex items-center gap-2 mb-3">
                      <span>{rc.emoji}</span>
                      <span className="text-xs font-extrabold" style={{color:rc.color,textShadow:`0 0 6px ${rc.color}`}}>{rc.label}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {actions.map((a,i)=>(
                        <li key={i} className="flex items-start gap-1.5 text-xs font-semibold" style={{color:"#c9d1d9"}}>
                          <span style={{color:rc.color,flexShrink:0}}>•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </NeonCard>
                );
              })}
            </div>

            {["solo","duos","scenes"].includes(ph.id)&&(
              <NeonCard color={color}>
                <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#7d8590"}}>🎭 Contextes</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:CONTEXTES_SCENES).map((c,i)=>(
                    <div key={i} className="rounded-lg px-3 py-2 text-xs font-bold"
                      style={{background:`${color}11`,color:"#e6edf3",border:`1px solid ${color}33`}}>
                      {c.emoji} {c.label}
                    </div>
                  ))}
                </div>
              </NeonCard>
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
  const setRole=(id:string,r:Role)=>setParts(p=>p.map(x=>x.id===id?{...x,role:r}:x));
  const inc=(id:string)=>setParts(p=>p.map(x=>x.id===id?{...x,passages:x.passages+1}:x));
  const rem=(id:string)=>setParts(p=>p.filter(x=>x.id!==id));
  const total=parts.reduce((s,p)=>s+p.passages,0);

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto w-full fade-up">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {l:"Participants",v:parts.length,c:"#00ff88"},
          {l:"Passages total",v:total,c:"#1cb0f6"},
          {l:"Moy./joueur",v:parts.length?(total/parts.length).toFixed(1):0,c:"#ce82ff"},
        ].map(s=>(
          <NeonCard key={s.l} color={s.c} className="text-center py-3">
            <div className="text-4xl font-black" style={{fontFamily:"'Nunito',sans-serif",color:s.c,textShadow:`0 0 12px ${s.c}`}}>{s.v}</div>
            <div className="text-xs font-extrabold uppercase tracking-widest mt-1" style={{color:"#7d8590"}}>{s.l}</div>
          </NeonCard>
        ))}
      </div>

      {/* Add */}
      <NeonCard color="#00ff88" className="mb-4">
        <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#7d8590"}}>➕ Ajouter un participant</div>
        <div className="flex gap-3">
          <input className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold outline-none"
            style={{background:"#0d1117",border:"1.5px solid #30363d",color:"#e6edf3",fontFamily:"'Nunito',sans-serif"}}
            placeholder="Prénom…" value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <button onClick={add}
            className="px-5 py-2 rounded-lg font-extrabold text-sm cursor-pointer hover:scale-105 transition-all"
            style={{background:"#00ff88",color:"#000",boxShadow:"0 0 12px #00ff8888",fontFamily:"'Nunito',sans-serif"}}>
            ＋ Add
          </button>
        </div>
      </NeonCard>

      {/* List */}
      <div className="space-y-2 mb-5">
        {parts.map(p=>{
          const cfg=ROLE_CFG[p.role];
          return (
            <NeonCard key={p.id} color={cfg.color} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{background:`${cfg.color}22`,color:cfg.color,border:`1.5px solid ${cfg.color}`,textShadow:`0 0 6px ${cfg.color}`}}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm" style={{color:"#e6edf3"}}>{p.name}</div>
                <div className="text-xs font-semibold" style={{color:"#7d8590"}}>{p.passages} passage{p.passages>1?"s":""}</div>
              </div>
              <div className="flex gap-1">
                {(["coach","joueur","observateur"] as Role[]).map(r=>{
                  const rc=ROLE_CFG[r];
                  return (
                    <button key={r} onClick={()=>setRole(p.id,r)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110"
                      style={{
                        background: p.role===r?`${rc.color}22`:"transparent",
                        border: `1.5px solid ${p.role===r?rc.color:"#30363d"}`,
                        boxShadow: p.role===r?`0 0 8px ${rc.color}66`:"none",
                      }}
                      title={rc.label}>
                      {rc.emoji}
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>inc(p.id)}
                className="px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer hover:scale-105 transition-all"
                style={{background:"#00ff8822",color:"#00ff88",border:"1.5px solid #00ff88",boxShadow:"0 0 8px #00ff8844",fontFamily:"'Nunito',sans-serif"}}>
                +1
              </button>
              <button onClick={()=>rem(p.id)} className="text-xl leading-none cursor-pointer hover:scale-125 transition-transform" style={{color:"#30363d"}}>×</button>
            </NeonCard>
          );
        })}
      </div>

      {/* Heatmap */}
      {parts.length>0&&(
        <NeonCard color="#30363d">
          <div className="font-extrabold text-xs uppercase tracking-widest mb-4" style={{color:"#7d8590"}}>📊 Équilibre des passages</div>
          <div className="space-y-3">
            {parts.map(p=>{
              const max=Math.max(...parts.map(x=>x.passages),1);
              const cfg=ROLE_CFG[p.role];
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-20 text-xs font-bold truncate" style={{color:"#c9d1d9"}}>{p.name}</div>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{background:"#0d1117"}}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:`${(p.passages/max)*100}%`,
                        background:cfg.color,
                        boxShadow:`0 0 8px ${cfg.color}`,
                      }}/>
                  </div>
                  <div className="w-6 text-right text-xs font-black" style={{color:cfg.color}}>{p.passages}</div>
                </div>
              );
            })}
          </div>
        </NeonCard>
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
  const ph=PHASES[pi]; const color=PC[pi];

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 relative ${alarm?"alarm-pulse":""}`}
      style={{background:"#0d1117"}}>
      <button onClick={onBack}
        className="fixed top-4 left-4 z-50 px-4 py-2 rounded-lg text-xs font-extrabold cursor-pointer"
        style={{background:"#1c2128",border:"1px solid #30363d",color:"#7d8590",fontFamily:"'Nunito',sans-serif"}}>
        ← Retour
      </button>

      <div style={{background:"#161b22",borderBottom:"1px solid #30363d",position:"fixed",top:0,left:0,right:0,zIndex:30}}>
        <PhaseBar active={pi} onSelect={go}/>
      </div>

      <div className="mt-12">
        <NeonRing pct={t/ph.duration} color={color} size={300}>
          <span className="font-black" style={{
            fontSize:"5rem",
            fontFamily:"'Share Tech Mono','Nunito',sans-serif",
            color, textShadow:`0 0 30px ${color}, 0 0 60px ${color}88`,
          }}>{fmt(t)}</span>
        </NeonRing>
      </div>

      <h1 className="text-5xl font-black text-center mt-6 mb-2"
        style={{color,textShadow:`0 0 20px ${color}`,fontFamily:"'Nunito',sans-serif"}}>
        {ph.emoji} {ph.subtitle}
      </h1>
      <p className="text-lg text-center mb-8" style={{color:"#7d8590"}}>{ph.description}</p>

      <div className="flex gap-4 flex-wrap justify-center">
        {[
          {l:run?"⏸ Pause":"▶ Start",a:()=>{setRun(!run);setAlarm(false);},primary:true},
          {l:"↺",a:()=>{setT(ph.duration);setRun(false);setAlarm(false);},primary:false},
          ...( ["solo","duos","scenes"].includes(ph.id)?[{l:"🎲 Context",a:draw,primary:false}]:[] ),
        ].map((b,i)=>(
          <button key={i} onClick={b.a}
            className="px-8 py-3 rounded-xl font-extrabold text-lg cursor-pointer hover:scale-105 transition-all"
            style={{
              fontFamily:"'Nunito',sans-serif",
              background: b.primary?color:"transparent",
              color: b.primary?"#000":color,
              border:`2px solid ${color}`,
              boxShadow: b.primary?`0 0 20px ${color}88`:"none",
              textShadow: b.primary?"none":`0 0 8px ${color}`,
            }}>
            {b.l}
          </button>
        ))}
      </div>

      {ctx&&(
        <div key={ctxKey} className="mt-8 px-10 py-5 rounded-2xl font-black text-3xl bounce-in"
          style={{background:`${color}22`,border:`2px solid ${color}`,color,textShadow:`0 0 12px ${color}`,boxShadow:`0 0 30px ${color}44`,fontFamily:"'Nunito',sans-serif"}}>
          {ctx.emoji} {ctx.label}
        </div>
      )}

      {alarm&&(
        <div className="mt-6 text-3xl font-black bounce-in" style={{color,textShadow:`0 0 20px ${color}`,fontFamily:"'Nunito',sans-serif"}}>
          ⏰ Temps écoulé !
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function ImproApp() {
  const [tab, setTab] = useState<Tab>("session");

  if (tab==="projector") return <ProjectorTab onBack={()=>setTab("session")}/>;

  const TABS = [
    {id:"session" as Tab, icon:"⏱", label:"Session"},
    {id:"fiches" as Tab,  icon:"📋", label:"Cards"},
    {id:"participants" as Tab, icon:"👥", label:"Participants"},
    {id:"projector" as Tab, icon:"📽", label:"Projector"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0d1117"}}>
      {/* Header with tabs — exactly like the screenshot */}
      <header style={{background:"#161b22",borderBottom:"1px solid #30363d",position:"sticky",top:0,zIndex:40}}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 py-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{background:"#00ff8822",border:"1.5px solid #00ff88"}}>
                🎭
              </div>
              <span className="font-black text-sm" style={{color:"#00ff88",textShadow:"0 0 8px #00ff88",fontFamily:"'Nunito',sans-serif"}}>
                Qui·Quoi·Où
              </span>
            </div>

            {/* Tabs */}
            <nav className="flex flex-1 overflow-x-auto" style={{scrollbarWidth:"none"}}>
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap border-b-2 flex-shrink-0"
                  style={{
                    fontFamily:"'Nunito',sans-serif",
                    color: tab===t.id?"#00ff88":"#7d8590",
                    borderColor: tab===t.id?"#00ff88":"transparent",
                    textShadow: tab===t.id?"0 0 8px #00ff88":"none",
                    background:"transparent",
                  }}>
                  <span>{t.icon}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </nav>

            <div className="text-xs font-bold flex-shrink-0 hidden md:block" style={{color:"#30363d"}}>
              1h · 10p
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
