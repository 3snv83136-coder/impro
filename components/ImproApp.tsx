"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { PHASES, CONTEXTES_SOLO, CONTEXTES_DUOS, CONTEXTES_SCENES, MANTRAS_JOUEUR, MANTRAS_COACH, MANTRAS_OBS } from "@/lib/data";

type Tab = "session"|"fiches"|"participants"|"projector";
type Role = "coach"|"joueur"|"observateur";
type PhaseId = "warmup"|"theory"|"solo"|"duos"|"scenes"|"debrief";
type Participant = { id:string; name:string; role:Role; passages:number };

const ROLE_CFG = {
  coach:       { color:"#ff9600", bg:"#fff8ed", border:"#ffd580", emoji:"🎙", label:"Coach" },
  joueur:      { color:"#1cb0f6", bg:"#e8f7fe", border:"#9adff8", emoji:"🎭", label:"Joueur" },
  observateur: { color:"#ce82ff", bg:"#f7eeff", border:"#e0bcff", emoji:"👁",  label:"Observateur" },
};

const PHASE_COLORS = ["#58cc02","#1cb0f6","#ff9600","#ff4b4b","#ce82ff","#ffc800"];

function fmt(s:number){ return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
function rand<T>(a:T[]):T{ return a[Math.floor(Math.random()*a.length)]; }

// ── Duo Button ──────────────────────────────────────────────────────────────
function DBtn({
  children, onClick, color="#58cc02", textColor="#fff",
  size="md", fullWidth, disabled, variant="solid"
}:{
  children:React.ReactNode; onClick?:()=>void;
  color?:string; textColor?:string;
  size?:"sm"|"md"|"lg"; fullWidth?:boolean;
  disabled?:boolean; variant?:"solid"|"outline"|"ghost";
}){
  const shadow = variant==="solid" ? `0 4px 0 ${darken(color)}` : "none";
  const pad = size==="sm"?"8px 16px":size==="lg"?"16px 32px":"12px 24px";
  const fs = size==="sm"?"0.8rem":size==="lg"?"1.1rem":"0.9rem";
  return (
    <button onClick={onClick} disabled={disabled}
      className="btn-press rounded-2xl font-extrabold transition-all cursor-pointer select-none disabled:opacity-50"
      style={{
        background: variant==="solid"?color:variant==="outline"?"transparent":color+"15",
        color: variant==="solid"?textColor:color,
        border: variant==="outline"?`2.5px solid ${color}`:"2.5px solid transparent",
        boxShadow: disabled?"none":shadow,
        padding: pad, fontSize: fs,
        width: fullWidth?"100%":"auto",
        fontFamily:"'Nunito',sans-serif",
        letterSpacing:"0.02em",
      }}>
      {children}
    </button>
  );
}

function darken(hex:string):string{
  const n=parseInt(hex.slice(1),16);
  const r=Math.max(0,(n>>16)-40), g=Math.max(0,((n>>8)&0xff)-40), b=Math.max(0,(n&0xff)-40);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

// ── Card ────────────────────────────────────────────────────────────────────
function Card({children,accent,className="",onClick}:{children:React.ReactNode;accent?:string;className?:string;onClick?:()=>void}){
  return (
    <div onClick={onClick}
      className={`rounded-3xl border-2 bg-white transition-all ${onClick?"cursor-pointer hover:scale-[1.02]":""} ${className}`}
      style={{ borderColor: accent||"#e5e5e5", boxShadow: accent?`0 4px 0 ${darken(accent||"#e5e5e5")}`:"0 4px 0 #e5e5e5" }}>
      {children}
    </div>
  );
}

// ── XP Bar ──────────────────────────────────────────────────────────────────
function XPBar({pct,color}:{pct:number;color:string}){
  return (
    <div className="w-full h-4 rounded-full overflow-hidden" style={{ background:"#e5e5e5" }}>
      <div className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
        style={{ width:`${Math.max(2,pct*100)}%`, background:color }}>
        <div className="absolute inset-0 opacity-30" style={{ background:"linear-gradient(90deg,transparent,white,transparent)", animation:"shimmer 2s infinite" }}/>
      </div>
    </div>
  );
}

// ── Ring ────────────────────────────────────────────────────────────────────
function Ring({pct,color,size=160,children}:{pct:number;color:string;size?:number;children?:React.ReactNode}){
  const r=size*0.38; const c=2*Math.PI*r;
  return (
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e5e5" strokeWidth="12"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-Math.max(0,Math.min(1,pct)))}
          style={{transition:"stroke-dashoffset 1s linear"}}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ══════════ SESSION ══════════════════════════════════════════════════════════
function SessionTab(){
  const [pi,setPi]=useState(0);
  const [t,setT]=useState(PHASES[0].duration);
  const [run,setRun]=useState(false);
  const [alarm,setAlarm]=useState(false);
  const [ctx,setCtx]=useState<{emoji:string;label:string}|null>(null);
  const [ctxKey,setCtxKey]=useState(0);
  const [notes,setNotes]=useState<Record<string,string>>({});
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const ph=PHASES[pi];
  const color=PHASE_COLORS[pi];

  const beep=useCallback(()=>{
    try{
      const ac=new (window.AudioContext||(window as unknown as{webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      [880,1100,880].forEach((f,i)=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.connect(g);g.connect(ac.destination);
        o.frequency.value=f; g.gain.setValueAtTime(0.3,ac.currentTime+i*0.15);
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+i*0.15+0.12);
        o.start(ac.currentTime+i*0.15); o.stop(ac.currentTime+i*0.15+0.15);
      });
    }catch{}
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

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto fade-up">
      {/* Phase scroll pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 snap-x" style={{scrollbarWidth:"none"}}>
        {PHASES.map((p,i)=>(
          <button key={p.id} onClick={()=>go(i)} className="btn-press flex-shrink-0 snap-start rounded-2xl px-4 py-2 font-extrabold text-xs transition-all cursor-pointer border-2"
            style={{
              fontFamily:"'Nunito',sans-serif",
              background: i===pi?PHASE_COLORS[i]:"white",
              color: i===pi?"white":PHASE_COLORS[i],
              borderColor: PHASE_COLORS[i],
              boxShadow: i===pi?`0 3px 0 ${darken(PHASE_COLORS[i])}`:"0 3px 0 #e5e5e5",
            }}>
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Timer hero card */}
      <Card accent={color} className={`p-6 mb-5 ${alarm?"alarm-pulse":""}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Ring */}
          <Ring pct={t/ph.duration} color={color} size={160}>
            <span className="text-4xl font-black" style={{color,fontFamily:"'Nunito',sans-serif"}}>{fmt(t)}</span>
            <span className="text-xs font-bold" style={{color:"#afafaf"}}>{fmt(ph.duration)}</span>
          </Ring>

          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{color:"#afafaf"}}>Phase {pi+1}/{PHASES.length}</div>
            <h2 className="text-2xl font-black mb-1" style={{color,fontFamily:"'Nunito',sans-serif"}}>{ph.emoji} {ph.subtitle}</h2>
            <p className="text-sm font-semibold mb-4" style={{color:"#afafaf"}}>{ph.description}</p>
            <XPBar pct={t/ph.duration} color={color}/>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <DBtn color={color} onClick={()=>{setRun(!run);setAlarm(false);}}>
                {run?"⏸ Pause":t===0?"🔄 Relancer":"▶ Démarrer"}
              </DBtn>
              <DBtn variant="outline" color={color} onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>↺</DBtn>
              {pi<PHASES.length-1&&<DBtn variant="outline" color={color} onClick={()=>go(pi+1)}>Suivant →</DBtn>}
            </div>
          </div>
        </div>

        {alarm&&(
          <div className="mt-4 rounded-2xl p-3 text-center font-black text-sm bounce-in"
            style={{background:`${color}20`,color,border:`2px solid ${color}40`}}>
            🎉 Temps écoulé — phase suivante !
          </div>
        )}
      </Card>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {([["coach","joueur"] as Role[], "observerActions" in ph ? ["observateur" as Role] : []] as Role[][]).flat().map(role=>{
          const cfg=ROLE_CFG[role];
          const actions=role==="coach"?ph.coachActions:role==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
          if(!actions.length)return null;
          return (
            <Card key={role} accent={cfg.border} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-black"
                  style={{background:cfg.bg,border:`2px solid ${cfg.border}`}}>
                  {cfg.emoji}
                </div>
                <span className="font-extrabold text-sm" style={{color:cfg.color}}>{cfg.label}</span>
              </div>
              <ul className="space-y-1.5">
                {actions.map((a,i)=>(
                  <li key={i} className="flex items-start gap-2 text-xs font-semibold" style={{color:"#3c3c3c"}}>
                    <span className="mt-0.5 font-black" style={{color:cfg.color}}>▸</span>{a}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Context drawer */}
      {["solo","duos","scenes"].includes(ph.id)&&(
        <Card accent={color} className="p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-extrabold text-sm" style={{color}}>🎲 Contexte aléatoire</span>
            <DBtn size="sm" color={color} onClick={draw}>Tirer !</DBtn>
          </div>
          {ctx?(
            <div key={ctxKey} className="text-center py-3 px-4 rounded-2xl font-extrabold text-sm bounce-in"
              style={{background:`${color}15`,color,border:`2px dashed ${color}60`}}>
              {ctx.emoji} {ctx.label}
            </div>
          ):(
            <div className="text-center py-3 text-xs font-bold" style={{color:"#afafaf"}}>
              Appuie sur « Tirer ! » pour un contexte surprise 🎁
            </div>
          )}
        </Card>
      )}

      {/* Notes */}
      <Card className="p-4">
        <div className="font-extrabold text-xs mb-2" style={{color:"#afafaf"}}>📝 Notes de phase</div>
        <textarea className="w-full text-xs font-semibold bg-[#f7f7f7] rounded-2xl p-3 resize-none outline-none placeholder-[#afafaf]"
          style={{minHeight:"64px",border:"2px solid #e5e5e5",color:"#3c3c3c",fontFamily:"'Nunito',sans-serif"}}
          placeholder="Ce qui a fonctionné, ce qui a résisté…"
          value={notes[`${pi}`]||""}
          onChange={e=>setNotes(n=>({...n,[`${pi}`]:e.target.value}))}/>
      </Card>
    </div>
  );
}

// ══════════ FICHES ════════════════════════════════════════════════════════════
function FichesTab(){
  const [view,setView]=useState<"roles"|"phases">("roles");
  const [role,setRole]=useState<Role>("coach");
  const [phase,setPhase]=useState<PhaseId>("warmup");
  const ph=PHASES.find(p=>p.id===phase)!;
  const phIdx=PHASES.findIndex(p=>p.id===phase);
  const color=PHASE_COLORS[phIdx];
  const cfg=ROLE_CFG[role];

  const mantras:Record<Role,string[]>={coach:MANTRAS_COACH,joueur:MANTRAS_JOUEUR,observateur:MANTRAS_OBS};
  const erreurs:Record<Role,{titre:string;fix:string}[]>={
    coach:[
      {titre:"Parler pendant la scène",fix:"Attendre le freeze ou la fin."},
      {titre:"Feedback trop long",fix:"1–2 observations max."},
      {titre:"Dépasser le temps",fix:"Couper à l'heure dite."},
      {titre:"Question rhétorique",fix:"Attends la réponse vraie."},
      {titre:"Cibler une seule personne",fix:"Varier les passes."},
      {titre:"Corriger l'intention",fix:"Corriger la perception, pas l'intention."},
    ],
    joueur:[
      {titre:"Annoncer le décor",fix:"Ne jamais expliquer — montrer !"},
      {titre:"Geste flou",fix:"Résistance, poids, texture — tout."},
      {titre:"Ignorer le sol",fix:"Marbre ≠ plage ≠ vaisseau."},
      {titre:"Jouer en parallèle",fix:"Même espace, même lumière."},
      {titre:"Figer au Freeze",fix:"Position tenue, regard vivant."},
    ],
    observateur:[
      {titre:"Réagir pendant la scène",fix:"Silence total — zéro réaction."},
      {titre:"« Tu aurais dû… »",fix:"« Je n'ai pas vu… »"},
      {titre:"Retour trop long",fix:"3 points max."},
      {titre:"Valider l'intention",fix:"Ce que j'ai perçu, pas voulu."},
    ],
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto fade-up">
      {/* Toggle */}
      <div className="flex rounded-2xl p-1 mb-5 gap-1" style={{background:"#e5e5e5"}}>
        {(["roles","phases"] as const).map(v=>(
          <button key={v} onClick={()=>setView(v)} className="flex-1 rounded-xl py-2 text-sm font-extrabold transition-all cursor-pointer"
            style={{
              fontFamily:"'Nunito',sans-serif",
              background: view===v?"white":"transparent",
              color: view===v?"#3c3c3c":"#afafaf",
              boxShadow: view===v?"0 2px 0 #e5e5e5":"none",
            }}>
            {v==="roles"?"👤 Par rôle":"📋 Par exercice"}
          </button>
        ))}
      </div>

      {view==="roles"&&(
        <>
          {/* Role pills */}
          <div className="flex gap-2 mb-5">
            {(["coach","joueur","observateur"] as Role[]).map(r=>{
              const c=ROLE_CFG[r];
              return (
                <button key={r} onClick={()=>setRole(r)} className="btn-press flex-1 rounded-2xl py-2.5 text-xs font-extrabold transition-all cursor-pointer border-2"
                  style={{
                    fontFamily:"'Nunito',sans-serif",
                    background: role===r?c.color:"white",
                    color: role===r?"white":c.color,
                    borderColor: c.color,
                    boxShadow: role===r?`0 3px 0 ${darken(c.color)}`:"0 3px 0 #e5e5e5",
                  }}>
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>

          {/* Hero */}
          <Card accent={cfg.border} className="p-5 mb-4 bounce-in" key={role}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black"
                style={{background:cfg.bg,border:`3px solid ${cfg.border}`}}>
                {cfg.emoji}
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest" style={{color:"#afafaf"}}>Fiche de poste</div>
                <h2 className="text-2xl font-black" style={{color:cfg.color,fontFamily:"'Nunito',sans-serif"}}>{cfg.label}</h2>
                <p className="text-xs font-semibold italic" style={{color:"#afafaf"}}>
                  {role==="coach"&&"Chef d'orchestre silencieux 🧭"}
                  {role==="joueur"&&"Montrer, ne pas dire 🎭"}
                  {role==="observateur"&&"Les yeux du public 👁"}
                </p>
              </div>
            </div>
          </Card>

          {/* Mantras */}
          <Card className="p-4 mb-4" accent={cfg.border}>
            <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#afafaf"}}>✨ Mantras</div>
            <ul className="space-y-2">
              {mantras[role].map((m,i)=>(
                <li key={i} className="flex items-start gap-3 py-2 border-b-2 last:border-0" style={{borderColor:"#f0f0f0"}}>
                  <span className="w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{background:cfg.bg,color:cfg.color}}>
                    {i+1}
                  </span>
                  <span className="text-sm font-bold italic" style={{color:"#3c3c3c"}}>« {m} »</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pièges */}
          <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#afafaf"}}>⚠️ Pièges à éviter</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {erreurs[role].map((e,i)=>(
              <Card key={i} className="p-3" accent="#ffd580">
                <div className="text-sm font-extrabold mb-1" style={{color:"#ff9600"}}>❌ {e.titre}</div>
                <div className="text-xs font-semibold" style={{color:"#3c3c3c"}}>✅ {e.fix}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {view==="phases"&&(
        <>
          {/* Phase scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{scrollbarWidth:"none"}}>
            {PHASES.map((p,i)=>(
              <button key={p.id} onClick={()=>setPhase(p.id as PhaseId)} className="btn-press flex-shrink-0 rounded-2xl px-4 py-2 font-extrabold text-xs transition-all cursor-pointer border-2"
                style={{
                  fontFamily:"'Nunito',sans-serif",
                  background: p.id===phase?PHASE_COLORS[i]:"white",
                  color: p.id===phase?"white":PHASE_COLORS[i],
                  borderColor: PHASE_COLORS[i],
                  boxShadow: p.id===phase?`0 3px 0 ${darken(PHASE_COLORS[i])}`:"0 3px 0 #e5e5e5",
                }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>

          {/* Phase hero */}
          <Card accent={color} className="p-5 mb-4 bounce-in" key={phase}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{background:`${color}20`,border:`2px solid ${color}40`}}>
                {ph.emoji}
              </div>
              <div>
                <div className="text-xs font-extrabold" style={{color:"#afafaf"}}>{phIdx+1}/{PHASES.length} · {fmt(ph.duration)}</div>
                <h2 className="text-xl font-black" style={{color,fontFamily:"'Nunito',sans-serif"}}>{ph.subtitle}</h2>
              </div>
            </div>
            <p className="text-sm font-semibold" style={{color:"#6b6b6b"}}>{ph.description}</p>
          </Card>

          {/* 3 role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {(["coach","joueur","observateur"] as Role[]).map(r=>{
              const rc=ROLE_CFG[r];
              const actions=r==="coach"?ph.coachActions:r==="joueur"?ph.playerActions:"observerActions" in ph?(ph as typeof ph&{observerActions:string[]}).observerActions:[];
              if(!actions.length)return null;
              return (
                <Card key={r} accent={rc.border} className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{rc.emoji}</span>
                    <span className="text-xs font-extrabold" style={{color:rc.color}}>{rc.label}</span>
                  </div>
                  <ul className="space-y-1">
                    {actions.map((a,i)=>(
                      <li key={i} className="text-xs font-semibold flex items-start gap-1.5" style={{color:"#6b6b6b"}}>
                        <span style={{color:rc.color,flexShrink:0}}>▸</span>{a}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          {/* Contexts */}
          {["solo","duos","scenes"].includes(ph.id)&&(
            <Card className="p-4" accent={color}>
              <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#afafaf"}}>🎭 Contextes disponibles</div>
              <div className="grid grid-cols-2 gap-2">
                {(ph.id==="solo"?CONTEXTES_SOLO:ph.id==="duos"?CONTEXTES_DUOS:CONTEXTES_SCENES).map((c,i)=>(
                  <div key={i} className="rounded-2xl px-3 py-2 text-xs font-bold flex items-center gap-2"
                    style={{background:`${color}12`,color:"#3c3c3c",border:`1.5px solid ${color}30`}}>
                    {c.emoji} {c.label}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ══════════ PARTICIPANTS ══════════════════════════════════════════════════════
function ParticipantsTab(){
  const [parts,setParts]=useState<Participant[]>([
    {id:"1",name:"Alice",role:"joueur",passages:0},
    {id:"2",name:"Bruno",role:"coach",passages:0},
    {id:"3",name:"Chloé",role:"observateur",passages:0},
  ]);
  const [name,setName]=useState("");
  const [confetti,setConfetti]=useState<{id:number;x:number;color:string}[]>([]);

  const add=()=>{
    if(!name.trim())return;
    setParts(p=>[...p,{id:Date.now()+"",name:name.trim(),role:"joueur",passages:0}]);
    setName("");
  };
  const setRole=(id:string,r:Role)=>setParts(p=>p.map(x=>x.id===id?{...x,role:r}:x));
  const inc=(id:string)=>{
    setParts(p=>p.map(x=>x.id===id?{...x,passages:x.passages+1}:x));
    const id2=Date.now();
    setConfetti(c=>[...c,{id:id2,x:Math.random()*80+10,color:Object.values(ROLE_CFG)[Math.floor(Math.random()*3)].color}]);
    setTimeout(()=>setConfetti(c=>c.filter(x=>x.id!==id2)),1000);
  };
  const rem=(id:string)=>setParts(p=>p.filter(x=>x.id!==id));
  const total=parts.reduce((s,p)=>s+p.passages,0);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto fade-up relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(c=>(
        <div key={c.id} className="fixed pointer-events-none text-2xl z-50"
          style={{left:`${c.x}%`,top:"40%",animation:"confetti-fall 0.9s ease-out forwards"}}>
          🎉
        </div>
      ))}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {l:"Participants",v:parts.length,c:"#58cc02",bg:"#f0fdf4"},
          {l:"Passages",v:total,c:"#1cb0f6",bg:"#e8f7fe"},
          {l:"Moy./joueur",v:parts.length?(total/parts.length).toFixed(1):0,c:"#ce82ff",bg:"#f7eeff"},
        ].map(s=>(
          <Card key={s.l} className="p-3 text-center" accent={s.c}>
            <div className="text-3xl font-black" style={{fontFamily:"'Nunito',sans-serif",color:s.c}}>{s.v}</div>
            <div className="text-xs font-extrabold uppercase tracking-wide mt-0.5" style={{color:"#afafaf"}}>{s.l}</div>
          </Card>
        ))}
      </div>

      {/* Add */}
      <Card className="p-4 mb-4" accent="#58cc02">
        <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#afafaf"}}>➕ Ajouter</div>
        <div className="flex gap-2">
          <input className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold outline-none placeholder-[#afafaf]"
            style={{border:"2.5px solid #e5e5e5",fontFamily:"'Nunito',sans-serif",color:"#3c3c3c",background:"#f7f7f7"}}
            placeholder="Prénom…" value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&add()}/>
          <DBtn color="#58cc02" onClick={add}>＋</DBtn>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-2 mb-4">
        {parts.map(p=>{
          const cfg=ROLE_CFG[p.role];
          return (
            <Card key={p.id} accent={cfg.border} className="px-4 py-3 flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                style={{background:cfg.bg,border:`2px solid ${cfg.border}`,color:cfg.color}}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm truncate">{p.name}</div>
                <div className="text-xs font-bold" style={{color:"#afafaf"}}>{p.passages} passage{p.passages>1?"s":""}</div>
              </div>
              {/* Roles */}
              <div className="flex gap-1">
                {(["coach","joueur","observateur"] as Role[]).map(r=>{
                  const rc=ROLE_CFG[r];
                  return (
                    <button key={r} onClick={()=>setRole(p.id,r)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all cursor-pointer border-2 btn-press"
                      style={{
                        background: p.role===r?rc.bg:"white",
                        borderColor: p.role===r?rc.color:"#e5e5e5",
                        boxShadow: p.role===r?`0 2px 0 ${darken(rc.color)}`:"0 2px 0 #e5e5e5",
                      }}
                      title={rc.label}>
                      {rc.emoji}
                    </button>
                  );
                })}
              </div>
              <DBtn size="sm" color="#58cc02" onClick={()=>inc(p.id)}>+1</DBtn>
              <button onClick={()=>rem(p.id)} className="text-xl leading-none cursor-pointer hover:scale-125 transition-transform" style={{color:"#afafaf"}}>×</button>
            </Card>
          );
        })}
      </div>

      {/* Progress bars */}
      {parts.length>0&&(
        <Card className="p-4">
          <div className="font-extrabold text-xs uppercase tracking-widest mb-3" style={{color:"#afafaf"}}>📊 Équilibre</div>
          <div className="space-y-3">
            {parts.map(p=>{
              const max=Math.max(...parts.map(x=>x.passages),1);
              const cfg=ROLE_CFG[p.role];
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-16 text-xs font-bold truncate" style={{color:"#6b6b6b"}}>{p.name}</div>
                  <div className="flex-1"><XPBar pct={p.passages/max} color={cfg.color}/></div>
                  <div className="w-6 text-right text-xs font-black" style={{color:cfg.color}}>{p.passages}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ══════════ PROJECTOR ════════════════════════════════════════════════════════
function ProjectorTab({onBack}:{onBack:()=>void}){
  const [pi,setPi]=useState(0);
  const [t,setT]=useState(PHASES[0].duration);
  const [run,setRun]=useState(false);
  const [alarm,setAlarm]=useState(false);
  const [ctx,setCtx]=useState<{emoji:string;label:string}|null>(null);
  const [ctxKey,setCtxKey]=useState(0);
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const ph=PHASES[pi];
  const color=PHASE_COLORS[pi];

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${alarm?"alarm-pulse":""}`}
      style={{background:`${color}15`}}>
      <button onClick={onBack} className="fixed top-4 left-4 z-50 btn-press rounded-2xl px-4 py-2 text-xs font-extrabold border-2 cursor-pointer"
        style={{background:"white",borderColor:"#e5e5e5",boxShadow:"0 3px 0 #e5e5e5",fontFamily:"'Nunito',sans-serif",color:"#afafaf"}}>
        ← Retour
      </button>

      {/* Phase pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PHASES.map((p,i)=>(
          <button key={p.id} onClick={()=>go(i)} className="btn-press rounded-2xl px-3 py-1.5 text-xs font-extrabold border-2 cursor-pointer transition-all"
            style={{
              fontFamily:"'Nunito',sans-serif",
              background: i===pi?PHASE_COLORS[i]:"white",
              color: i===pi?"white":PHASE_COLORS[i],
              borderColor: PHASE_COLORS[i],
              boxShadow: i===pi?`0 3px 0 ${darken(PHASE_COLORS[i])}`:"0 3px 0 #e5e5e5",
            }}>
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Big ring */}
      <Ring pct={t/ph.duration} color={color} size={280}>
        <span className="text-6xl font-black" style={{color,fontFamily:"'Nunito',sans-serif"}}>{fmt(t)}</span>
        <span className="text-sm font-bold" style={{color:"#afafaf"}}>{fmt(ph.duration)}</span>
      </Ring>

      <h1 className="text-4xl font-black text-center mt-6 mb-2" style={{color,fontFamily:"'Nunito',sans-serif"}}>
        {ph.emoji} {ph.subtitle}
      </h1>
      <p className="text-base font-semibold text-center mb-8" style={{color:"#6b6b6b"}}>{ph.description}</p>

      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <DBtn color={color} size="lg" onClick={()=>{setRun(!run);setAlarm(false);}}>
          {run?"⏸ Pause":"▶ Démarrer"}
        </DBtn>
        <DBtn variant="outline" color={color} size="lg" onClick={()=>{setT(ph.duration);setRun(false);setAlarm(false);}}>↺</DBtn>
        {["solo","duos","scenes"].includes(ph.id)&&(
          <DBtn variant="outline" color={color} size="lg" onClick={draw}>🎲 Contexte</DBtn>
        )}
      </div>

      {ctx&&(
        <div key={ctxKey} className="text-2xl font-black text-center py-4 px-8 rounded-3xl border-2 bounce-in"
          style={{background:"white",borderColor:color,color,boxShadow:`0 4px 0 ${darken(color)}`,fontFamily:"'Nunito',sans-serif"}}>
          {ctx.emoji} {ctx.label}
        </div>
      )}

      {alarm&&(
        <div className="mt-6 text-2xl font-black bounce-in" style={{color,fontFamily:"'Nunito',sans-serif"}}>
          🎉 Temps écoulé !
        </div>
      )}
    </div>
  );
}

// ══════════ MAIN ══════════════════════════════════════════════════════════════
export default function ImproApp(){
  const [tab,setTab]=useState<Tab>("session");

  if(tab==="projector") return <ProjectorTab onBack={()=>setTab("session")}/>;

  const tabs=[
    {id:"session" as Tab,label:"Séance",icon:"⏱"},
    {id:"fiches" as Tab,label:"Fiches",icon:"📋"},
    {id:"participants" as Tab,label:"Équipe",icon:"👥"},
    {id:"projector" as Tab,label:"Écran",icon:"📽"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f0faf0"}}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3" style={{background:"white",borderBottom:"3px solid #e5e5e5"}}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black border-2"
              style={{background:"#f0faf0",borderColor:"#58cc02",boxShadow:"0 3px 0 #46a302"}}>
              🎭
            </div>
            <div>
              <h1 className="text-lg font-black leading-none" style={{fontFamily:"'Nunito',sans-serif",color:"#3c3c3c"}}>
                Qui · Quoi · Où
              </h1>
              <p className="text-xs font-bold" style={{color:"#afafaf"}}>Coach d&apos;impro</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-extrabold" style={{color:"#58cc02"}}>1h · 10 joueurs</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pb-24">
        {tab==="session"&&<SessionTab/>}
        {tab==="fiches"&&<FichesTab/>}
        {tab==="participants"&&<ParticipantsTab/>}
      </div>

      {/* Bottom nav — MOBILE FIRST */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2" style={{background:"white",borderTop:"3px solid #e5e5e5"}}>
        <div className="max-w-2xl mx-auto flex gap-1">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all cursor-pointer btn-press"
              style={{
                fontFamily:"'Nunito',sans-serif",
                background: tab===t.id?"#f0faf0":"transparent",
                border: tab===t.id?"2.5px solid #58cc02":"2.5px solid transparent",
                boxShadow: tab===t.id?"0 3px 0 #46a302":"none",
              }}>
              <span className="text-xl leading-none mb-0.5">{t.icon}</span>
              <span className="text-xs font-extrabold" style={{color:tab===t.id?"#58cc02":"#afafaf"}}>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
