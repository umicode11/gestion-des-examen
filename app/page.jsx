'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
const PdfExport = dynamic(() => import('./PdfExport'), { ssr: false });

function parseDateLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function getDayLabelFull(date) {
  return ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][date.getDay()];
}
function getShortForSem(shortBase, targetSem) {
  return shortBase.replace(/\d+$/, '') + targetSem;
}
function toStr(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

export default function Home() {
  const [step, setStep]         = useState(0);
  const [anneeInput, setAI]     = useState('');
  const [annee, setAnnee]       = useState('');
  const [sessions, setSessions] = useState([]);
  const [selSession, setSel]    = useState(null);
  const [dates, setDates]       = useState([]);
  const [allFilieres, setAllFil]  = useState([]);
  const [selSem, setSelSem]       = useState('');
  const [filsOfSem, setFilsOfSem] = useState([]);
  const [selFId, setSelFId]       = useState('');
  const [modules, setModules]     = useState([]);
  const [planning, setPlanning]   = useState({});
  const [globalJour, setGJ]       = useState('');
  const [globalPeriode, setGP]    = useState('matin');
  const [saved, setSaved]         = useState({});
  const [saving, setSaving]       = useState(false);
  const [preview, setPreview]     = useState(false);
  const [dbReady, setDbReady]     = useState(false);
  const [dbError, setDbError]     = useState('');

  const semsDispos = selSession?.type === 'automne' ? [1,3,5] : [2,4,6];
  const selFiliere = allFilieres.find(f => f.id === Number(selFId)) || null;
  const selShort   = selFiliere ? getShortForSem(selFiliere.short_base, parseInt(selSem)) : '';
  const savedList  = Object.values(saved).sort((a,b) => a.semestre-b.semestre || a.short.localeCompare(b.short));

  useEffect(() => {
    fetch('/api/init', { method:'POST' })
      .then(r=>r.json())
      .then(d=>{ if(d.success) setDbReady(true); else setDbError(d.error); })
      .catch(()=>setDbError('Connexion DB impossible.'));
  }, []);

  const loadSessions = useCallback(async (yr) => {
    const res = await fetch('/api/sessions?annee='+encodeURIComponent(yr));
    setSessions(await res.json());
  }, []);

  useEffect(() => {
    if (selSession) fetch('/api/filieres').then(r=>r.json()).then(setAllFil);
  }, [selSession]);

  useEffect(() => {
    if (!selSem) { setFilsOfSem([]); setSelFId(''); return; }
    const s = parseInt(selSem), base = s%2===0?s-1:s;
    setFilsOfSem(allFilieres.filter(f=>f.semestre===base).sort((a,b)=>a.short_base.localeCompare(b.short_base)));
    setSelFId(''); setModules([]); setPlanning({});
  }, [selSem, allFilieres]);

  useEffect(() => {
    if (!selSession || !annee) return;
    // Reset saved when switching session — table starts empty
    setSaved({});
  }, [selSession, annee]);


  useEffect(() => {
    if (!selFId || !selSem) { setModules([]); setPlanning({}); return; }
    fetch('/api/modules?filiere_id='+selFId+'&semestre='+selSem)
      .then(r=>r.json())
      .then(mods => {
        setModules(mods);
        const init = {};
        mods.forEach((m, i) => {
          init[m.id] = { jour: dates[i]||'', periode: i%2===0?'matin':'apres-midi', module_nom: m.nom, short: m.short };
        });
        setPlanning(init);
        setGJ(dates[0]||''); setGP('matin');
      });
  }, [selFId, selSem]); // eslint-disable-line

  const conflicts = (() => {
    const seen={}, bad=new Set();
    Object.entries(planning).forEach(([mid,s])=>{
      if(!s.jour) return;
      if(seen[s.jour]){bad.add(mid);bad.add(seen[s.jour]);}else seen[s.jour]=mid;
    });
    return bad;
  })();

  const applyGlobal = (mid) => {
    if(!globalJour) return;
    setPlanning(prev=>({...prev,[mid]:{...prev[mid],jour:globalJour,periode:globalPeriode}}));
  };
  const clearSlot = (mid,e) => {
    e.stopPropagation();
    setPlanning(prev=>({...prev,[mid]:{...prev[mid],jour:''}}));
  };
  const slots = Object.entries(planning).filter(([,s])=>s.jour)
    .map(([mid,s])=>({module_id:Number(mid),module_nom:s.module_nom,short:s.short,jour:s.jour,periode:s.periode}));

  const saveOne = async () => {
    if(conflicts.size>0||!selFiliere) return;
    setSaving(true);
    await fetch('/api/schedule',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({session_id:selSession.id,filiere_id:selFiliere.id,schedule:slots})});
    setSaved(prev=>({...prev,[selFiliere.id+'_'+selSem]:{filiere:selFiliere,short:selShort,semestre:parseInt(selSem),slots}}));
    setSaving(false); setSelFId(''); setSelSem(''); setModules([]); setPlanning({});
  };


  if(!dbReady) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {dbError?(
        <div className="bg-red-900/40 border border-red-500 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-300 font-semibold mb-2">Erreur DB</p>
          <p className="text-red-400 text-sm">{dbError}</p>
          <p className="text-slate-400 text-xs mt-4">Configurez DB_HOST, DB_USER, DB_PASSWORD, DB_NAME dans .env.local</p>
        </div>
      ):(
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
          <p className="text-slate-400">Initialisation...</p>
        </div>
      )}
    </div>
  );

  const stepLabels = ['Année','Session','Dates','Planning'];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <div className="border-b border-slate-700 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🎓 Calendrier des Examens</h1>
            <p className="text-xs text-slate-400">Faculté des Sciences – El Jadida</p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {stepLabels.map((label,i)=>(
              <div key={i} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${step>i?'bg-green-500':step===i?'bg-blue-500':'bg-slate-700 text-slate-500'}`}>
                  {step>i?'✓':i+1}
                </div>
                <span className={`hidden sm:block ${step===i?'text-white':'text-slate-500'}`}>{label}</span>
                {i<stepLabels.length-1&&<span className="text-slate-600 mx-1">›</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* STEP 0 */}
        {step===0&&(
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-2">Année Universitaire</h2>
            <p className="text-slate-400 mb-8">Entrez l&apos;année universitaire</p>
            <input type="text" placeholder="ex: 2025-2026" value={anneeInput}
              onChange={e=>setAI(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&/^\d{4}-\d{4}$/.test(anneeInput)){setAnnee(anneeInput);loadSessions(anneeInput);setStep(1);}}}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-4 text-white text-xl focus:outline-none focus:border-blue-500 placeholder-slate-500 tracking-widest"/>
            <button disabled={!/^\d{4}-\d{4}$/.test(anneeInput)}
              onClick={()=>{setAnnee(anneeInput);loadSessions(anneeInput);setStep(1);}}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold transition-all">
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 1 */}
        {step===1&&(
          <div>
            <button onClick={()=>setStep(0)} className="text-slate-400 hover:text-white text-sm mb-6 block">← Retour</button>
            <h2 className="text-2xl font-bold mb-1">Choisir la Session</h2>
            <p className="text-slate-400 mb-8">Année : <span className="text-blue-400 font-semibold">{annee}</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
              {sessions.map(s=>(
                <button key={s.id} onClick={()=>{setSel(s);setSelSem('');setSelFId('');setStep(2);}}
                  className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-left transition-all">
                  <div className="text-3xl mb-3">{s.type==='automne'?'🍂':'🌸'}</div>
                  <p className="font-bold text-lg">{s.nom}</p>
                  <p className="text-slate-400 text-sm mt-1">Semestres {s.type==='automne'?'S1, S3, S5':'S2, S4, S6'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Calendar, no default selected */}
        {step===2&&(
          <div className="max-w-lg">
            <button onClick={()=>setStep(1)} className="text-slate-400 hover:text-white text-sm mb-6 block">← Retour</button>
            <h2 className="text-2xl font-bold mb-1">Jours d&apos;Examens</h2>
            <p className="text-slate-400 mb-6">{selSession?.nom} · {annee}</p>
            <CalendarPicker dates={dates} setDates={setDates}/>
            {dates.length>0&&(
              <>
                <div className="flex flex-col gap-2 mb-4 mt-5">
                  {dates.map((d,i)=>{
                    const date=parseDateLocal(d);
                    return(
                      <div key={d} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i+1}</span>
                          <span className="font-medium text-sm">{getDayLabelFull(date)}</span>
                          <span className="text-slate-400 text-sm">{date.toLocaleDateString('fr-FR')}</span>
                        </div>
                        <button onClick={()=>setDates(prev=>prev.filter(x=>x!==d))} className="text-slate-500 hover:text-red-400 text-xl leading-none">×</button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={()=>setDates([])} className="text-xs text-slate-500 hover:text-red-400 mb-4 block">Effacer tout</button>
              </>
            )}
            <button disabled={dates.length===0} onClick={()=>setStep(3)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-semibold transition-all mt-2">
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 3 — Planning */}
        {step===3&&(
          <div>
            <button onClick={()=>setStep(2)} className="text-slate-400 hover:text-white text-sm mb-6 block">← Retour</button>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">Planning des Examens</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {selSession?.nom} · {annee} · <span className="text-blue-400">{dates.length} jours</span>
                  {savedList.length>0&&<span className="text-green-400 ml-2">· {savedList.length} filière(s) ✓</span>}
                </p>
              </div>
              {savedList.length>0&&(
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={()=>setPreview(true)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold">
                    👁 Aperçu &amp; PDF
                  </button>
                  <button onClick={()=>{if(confirm('Vider toutes les sauvegardes ?')){setSaved({});try{localStorage.removeItem('exam_saved_'+annee+'_'+selSession?.id);}catch{}}}}
                    className="bg-slate-800 hover:bg-red-900/40 border border-slate-600 hover:border-red-700 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 transition-all">
                    🗑
                  </button>
                </div>
              )}
            </div>

            {/* ── Chips: Semestre + Filière ── */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
              <p className="text-sm font-semibold text-slate-300 mb-4">Choisir la filière à planifier</p>
              <p className="text-xs text-slate-400 mb-2">Semestre</p>
              <div className="flex gap-2 flex-wrap mb-5">
                {semsDispos.map(s=>(
                  <button key={s} onClick={()=>setSelSem(String(s)===selSem?'':String(s))}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                      ${String(s)===selSem?'bg-blue-600 border-blue-500 text-white':'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                    S{s}
                  </button>
                ))}
              </div>
              {selSem&&filsOfSem.length>0&&(
                <>
                  <p className="text-xs text-slate-400 mb-2">Filière</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {filsOfSem.map(f=>{
                      const sh=getShortForSem(f.short_base,parseInt(selSem));
                      const done=!!saved[f.id+'_'+selSem];
                      const isSel=String(f.id)===String(selFId);
                      return(
                        <button key={f.id} onClick={()=>setSelFId(isSel?'':String(f.id))}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all
                            ${isSel?'bg-blue-600 border-blue-500 text-white':done?'bg-green-900/40 border-green-700 text-green-300 hover:bg-green-900/60':'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                          {sh}{done&&!isSel?' ✓':''}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {selFiliere&&modules.length>0&&(
                <p className="text-xs text-slate-400">
                  <span className="text-blue-400 font-bold">{selShort}</span> · {modules.length} modules · 1 module/jour
                  {saved[selFiliere.id+'_'+selSem]&&<span className="text-green-400 ml-2">· Déjà planifiée</span>}
                </p>
              )}

              {/* Tout sauvegarder — saves every filière of every semestre */}
              <div className="mt-5 pt-5 border-t border-slate-700 flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-slate-400">
                  Sauvegarder toutes les filières de <span className="text-white font-semibold">{semsDispos.map(s=>'S'+s).join(', ')}</span>
                  {savedList.length>0 && <span className="text-green-400 ml-2">· {savedList.length} filière(s) enregistrée(s)</span>}
                </p>
                <ToutSauvegarder
                  semsDispos={semsDispos}
                  allFilieres={allFilieres}
                  dates={dates}
                  saved={saved}
                  setSaved={setSaved}
                  selSession={selSession}
                  getShortForSem={getShortForSem}
                />
              </div>
            </div>

            {/* ── Module assignment ── */}
            {selFiliere&&modules.length>0&&(
              <>
                {conflicts.size>0&&(
                  <div className="mb-4 bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-300">
                    ⚠ Conflit : deux modules ont le même jour. Un seul module par jour autorisé.
                  </div>
                )}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-6">
                  <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="font-bold text-blue-400 text-lg">{selShort}</span>
                      <span className="text-slate-400 text-xs ml-2">· S{selSem} · {modules.length} modules</span>
                    </div>
                    <button onClick={saveOne} disabled={conflicts.size>0||saving}
                      className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all
                        ${saved[selFiliere.id+'_'+selSem]?'bg-green-700 hover:bg-green-600':'bg-blue-600 hover:bg-blue-500'}
                        ${(conflicts.size>0||saving)?'opacity-40 cursor-not-allowed':''}`}>
                      {saving?'...':saved[selFiliere.id+'_'+selSem]?'✓ Mettre à jour':'💾 Sauvegarder'}
                    </button>
                  </div>
                  <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-700 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-400 font-medium flex-shrink-0">Affecter :</span>
                    <select value={globalJour} onChange={e=>setGJ(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500">
                      <option value="">— Jour —</option>
                      {dates.map(d=>{
                        const date=parseDateLocal(d);
                        return <option key={d} value={d}>{getDayLabelFull(date)} {date.toLocaleDateString('fr-FR')}</option>;
                      })}
                    </select>
                    <select value={globalPeriode} onChange={e=>setGP(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500">
                      <option value="matin">🌅 Matin (8h30)</option>
                      <option value="apres-midi">🌆 Après-midi (14h30)</option>
                    </select>
                    <span className="text-xs text-slate-500">← puis cliquez sur un module</span>
                  </div>
                  <div className="divide-y divide-slate-700/50">
                    {modules.map(m=>{
                      const slot=planning[m.id]||{};
                      const isConflict=conflicts.has(String(m.id));
                      const hasSlot=!!slot.jour;
                      return(
                        <div key={m.id} onClick={()=>applyGlobal(m.id)}
                          className={`px-5 py-3 flex items-center justify-between gap-4 transition-colors ${globalJour?'cursor-pointer hover:bg-slate-700/30':''} ${isConflict?'bg-red-900/20':''}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 ${hasSlot?'bg-blue-900/50 text-blue-300':'bg-slate-700 text-slate-400'}`}>{m.short}</span>
                            <span className="text-sm text-slate-200 truncate">{m.nom}</span>
                          </div>
                          {hasSlot?(
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border flex-shrink-0 ${isConflict?'bg-red-900/30 border-red-700 text-red-300':'bg-blue-900/30 border-blue-800 text-blue-200'}`}>
                              <span>{getDayLabelFull(parseDateLocal(slot.jour))} {parseDateLocal(slot.jour).toLocaleDateString('fr-FR')}</span>
                              <span className="text-slate-400">·</span>
                              <span>{slot.periode==='matin'?'Matin 8h30':'Après-midi 14h30'}</span>
                              <button onClick={e=>clearSlot(m.id,e)} className="text-slate-400 hover:text-red-400 ml-1 text-sm leading-none">×</button>
                            </div>
                          ):(
                            <span className="text-slate-600 text-xs italic flex-shrink-0">{globalJour?'Cliquer pour affecter':'—'}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── Planning table: shown after filière picker, 2 cols per day ── */}
            {savedList.length>0&&(
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 overflow-x-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Planning — {selSession?.nom}</p>
                <PlanningTable savedList={savedList} dates={dates}/>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {preview&&(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold">Aperçu Global</h2>
                <p className="text-slate-400 text-sm">{selSession?.nom} · {annee}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <PdfExport annee={annee} session={selSession?.nom||''} savedPlannings={savedList} examDates={dates.map(d=>parseDateLocal(d))}/>
<button onClick={()=>setPreview(false)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm font-semibold">Fermer ×</button>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <PlanningTable savedList={savedList} dates={dates} modal/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PlanningTable: 2 columns per day (Matin + Après-midi) ── */
function PlanningTable({ savedList, dates, modal=false }) {
  const textSm = modal ? 'text-xs' : 'text-xs';
  return (
    <table className={`${textSm} border-collapse w-full`}>
      <thead>
        {/* Row 1: Filière | Day (colspan 2) | Day (colspan 2) | ... */}
        <tr className={modal?'bg-blue-950/60':''}>
          <th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-semibold bg-slate-800" rowSpan={2}>
            Filière
          </th>
          {dates.map(d=>{
            const date=parseDateLocal(d);
            return(
              <th key={d} colSpan={2} className="border border-slate-700 px-2 py-2 text-center bg-slate-800 min-w-[140px]">
                <div className="font-bold text-white">{getDayLabelFull(date)}</div>
                <div className="text-slate-400 text-xs">{date.toLocaleDateString('fr-FR')}</div>
              </th>
            );
          })}
        </tr>
        {/* Row 2: Matin | Après-midi per day */}
        <tr>
          {dates.map(d=>(
            <React.Fragment key={d}>
              <th className="border border-slate-700 px-2 py-1.5 text-center bg-blue-950/50 text-blue-300 font-semibold whitespace-nowrap text-xs">
                🌅 Matin
              </th>
              <th className="border border-slate-700 px-2 py-1.5 text-center bg-green-950/50 text-green-300 font-semibold whitespace-nowrap text-xs">
                🌆 Après-midi
              </th>
            </React.Fragment>
          ))}
        </tr>
      </thead>
      <tbody>
        {savedList.map(({short,semestre,slots:s})=>(
          <tr key={short+'-'+semestre} className="border-t border-slate-700">
            <td className="border border-slate-700 px-3 py-2 font-bold text-blue-300 bg-slate-800/50 whitespace-nowrap align-middle">
              {short}
            </td>
            {dates.map(d=>{
              const matin=s.find(x=>x.jour===d&&x.periode==='matin');
              const aprem=s.find(x=>x.jour===d&&x.periode==='apres-midi');
              return(
                <React.Fragment key={d}>
                  <td className={`border border-slate-700 px-2 py-2 text-center align-middle ${matin?'bg-blue-950/30':''}`}>
                    {matin?(
                      <div className="text-blue-200 text-xs leading-tight">{matin.module_nom}</div>
                    ):<span className="text-slate-700">—</span>}
                  </td>
                  <td className={`border border-slate-700 px-2 py-2 text-center align-middle ${aprem?'bg-green-950/30':''}`}>
                    {aprem?(
                      <div className="text-green-200 text-xs leading-tight">{aprem.module_nom}</div>
                    ):<span className="text-slate-700">—</span>}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── CalendarPicker ── */
function CalendarPicker({ dates, setDates }) {
  const today=new Date();
  const [viewYear,setViewYear]=useState(today.getFullYear());
  const [viewMonth,setViewMonth]=useState(today.getMonth());
  const MONTHS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const firstDay=new Date(viewYear,viewMonth,1);
  const startOff=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
  const cells=[];
  for(let i=0;i<startOff;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  const toggle=(day)=>{
    const str=viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    setDates(prev=>prev.includes(str)?prev.filter(x=>x!==str):[...prev,str].sort());
  };
  const prev=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const next=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};
  return(
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 font-bold transition-all">‹</button>
        <span className="font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={next} className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 font-bold transition-all">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d=><div key={d} className="text-center text-xs text-slate-500 font-semibold py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day,i)=>{
          if(!day) return <div key={'e'+i}/>;
          const str=viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
          const isSel=dates.includes(str);
          const isTod=toStr(today)===str;
          const idx=dates.indexOf(str);
          return(
            <button key={str} onClick={()=>toggle(day)}
              className={`relative aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                ${isSel?'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50':isTod?'bg-slate-700 text-blue-400 border border-blue-600/50':'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
              {day}
              {isSel&&(
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full text-xs flex items-center justify-center font-bold leading-none">
                  {idx+1}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-slate-500 text-xs mt-3 text-center">
        Cliquez pour sélectionner les jours d&apos;examen
        {dates.length>0&&<span className="text-blue-400 font-semibold ml-1">· {dates.length} jour{dates.length>1?'s':''}</span>}
      </p>
    </div>
  );
}

/* ── ToutSauvegarder — fetches all filières/modules for every semestre and saves them ── */
function ToutSauvegarder({ semsDispos, allFilieres, dates, saved, setSaved, selSession, getShortForSem }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleSaveAll = async () => {
    if (!selSession || dates.length === 0) return;
    setLoading(true);
    setDone(false);
    const newSaved = { ...saved };

    for (const sem of semsDispos) {
      const base = sem % 2 === 0 ? sem - 1 : sem;
      const filieres = allFilieres.filter(f => f.semestre === base);

      for (const filiere of filieres) {
        const short = getShortForSem(filiere.short_base, sem);
        // fetch modules for this filière + semestre
        const res  = await fetch('/api/modules?filiere_id='+filiere.id+'&semestre='+sem);
        const mods = await res.json();
        if (!mods.length) continue;

        // auto-assign: 1 module per day, alternating matin/apres-midi
        const slots = mods.map((m, i) => ({
          module_id: m.id,
          module_nom: m.nom,
          short: m.short,
          jour: dates[i] || '',
          periode: i % 2 === 0 ? 'matin' : 'apres-midi',
        })).filter(s => s.jour);

        // save to DB
        await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: selSession.id, filiere_id: filiere.id, schedule: slots }),
        });

        const key = filiere.id+'_'+sem;
        newSaved[key] = { filiere, short, semestre: sem, slots };
      }
    }

    setSaved(newSaved);
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <button
      onClick={handleSaveAll}
      disabled={loading || dates.length === 0}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
        ${done
          ? 'bg-green-700 border-green-600 text-white'
          : 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"/>
          Chargement...
        </>
      ) : done ? (
        <>✓ Tout sauvegardé</>
      ) : (
        <>💾 Tout sauvegarder</>
      )}
    </button>
  );
}
