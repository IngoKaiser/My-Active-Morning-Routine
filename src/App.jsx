import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ HELPERS ═══ */
const parseSec=d=>{const m=d.match(/(\d+)\s*Sek/);if(m)return+m[1];const m2=d.match(/(\d+)\s*Min/);if(m2)return m2[1]*60;return 0;};
const parseSets=d=>{const m=d.match(/^(\d+)×/);return m?+m[1]:1;};
const hasSides=d=>/Seite|\/Bein|\/Arm/.test(d);
const ytUrl=q=>`https://www.youtube.com/results?search_query=${encodeURIComponent(q.replace(/\+/g," "))}`;
const fmt=s=>{const m=Math.floor(s/60),r=s%60;return m?`${m}:${r.toString().padStart(2,"0")}`:`${r}`;};

/*
 * ═══ 2026 PALETTE ═══
 * Elevated neutrals (warm sand/stone) + single vivid accent.
 * Trend: muted warmth, intentional color sparks, premium feel.
 */
const C={
  bg:"#FAF9F7",       // warm stone white
  card:"#FFFFFF",
  border:"#EFECE8",   // warm border
  muted:"#A39E93",    // warm gray text
  text:"#2C2925",     // near-black warm
  sub:"#78746C",      // secondary text
  accent:"#E16A3D",   // refined coral-red (the single spark)
  accentSoft:"#FBEEE8",
  accentHover:"#CB5530",
  done:"#6B9E78",     // sage green for completion
  doneBg:"#EFF5F0",
  ring:"#E16A3D",
};
const R = 12; // unified border radius

/* ═══ EXERCISE DATA ═══ */
const DEFAULT_DAYS=[
{id:"mo",label:"Mo",title:"Oberkörper + Core",pauseEx:60,warmup:[{name:"Cat-Cow",detail:"60 Sek.",desc:"Vierfüßler. Einatmen: Hohlkreuz. Ausatmen: Buckel. Fließend wechseln.",yt:"cat+cow+übung+anleitung+deutsch"},{name:"World's Greatest Stretch",detail:"40 Sek./Seite",desc:"Ausfallschritt, Hand am Boden, Arm zur Decke rotieren. Tief halten.",yt:"worlds+greatest+stretch+anleitung"},{name:"Schulter-CARs",detail:"30 Sek./Arm",desc:"Arm in maximalem Kreis rotieren. Langsam, kontrolliert, voller Radius.",yt:"shoulder+CARs+mobility+übung+anleitung"}],main:[{name:"Knie-Liegestütze",detail:"3×40 Sek.",desc:"Knie am Boden, Körper gerade. Langsam runter, kontrolliert hoch. Ellbogen 45°.",yt:"knie+liegestütze+anfänger+richtige+ausführung",tag:"Brust"},{name:"Tisch-Rudern",detail:"3×40 Sek.",desc:"Tischkante greifen, Brust zur Kante ziehen. Schulterblätter zusammen.",yt:"bodyweight+row+tisch+rudern+zuhause",tag:"Rücken"},{name:"Stuhl-Dips",detail:"3×35 Sek.",desc:"Hände auf Stuhlkante, Arme beugen bis 90°. Schultern bleiben unten.",yt:"stuhl+dips+trizeps+übung+anleitung",tag:"Trizeps"},{name:"Pike Push-ups",detail:"3×30 Sek.",desc:"Hüfte hoch in V-Form, Kopf zum Boden senken. Schulterübung.",yt:"pike+push+up+ausführung+deutsch+anleitung",tag:"Schultern"},{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Rückenlage, Arme und Beine schweben. Rücken am Boden. Bananenform.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, Arme und Beine abheben. Gesäß anspannen, Blick zum Boden.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},{name:"Plank",detail:"3×30 Sek.",desc:"Unterarme, Körper gerade. Bauch fest, nicht ins Hohlkreuz fallen.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"}],cooldown:[{name:"Brustdehnung Türrahmen",detail:"40 Sek./Seite",desc:"Unterarm am Türrahmen, Schritt nach vorne. Brust und Schulter dehnen.",yt:"brustdehnung+türrahmen+anleitung"},{name:"Kindshaltung",detail:"45 Sek.",desc:"Gesäß auf Fersen, Arme nach vorne strecken. Stirn ab, atmen, loslassen.",yt:"childs+pose+yoga+anleitung+deutsch"},{name:"Kobra-Stretch",detail:"30 Sek.",desc:"Bauchlage, Arme strecken, Oberkörper heben. Hüfte bleibt am Boden.",yt:"cobra+stretch+yoga+rücken+anleitung"}]},
{id:"di",label:"Di",title:"Unterkörper + Core",pauseEx:45,warmup:[{name:"Cat-Cow",detail:"45 Sek.",desc:"Vierfüßler. Einatmen: Hohlkreuz. Ausatmen: Buckel. Fließend wechseln.",yt:"cat+cow+übung+anleitung+deutsch"},{name:"Hüft-CARs",detail:"30 Sek./Bein",desc:"Knie anheben, großer Kreis nach außen. Kontrolliert, Oberkörper stabil.",yt:"hip+CARs+mobility+übung+hüfte"},{name:"Tiefe Kniebeuge",detail:"45 Sek.",desc:"Fersen am Boden, tief in die Hocke. Ellbogen gegen Knie drücken.",yt:"deep+squat+hold+mobility+deutsch"}],main:[{name:"Kniebeugen",detail:"3×40 Sek.",desc:"Schulterbreit, Hüfte nach hinten-unten. Rücken gerade, mindestens parallel.",yt:"bodyweight+kniebeugen+richtige+ausführung",tag:"Beine"},{name:"Reverse Lunges",detail:"3×30 Sek./Seite",desc:"Großer Schritt nach hinten, Knie fast zum Boden. Durch Ferse zurückdrücken.",yt:"reverse+lunges+anleitung+auf+der+stelle",tag:"Beine"},{name:"Glute Bridges",detail:"3×35 Sek.",desc:"Rückenlage, Hüfte hoch bis Linie entsteht. Gesäß oben fest drücken.",yt:"glute+bridge+anleitung+anfänger",tag:"Gesäß"},{name:"Wadenheben",detail:"3×30 Sek.",desc:"Fußballen auf Stufe, hoch auf Zehenspitzen, Fersen tief absenken.",yt:"wadenheben+stehend+anleitung+bodyweight",tag:"Waden"},{name:"Dead Bugs",detail:"3×25 Sek./Seite",desc:"Rückenlage, gegengleich Arm und Bein strecken. Rücken bleibt am Boden.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Bauch"},{name:"Side Plank",detail:"3×20 Sek./Seite",desc:"Unterarm stützen, Hüfte hoch. Gerade Linie, Becken stabil.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Obliques"},{name:"Superman Hold",detail:"3×25 Sek.",desc:"Bauchlage, Arme und Beine abheben. Gesäß anspannen, Blick zum Boden.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"}],cooldown:[{name:"Tauben-Stretch",detail:"30 Sek./Seite",desc:"Vorderbein angewinkelt, hinteres Bein lang. In die Hüftdehnung atmen.",yt:"pigeon+stretch+hüfte+dehnen+anleitung"},{name:"Oberschenkel-Dehnung",detail:"30 Sek./Bein",desc:"Fuß zum Gesäß ziehen, Hüfte leicht vorschieben. Vorderer Oberschenkel.",yt:"quadrizeps+dehnung+stehend+anleitung"},{name:"Wadendehnung",detail:"25 Sek./Seite",desc:"An der Wand, Bein nach hinten, Ferse in den Boden. Wade dehnen.",yt:"wadendehnung+wand+anleitung"}]},
{id:"mi",label:"Mi",title:"Mobility",pauseEx:15,warmup:[{name:"Cat-Cow",detail:"60 Sek.",desc:"Vierfüßler. Einatmen: Hohlkreuz. Ausatmen: Buckel. Fließend wechseln.",yt:"cat+cow+übung+anleitung+deutsch"},{name:"Schulter-CARs",detail:"45 Sek./Arm",desc:"Arm in maximalem Kreis rotieren. Langsam, kontrolliert, voller Radius.",yt:"shoulder+CARs+mobility+übung+anleitung"},{name:"Hüft-CARs",detail:"45 Sek./Bein",desc:"Knie anheben, großer Kreis nach außen. Kontrolliert, Oberkörper stabil.",yt:"hip+CARs+mobility+übung+hüfte"}],main:[{name:"World's Greatest Stretch",detail:"60 Sek./Seite",desc:"Ausfallschritt, Hand am Boden, Arm zur Decke rotieren. Tief halten.",yt:"worlds+greatest+stretch+mobility+flow",tag:"Ganzkörper"},{name:"Tiefer Squat-Flow",detail:"2 Min.",desc:"Tiefe Hocke, Fersen am Boden. Sanft wippen, Hüfte öffnen.",yt:"deep+squat+hold+mobility+routine",tag:"Hüfte"},{name:"Tauben-Pose",detail:"60 Sek./Seite",desc:"Vorderbein angewinkelt, hinteres Bein lang. In die Hüftdehnung atmen.",yt:"pigeon+pose+yoga+anleitung+deutsch",tag:"Hüfte"},{name:"Brücke vom Boden",detail:"5×20 Sek.",desc:"Rückenlage, Hüfte hoch. Brust öffnen, Gesäß anspannen.",yt:"glute+bridge+brücke+mobility",tag:"Wirbelsäule"},{name:"Thorakale Rotation",detail:"50 Sek./Seite",desc:"Vierfüßler, Hand hinter Kopf. Ellbogen zur Decke drehen. BWS öffnen.",yt:"thorakale+rotation+vierfüßler+mobilität",tag:"BWS"},{name:"Cobra-Stretch",detail:"5×20 Sek.",desc:"Bauchlage, Arme strecken, Oberkörper heben. Schultern weg von den Ohren.",yt:"cobra+stretch+yoga+rücken+deutsch",tag:"LWS"},{name:"Scorpion-Stretch",detail:"45 Sek./Seite",desc:"Bauchlage, Bein über Körper zur Gegenseite. BWS und Hüfte öffnen.",yt:"scorpion+stretch+übung+mobility",tag:"BWS/Hüfte"},{name:"Side Plank",detail:"45 Sek./Seite",desc:"Unterarm stützen, Hüfte hoch. Gerade Linie, Becken stabil.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Rumpf"},{name:"Dead Bug",detail:"40 Sek./Seite",desc:"Rückenlage, gegengleich Arm und Bein strecken. Rücken bleibt am Boden.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Core"}],cooldown:[{name:"Knie zur Brust",detail:"45 Sek./Seite",desc:"Rückenlage, Knie sanft zur Brust ziehen. Unterer Rücken entspannt.",yt:"knie+zur+brust+rückenlage+dehnung"},{name:"Wirbelsäulendrehung",detail:"50 Sek./Seite",desc:"Rückenlage, Knie zur Seite, Blick gegenüber. Schultern am Boden.",yt:"liegende+wirbelsäulendrehung+yoga+anleitung"},{name:"Bauchatmung",detail:"90 Sek.",desc:"Hände auf Bauch, tief einatmen, langsam ausatmen. Komplett loslassen.",yt:"bauchatmung+entspannung+übung"}]},
{id:"do",label:"Do",title:"Core + Oberkörper",pauseEx:30,warmup:[{name:"Cat-Cow",detail:"45 Sek.",desc:"Vierfüßler. Einatmen: Hohlkreuz. Ausatmen: Buckel. Fließend wechseln.",yt:"cat+cow+übung+anleitung+deutsch"},{name:"World's Greatest Stretch",detail:"30 Sek./Seite",desc:"Ausfallschritt, Hand am Boden, Arm zur Decke rotieren. Tief halten.",yt:"worlds+greatest+stretch+anleitung"},{name:"Schulter-CARs",detail:"30 Sek./Arm",desc:"Arm in maximalem Kreis rotieren. Langsam, kontrolliert, voller Radius.",yt:"shoulder+CARs+mobility+übung+anleitung"}],main:[{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Rückenlage, Arme und Beine schweben. Rücken am Boden. Bananenform.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},{name:"Bicycle Crunches",detail:"3×35 Sek.",desc:"Rückenlage, Ellbogen zum Gegenknie rotieren. Schulterblätter anheben.",yt:"bicycle+crunches+richtige+ausführung+deutsch",tag:"Obliques"},{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, Arme und Beine abheben. Gesäß anspannen, Blick zum Boden.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},{name:"Dead Bugs",detail:"3×25 Sek./Seite",desc:"Rückenlage, gegengleich Arm und Bein strecken. Rücken bleibt am Boden.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Bauch"},{name:"Side Plank",detail:"3×25 Sek./Seite",desc:"Unterarm stützen, Hüfte hoch. Gerade Linie, Becken stabil.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Obliques"},{name:"Plank",detail:"3×40 Sek.",desc:"Unterarme, Körper gerade. Bauch fest, nicht ins Hohlkreuz fallen.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"},{name:"Breite Liegestütze",detail:"3×30 Sek.",desc:"Hände weiter als schulterbreit. Brust zum Boden, kontrolliert hoch.",yt:"breite+liegestütze+ausführung+anleitung",tag:"Brust"},{name:"Tisch-Rudern",detail:"3×30 Sek.",desc:"Tischkante greifen, Brust zur Kante ziehen. Schulterblätter zusammen.",yt:"bodyweight+row+tisch+rudern+zuhause",tag:"Rücken"}],cooldown:[{name:"Brustdehnung Türrahmen",detail:"30 Sek./Seite",desc:"Unterarm am Türrahmen, Schritt nach vorne. Brust und Schulter dehnen.",yt:"brustdehnung+türrahmen+anleitung"},{name:"Kobra-Stretch",detail:"30 Sek.",desc:"Bauchlage, Arme strecken, Oberkörper heben. Hüfte bleibt am Boden.",yt:"cobra+stretch+yoga+rücken+anleitung"},{name:"Seitliche Rumpfdehnung",detail:"25 Sek./Seite",desc:"Arm über Kopf zur Seite neigen. Flanke lang ziehen.",yt:"seitliche+rumpfdehnung+stehend+anleitung"}]},
{id:"fr",label:"Fr",title:"Ganzkörper + Core",pauseEx:20,warmup:[{name:"Cat-Cow",detail:"60 Sek.",desc:"Vierfüßler. Einatmen: Hohlkreuz. Ausatmen: Buckel. Fließend wechseln.",yt:"cat+cow+übung+anleitung+deutsch"},{name:"Hüft-CARs",detail:"40 Sek./Bein",desc:"Knie anheben, großer Kreis nach außen. Kontrolliert, Oberkörper stabil.",yt:"hip+CARs+mobility+übung+hüfte"},{name:"Arm Circles + Hüftkreise",detail:"60 Sek.",desc:"Große Armkreise vorwärts und rückwärts, dann Hüften kreisen.",yt:"arm+circles+hüftkreise+warmup+anleitung"}],main:[{name:"Squat to Stand",detail:"3×40 Sek.",desc:"Tiefe Kniebeuge, explosiv hochkommen. Arme über Kopf schwingen.",yt:"squat+to+stand+übung+anleitung",tag:"Ganzkörper"},{name:"Glute Bridge Marsch",detail:"3×40 Sek.",desc:"Brücke halten, abwechselnd ein Bein anheben. Hüfte stabil.",yt:"glute+bridge+march+übung+anleitung",tag:"Gesäß"},{name:"Plank Knee Taps",detail:"3×40 Sek.",desc:"Plank-Position, abwechselnd Knie zur Brust. Rumpf stabil halten.",yt:"plank+knee+taps+übung+anleitung",tag:"Core"},{name:"Liegestütze",detail:"3×40 Sek.",desc:"Volle oder Knie-Variante. Kontrolliert runter, explosiv hoch.",yt:"knie+liegestütze+anfänger+richtige+ausführung",tag:"Brust"},{name:"Birddog",detail:"3×40 Sek.",desc:"Vierfüßler, gegengleich Arm und Bein strecken. Rumpf stabil.",yt:"birddog+übung+anleitung+core",tag:"Ganzkörper"},{name:"Plank",detail:"3×40 Sek.",desc:"Unterarme, Körper gerade. Bauch fest, nicht ins Hohlkreuz fallen.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"},{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Rückenlage, Arme und Beine schweben. Rücken am Boden. Bananenform.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, Arme und Beine abheben. Gesäß anspannen, Blick zum Boden.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"}],cooldown:[{name:"Stehende Vorbeuge",detail:"45 Sek.",desc:"Locker nach vorne hängen, Beine leicht gebeugt. Rücken entspannen.",yt:"stehende+vorbeuge+dehnung+anleitung"},{name:"Tauben-Stretch",detail:"45 Sek./Seite",desc:"Vorderbein angewinkelt, hinteres Bein lang. In die Hüftdehnung atmen.",yt:"pigeon+stretch+hüfte+dehnen+anleitung"},{name:"Bauchatmung",detail:"90 Sek.",desc:"Hände auf Bauch, tief einatmen, langsam ausatmen. Komplett loslassen.",yt:"bauchatmung+entspannung+übung"}]},
];

/* ═══ TIMELINE ═══ */
function buildTimeline(day){const s=[],add=exs=>{exs.forEach(ex=>{const sec=parseSec(ex.detail)||35,sets=parseSets(ex.detail),sides=hasSides(ex.detail);s.push({type:"exercise",...ex,secPerPhase:sec,totalSets:sets,sides,totalPhases:sets*(sides?2:1),setPause:Math.min(25,day.pauseEx)});});};
  add(day.warmup);
  // Training = main + core + extra merged
  const training=[...(day.main||[]),...(day.core||[]),...(day.extra||[])];
  if(training.length){if(s.length>0)s.push({type:"section",seconds:15,label:"Training"});add(training);}
  if(day.cooldown?.length){s.push({type:"section",seconds:10,label:"Cooldown"});add(day.cooldown);}
  const f=[];for(let i=0;i<s.length;i++){f.push(s[i]);if(s[i].type==="exercise"&&i<s.length-1&&s[i+1].type==="exercise")f.push({type:"pause",seconds:day.pauseEx});}return f;}
function totalSeconds(tl){let t=0;for(const s of tl){if(s.type==="exercise")t+=s.totalPhases*s.secPerPhase+(s.totalSets-1)*s.setPause;else t+=s.seconds;}return t;}

/* ═══ HOOKS ═══ */
function useWakeLock(a){const wl=useRef(null),v=useRef(null),k=useRef(null);useEffect(()=>{if(!a){if(wl.current){wl.current.release().catch(()=>{});wl.current=null;}if(v.current)v.current.pause();clearInterval(k.current);return;}const rq=async()=>{try{if("wakeLock"in navigator&&!wl.current){wl.current=await navigator.wakeLock.request("screen");wl.current.addEventListener("release",()=>{wl.current=null;});}}catch(e){}};const mk=()=>{const el=document.createElement("video");el.setAttribute("playsinline","");el.setAttribute("webkit-playsinline","");el.setAttribute("muted","");el.muted=true;el.setAttribute("loop","");el.style.cssText="position:fixed;top:-2px;left:-2px;width:1px;height:1px;opacity:0.001;pointer-events:none;z-index:-9999;";el.src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAPZWWIhAAz//727L4FNf2f0JcRLMXaSnA+KqSAgHc0wAAAAwAAAwAAFgn0IAYYAAADAABVP/cewAAAAwAAAwAAAwAAAwAAAwAJQAAAAwAAAwAAAwAAAwAAAwAAAwAAA";el.addEventListener("ended",()=>{el.currentTime=0;el.play().catch(()=>{});});document.body.appendChild(el);return el;};const pv=()=>{if(!v.current)return;const el=v.current;if(el.paused||el.ended){el.currentTime=0;el.play().catch(()=>{});}};if(!v.current)v.current=mk();const act=()=>{pv();rq();};document.addEventListener("click",act);document.addEventListener("touchend",act);const vis=()=>{if(document.visibilityState==="visible")act();};document.addEventListener("visibilitychange",vis);k.current=setInterval(pv,12000);pv();rq();return()=>{document.removeEventListener("click",act);document.removeEventListener("touchend",act);document.removeEventListener("visibilitychange",vis);clearInterval(k.current);if(wl.current){wl.current.release().catch(()=>{});wl.current=null;}if(v.current){v.current.pause();v.current.remove();v.current=null;}};},[a]);}
function useBeep(){const c=useRef(null);return useCallback((f=880,d=0.12)=>{try{if(!c.current)c.current=new(window.AudioContext||window.webkitAudioContext)();const o=c.current.createOscillator(),g=c.current.createGain();o.connect(g);g.connect(c.current.destination);o.frequency.value=f;g.gain.value=0.13;o.start();g.gain.exponentialRampToValueAtTime(0.001,c.current.currentTime+d);o.stop(c.current.currentTime+d);}catch(e){}},[]);}

/* ═══ RING ═══ */
function Ring({pct,size=38,sw=2.5,children}){const r=(size-sw*2)/2,ci=2*Math.PI*r,d=ci-(pct/100)*ci;return(<div className="relative flex-shrink-0" style={{width:size,height:size}}><svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={sw}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.ring} strokeWidth={sw} strokeLinecap="round" strokeDasharray={ci} strokeDashoffset={d} style={{transition:"stroke-dashoffset 0.35s ease"}}/></svg><div className="absolute inset-0 flex items-center justify-center">{children}</div></div>);}

/* ═══ AI CHAT ═══ */
const SYS=`Du bist ein Trainingsplan-Assistent für eine Bodyweight/Calisthenics Morning-Routine App.

DEINE FÄHIGKEITEN:
- Übungen austauschen, hinzufügen oder entfernen (einzelne Tage oder alle)
- Trainingszeiten anpassen (Sätze, Sekunden pro Satz, Pausen)
- Fokus auf bestimmte Muskelgruppen setzen
- Gesamtdauer eines Trainingstages verkürzen oder verlängern
- Übungen zwischen Sektionen verschieben (warmup, main, cooldown)
- Schwierigkeitsgrad anpassen (leichtere/schwerere Varianten)

REGELN:
- Antworte NUR auf Deutsch
- Halte dich kurz (2-3 Sätze Erklärung + JSON-Änderung)
- Lehne Ernährung, Medizin und Smalltalk freundlich ab

Bei Änderung füge einen JSON-Block ein:
\`\`\`json
{"action":"update_day","dayIndex":0,"changes":{"title":"...","pauseEx":60,"warmup":[...],"main":[...],"cooldown":[...]}}
\`\`\`

Es gibt nur 3 Sektionen pro Tag:
- warmup: Aufwärmen, Mobilisation, Aktivierung
- main: Das eigentliche Training — egal ob Kraft, Core, Mobility, HIIT oder Mix. Alles kommt hierhin.
- cooldown: Dehnung, Entspannung, Runterkommen

Übungs-Format: {"name":"Name","detail":"3×30 Sek.","desc":"Kurzbeschreibung","yt":"youtube+suchbegriffe","tag":"Muskelgruppe"}
Detail-Formate: "30 Sek." | "3×40 Sek." | "30 Sek./Seite" | "3×25 Sek./Seite" | "2 Min."
"/Seite" = beidseitig (Links+Rechts), "/Bein" und "/Arm" ebenfalls.

5 Tage (Index 0-4): MO, DI, MI, DO, FR. Gib nur geänderte Felder in changes zurück.
Wenn der Nutzer den Plan sehen will, beschreibe ihn kurz ohne JSON.

WICHTIG: Wenn die Anfrage ALLE 5 Tage betrifft, erstelle JSON-Blöcke für ALLE 5 Tage in einer Antwort. Das ist möglich und erwünscht.
Erstelle immer alle nötigen JSON-Blöcke auf einmal — der Nutzer soll nicht nachfragen müssen.

WARMUP/COOLDOWN ANPASSUNG:
Wenn du das Training (main) eines Tages änderst, frage den Nutzer aktiv:
"Soll ich Warmup und Cooldown an den geänderten Tagen entsprechend anpassen? Z.B. bei mehr Schulterübungen ein schulter-spezifisches Warmup und passende Dehnungen im Cooldown."
Warte die Antwort ab, bevor du Warmup/Cooldown änderst — es sei denn, der Nutzer hat explizit den ganzen Tag oder Wochenplan angefragt.

FORMATIERUNG:
- Nutze Markdown für Struktur: **fett** für Übungsnamen, Aufzählungen mit - für Listen
- Halte Antworten kurz aber klar strukturiert`;

/* Simple markdown to HTML for chat messages */
function MdText({text, color}) {
  const html = text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#f3f0ec;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>')
    .replace(/^[-•]\s+(.+)/gm, '<div style="padding-left:12px;text-indent:-12px">• $1</div>')
    .replace(/^\d+\.\s+(.+)/gm, (m,p1,off,str) => `<div style="padding-left:16px;text-indent:-16px">${m.match(/^\d+/)[0]}. ${p1}</div>`)
    .replace(/\n/g, '<br/>');
  return <div style={{color}} dangerouslySetInnerHTML={{__html:html}}/>;
}

const CHAT_STORAGE_KEY = "mam-chat-history";
function loadChat() { try { const s = localStorage.getItem(CHAT_STORAGE_KEY); if (s) return JSON.parse(s); } catch(e) {} return null; }
function saveChat(msgs) { try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs)); } catch(e) {} }

const DL = ["Mo","Di","Mi","Do","Fr"];

function AiChat({days,onUpdateDay,di,footerVisible}){
const initMsg = {role:"assistant",content:"Ich kann deinen Trainingsplan anpassen:\n\n\u2022 Übungen tauschen oder entfernen\n\u2022 Sätze, Zeiten oder Pausen ändern\n\u2022 Fokus auf bestimmte Muskelgruppen\n\u2022 Training kürzer oder länger machen\n\u2022 Kompletten Wochenplan umbauen",id:"init"};
const [open,setOpen]=useState(false);
const [msgs,setMsgs]=useState(()=>loadChat()||[initMsg]);
const [inp,setInp]=useState("");
const [ld,setLd]=useState(false);
const endRef=useRef(null),iRef=useRef(null);

// Persist chat
const updateMsgs = (fn) => { setMsgs(prev => { const next = typeof fn === "function" ? fn(prev) : fn; saveChat(next); return next; }); };

useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,ld]);

const ctx=()=>{return days.map((d,i)=>{const s=[];["warmup","main","cooldown"].forEach(k=>{if(d[k]?.length)s.push(`${k}:${d[k].map(e=>`${e.name}(${e.detail})`).join(",")}`);});return`${DL[i]}-${d.title}\n${s.join("\n")}`;}).join("\n\n");};

// Parse JSON blocks from AI response, return {text, proposals[]}
const parseResponse = (txt) => {
  const blocks = txt.match(/```json\s*([\s\S]*?)\s*```/g) || [];
  const clean = txt.replace(/```json[\s\S]*?```/g,"").trim();
  const proposals = [];
  for (const block of blocks) {
    const raw = block.replace(/```json\s*/,"").replace(/\s*```/,"");
    try {
      const p = JSON.parse(raw);
      if (p.action==="update_day" && typeof p.dayIndex==="number" && p.changes) {
        proposals.push({ dayIndex: p.dayIndex, dayLabel: DL[p.dayIndex]||"?", changes: p.changes, status: "pending" });
      }
    } catch(e) {}
  }
  return { text: clean, proposals };
};

const send = async () => {
  const t = inp.trim(); if (!t || ld) return;
  setInp(""); if(iRef.current) iRef.current.style.height = "auto";
  const userMsg = { role:"user", content:t, id: Date.now()+"u" };
  updateMsgs(p => [...p, userMsg]);
  setLd(true);

  try {
    const c = `AKTUELLER PLAN:\n${ctx()}\n\nAusgewählter Tag: ${DL[di]} (Index ${di})\n\nAnfrage: ${t}`;
    // Build API history (skip init, only user/assistant text)
    const hist = msgs.filter(m => m.role === "user" || m.role === "assistant").slice(-8).map(m => ({role:m.role, content: m.content}));
    const apiMsgs = [...hist, {role:"user", content:c}];

    const r = await fetch("/api/chat", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({system:SYS, messages:apiMsgs})
    });

    if (!r.ok) {
      let errData = {};
      try { errData = await r.json(); } catch(e) {}
      throw { code: errData.errorCode || 'UNKNOWN', status: r.status, retryAfter: errData.retryAfter, detail: errData.detail };
    }

    const d = await r.json();
    const fullText = d.content?.map(b => b.type==="text" ? b.text : "").join("") || "Keine Antwort erhalten.";

    const { text, proposals } = parseResponse(fullText);
    const aiMsg = { role:"assistant", content: text, id: Date.now()+"a", proposals: proposals.length ? proposals : undefined };
    updateMsgs(p => [...p, aiMsg]);
  } catch(e) {
    console.error("Chat error:", e);
    const msg = formatError(e);
    updateMsgs(p => [...p, { role:"assistant", content: msg, id:Date.now()+"e" }]);
  }
  setLd(false);
};

function formatError(e) {
  // Network / fetch failures
  if (e instanceof TypeError || e.message?.includes("fetch") || e.message?.includes("Failed")) {
    return "**Keine Verbindung zum Server.** Prüfe deine Internetverbindung und versuche es erneut.";
  }

  const code = e.code || '';
  const retry = e.retryAfter;

  switch(code) {
    case 'RATE_LIMIT': {
      if (retry) {
        const min = Math.ceil(retry / 60);
        return `**Nutzungslimit erreicht.** Bitte warte ${min > 1 ? `${min} Minuten` : "eine Minute"} und versuche es dann erneut.`;
      }
      return "**Nutzungslimit erreicht.** Bitte warte ein paar Minuten und versuche es dann erneut.";
    }
    case 'AUTH_FAILED':
      return "**Authentifizierung fehlgeschlagen.** Der API-Schlüssel ist ungültig oder abgelaufen. Bitte in den Vercel-Einstellungen prüfen.";
    case 'NO_API_KEY':
      return "**Kein API-Schlüssel konfiguriert.** Bitte den Anthropic API-Key in den Vercel-Umgebungsvariablen hinterlegen.";
    case 'OVERLOADED':
      return "**Der KI-Service ist gerade überlastet.** Das passiert bei hoher Nachfrage. Bitte in 1–2 Minuten nochmal versuchen.";
    case 'TIMEOUT':
      return "**Die Anfrage hat zu lange gedauert.** Versuche eine kürzere Anfrage — z.B. nur einen einzelnen Tag ändern statt den ganzen Wochenplan.";
    case 'BAD_REQUEST':
      return `**Die Anfrage konnte nicht verarbeitet werden.** ${e.detail ? e.detail : "Versuche eine einfachere Formulierung."}`;
    case 'NETWORK':
      return "**Netzwerkfehler.** Der Server konnte den KI-Dienst nicht erreichen. Bitte in ein paar Sekunden erneut versuchen.";
    case 'SERVER_ERROR':
      return "**Serverfehler.** Es gibt ein technisches Problem. Bitte in ein paar Minuten erneut versuchen.";
    default:
      if (e.status >= 500) return "**Serverfehler.** Bitte in ein paar Minuten erneut versuchen.";
      if (e.status === 0 || !e.status) return "**Keine Verbindung.** Prüfe deine Internetverbindung und versuche es erneut.";
      return `**Unbekannter Fehler** (${e.status || ""}). Bitte erneut versuchen.`;
  }
}

// Accept a single proposal
const acceptProposal = (msgId, proposalIdx) => {
  setMsgs(prev => {
    const next = prev.map(m => {
      if (m.id !== msgId || !m.proposals) return m;
      const p = m.proposals[proposalIdx];
      if (!p || p.status !== "pending") return m; // already handled
      onUpdateDay(p.dayIndex, p.changes);
      const updated = m.proposals.map((pr,j) => j === proposalIdx ? {...pr, status:"accepted"} : pr);
      return {...m, proposals: updated};
    });
    saveChat(next);
    return next;
  });
};

// Reject a single proposal
const rejectProposal = (msgId, proposalIdx) => {
  setMsgs(prev => {
    const next = prev.map(m => {
      if (m.id !== msgId || !m.proposals) return m;
      const p = m.proposals[proposalIdx];
      if (!p || p.status !== "pending") return m;
      // Do NOT call onUpdateDay — just mark as rejected
      const updated = m.proposals.map((pr,j) => j === proposalIdx ? {...pr, status:"rejected"} : pr);
      return {...m, proposals: updated};
    });
    saveChat(next);
    return next;
  });
};

// Accept all still-pending proposals in a message
const acceptAll = (msgId) => {
  setMsgs(prev => {
    const next = prev.map(m => {
      if (m.id !== msgId || !m.proposals) return m;
      const updated = m.proposals.map(p => {
        if (p.status !== "pending") return p; // skip already accepted/rejected
        onUpdateDay(p.dayIndex, p.changes);
        return {...p, status:"accepted"};
      });
      return {...m, proposals: updated};
    });
    saveChat(next);
    return next;
  });
};

const clearChat = () => { updateMsgs([initMsg]); };

// ═══ CLOSED STATE: floating button ═══
if(!open) return(
  <button onClick={()=>{setOpen(true);setTimeout(()=>iRef.current?.focus(),300);}}
    style={{position:"fixed",bottom:footerVisible?"max(76px,calc(72px + env(safe-area-inset-bottom)))":"max(24px,calc(16px + env(safe-area-inset-bottom)))",right:16,width:48,height:48,borderRadius:"50%",background:C.text,color:"#fff",zIndex:9999,boxShadow:"0 4px 16px rgba(0,0,0,0.3)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8M8 13h4" opacity="0.5"/></svg>
  </button>
);

// ═══ OPEN STATE ═══
return(
<div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",flexDirection:"column",background:"rgba(44,41,37,0.25)",backdropFilter:"blur(8px)"}}>
<style>{`@keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fi{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.csl{animation:su .25s ease-out}.mi{animation:fi .2s ease-out}`}</style>
<div style={{flexShrink:0,height:48}} onClick={()=>setOpen(false)}/>
<div className="csl" style={{flex:1,display:"flex",flexDirection:"column",borderRadius:"16px 16px 0 0",overflow:"hidden",background:C.bg,maxHeight:"calc(100vh - 48px)"}}>

{/* Header */}
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${C.border}`}}>
  <div>
    <div style={{fontSize:14,fontWeight:600,color:C.text}}>Plan-Assistent</div>
    <div style={{fontSize:11,color:C.muted}}>Trainingsplan anpassen</div>
  </div>
  <div style={{display:"flex",gap:8,alignItems:"center"}}>
    {msgs.length > 1 && <button onClick={clearChat} style={{fontSize:11,color:C.muted,background:"none",border:"none",cursor:"pointer",padding:"4px 8px"}}>Chat leeren</button>}
    <button onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:"50%",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
</div>

{/* Messages */}
<div style={{flex:1,overflowY:"auto",padding:"16px 16px",display:"flex",flexDirection:"column",gap:8}}>
{msgs.map((m,i)=>(
<div key={m.id||i} className="mi" style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start",gap:6}}>
  {/* Message bubble */}
  <div style={{maxWidth:"85%",borderRadius:16,padding:"10px 14px",fontSize:14,lineHeight:1.5,
    background:m.role==="user"?C.accent:C.card,color:m.role==="user"?"#fff":C.text,
    border:m.role!=="user"?`1px solid ${C.border}`:undefined,
    borderBottomRightRadius:m.role==="user"?6:16,borderBottomLeftRadius:m.role!=="user"?6:16}}>
    {m.role==="user"?<span style={{whiteSpace:"pre-wrap"}}>{m.content}</span>:<MdText text={m.content} color={C.text}/>}
  </div>

  {/* Proposal cards */}
  {m.proposals?.map((p,pi) => (
    <div key={pi} style={{maxWidth:"85%",borderRadius:12,padding:"10px 14px",fontSize:13,
      background:p.status==="accepted"?C.doneBg:p.status==="rejected"?"#fafafa":C.accentSoft,
      border:`1px solid ${p.status==="accepted"?C.done:p.status==="rejected"?"#e0e0e0":C.accent}30`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        {p.status==="accepted" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.done} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
        {p.status==="rejected" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>}
        <span style={{fontWeight:600,color:p.status==="accepted"?C.done:p.status==="rejected"?C.muted:C.text}}>
          {p.dayLabel}: {p.changes.title || "Anpassung"}
        </span>
      </div>
      {/* Show exercise summary */}
      <div style={{fontSize:12,color:C.muted,marginBottom:p.status==="pending"?8:0}}>
        {["warmup","main","cooldown"].map(k => p.changes[k]?.length ? `${k}: ${p.changes[k].map(e=>e.name).join(", ")}` : null).filter(Boolean).join(" · ")}
        {p.changes.pauseEx && ` · Pause: ${p.changes.pauseEx}s`}
      </div>
      {/* Action buttons — only for pending */}
      {p.status==="pending" && (
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>acceptProposal(m.id,pi)} style={{padding:"5px 14px",borderRadius:8,border:"none",background:C.accent,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            Übernehmen
          </button>
          <button onClick={()=>rejectProposal(m.id,pi)} style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.muted,fontSize:12,cursor:"pointer"}}>
            Verwerfen
          </button>
        </div>
      )}
      {p.status==="accepted" && <span style={{fontSize:11,color:C.done}}>Übernommen</span>}
      {p.status==="rejected" && <span style={{fontSize:11,color:C.muted}}>Verworfen</span>}
    </div>
  ))}

  {/* Accept all button when multiple pending proposals */}
  {m.proposals && m.proposals.filter(p=>p.status==="pending").length > 1 && (
    <button onClick={()=>acceptAll(m.id)} style={{padding:"6px 16px",borderRadius:8,border:"none",background:C.text,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",alignSelf:"flex-start"}}>
      Alle übernehmen
    </button>
  )}
</div>
))}
{ld && <div className="mi" style={{display:"flex",justifyContent:"flex-start"}}><div style={{borderRadius:16,padding:"12px 16px",display:"flex",gap:6,alignItems:"center",background:C.card,border:`1px solid ${C.border}`,borderBottomLeftRadius:6}}>{[0,1,2].map(j=><span key={j} style={{width:6,height:6,borderRadius:"50%",background:C.border,animation:`pulse 1.2s ease-in-out ${j*0.15}s infinite`}}/>)}</div></div>}
<div ref={endRef}/>
</div>

{/* Quick actions */}
<div style={{padding:"0 16px 8px",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
  {[`${DL[di]} kürzer`,"Übung tauschen","Mehr Schultern","Plan zeigen"].map((q,j)=>(
    <button key={j} onClick={()=>setInp(q)} style={{flexShrink:0,padding:"6px 12px",borderRadius:20,fontSize:12,fontWeight:500,border:`1px solid ${C.border}`,background:"transparent",color:C.sub,cursor:"pointer",whiteSpace:"nowrap"}}>{q}</button>
  ))}
</div>

{/* Input */}
<div style={{padding:"8px 16px 12px",paddingBottom:"max(12px, env(safe-area-inset-bottom))"}}>
  <div style={{display:"flex",alignItems:"center",gap:8,borderRadius:12,border:`1px solid ${C.border}`,background:C.card,padding:"6px 10px",minHeight:40}}>
    <textarea ref={iRef} value={inp}
      onChange={e=>{setInp(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,100)+"px";}}
      placeholder="Plan anpassen..."
      rows={1} disabled={ld}
      style={{flex:1,border:"none",outline:"none",resize:"none",background:"transparent",color:C.text,fontSize:16,lineHeight:"24px",padding:"2px 0",margin:0,maxHeight:100,fontFamily:"inherit",display:"block"}}/>
    <button onClick={send} disabled={!inp.trim()||ld}
      style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:inp.trim()&&!ld?C.accent:"#d6d3d1",color:"#fff",transition:"background 0.2s"}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  </div>
</div>

</div>
</div>
);
}

/* ═══ PERSISTENCE ═══ */
const SK="mam-training-plan";
function loadPlan(){try{const s=localStorage.getItem(SK);if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length===5)return p;}}catch(e){}return null;}
function savePlan(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){}}

/* ═══ APP ═══ */
export default function App(){
const [days,setDays]=useState(()=>loadPlan()||JSON.parse(JSON.stringify(DEFAULT_DAYS)));
const [dayIdx,setDayIdx]=useState(()=>({1:0,2:1,3:2,4:3,5:4})[new Date().getDay()]??0);
const [cur,setCur]=useState(-1);
const [phase,setPhase]=useState(0);
const [rem,setRem]=useState(0);
const [inSP,setInSP]=useState(false);
const [running,setRunning]=useState(false);
const [done,setDone]=useState(new Set());

const tick=useRef(null),beep=useBeep(),sRef=useRef(null),pAdv=useRef(false);

useWakeLock(cur>=0);
const isI=useRef(true);useEffect(()=>{if(isI.current){isI.current=false;return;}savePlan(days);},[days]);

const day=days[dayIdx],tl=buildTimeline(day),step=cur>=0&&cur<tl.length?tl[cur]:null;
const totSec=totalSeconds(tl);
let dSec=0;for(let i=0;i<tl.length;i++){const s=tl[i];if(done.has(i)){if(s.type==="exercise")dSec+=s.totalPhases*s.secPerPhase+(s.totalSets-1)*s.setPause;else dSec+=s.seconds;}else if(i===cur&&s.type==="exercise"){dSec+=phase*s.secPerPhase+(s.secPerPhase-rem);}else if(i===cur){dSec+=s.seconds-rem;}}
const pct=totSec>0?Math.min(100,dSec/totSec*100):0;
const allDone=done.size===tl.length&&tl.length>0;
const cSide=step?.type==="exercise"&&step.sides?(phase%2===0?"L":"R"):null;
const cSet=step?.type==="exercise"?Math.floor(phase/(step.sides?2:1))+1:0;

const resetPlan=()=>{if(confirm("Plan auf Standard zurücksetzen?")){try{localStorage.removeItem(SK);}catch(e){}setDays(JSON.parse(JSON.stringify(DEFAULT_DAYS)));clearInterval(tick.current);setCur(-1);setPhase(0);setRem(0);setRunning(false);setDone(new Set());pAdv.current=false;}};
const updDay=useCallback((i,ch)=>{setDays(p=>{const n=JSON.parse(JSON.stringify(p));if(i>=0&&i<n.length)Object.keys(ch).forEach(k=>{n[i][k]=ch[k];});return n;});if(i===dayIdx){clearInterval(tick.current);setCur(-1);setPhase(0);setRem(0);setRunning(false);setDone(new Set());pAdv.current=false;}},[dayIdx]);

useEffect(()=>{clearInterval(tick.current);setCur(-1);setPhase(0);setRem(0);setRunning(false);setDone(new Set());setInSP(false);},[dayIdx]);
useEffect(()=>{if(cur<0||cur>=tl.length)return;const s=tl[cur];setPhase(0);setInSP(false);setRem(s.type==="exercise"?s.secPerPhase:s.seconds);
if(pAdv.current) setRunning(true); else setRunning(false);
pAdv.current=false;},[cur]);

useEffect(()=>{
if(!running||cur<0)return;
tick.current=setInterval(()=>{setRem(r=>{
if(r<=1){clearInterval(tick.current);const s=tl[cur];
if(s.type==="exercise"){
  if(inSP){
    // Set pause just finished — now advance phase and start next set/side
    const np=phase+1;
    beep(660,0.1);setPhase(np);setInSP(false);setRem(s.secPerPhase);setTimeout(()=>setRunning(true),50);
  } else {
    const np=phase+1;
    if(np<s.totalPhases){
      const pps=s.sides?2:1;
      const needP=(np%pps===0)&&np<s.totalPhases;
      if(needP&&s.setPause>0){
        // Phase done, need set pause BEFORE advancing phase counter
        beep(880,0.18);setTimeout(()=>beep(660,0.12),150);
        setInSP(true);setRem(s.setPause);
        // DON'T advance phase yet — keep current set number visible during pause
        setTimeout(()=>setRunning(true),50);
      } else {
        // Side switch within same set — advance phase immediately
        beep(880,0.15);setTimeout(()=>beep(660,0.1),140);
        setPhase(np);setInSP(false);setRem(s.secPerPhase);setTimeout(()=>setRunning(true),50);
      }
    } else {
      // Exercise fully complete
      beep(880,0.25);setTimeout(()=>beep(1100,0.2),150);setTimeout(()=>beep(1320,0.15),300);
      setDone(p=>{const n=new Set(p);n.add(cur);return n;});setInSP(false);
      if(cur<tl.length-1){pAdv.current=true;setTimeout(()=>setCur(c=>c+1),600);}else setRunning(false);
    }
  }
}else{
  // Pause/section done
  beep(880,0.2);setTimeout(()=>beep(1100,0.15),140);
  setDone(p=>{const n=new Set(p);n.add(cur);return n;});
  if(cur<tl.length-1){pAdv.current=true;setTimeout(()=>setCur(c=>c+1),400);}else setRunning(false);
}return 0;}
// Loud countdown for last 3 seconds
if(r<=3){beep(r===1?1200:r===2?1000:800, 0.2);}
else if(r<=5&&!inSP&&step?.type==="exercise")beep(500,0.05);
return r-1;});},1000);
return()=>clearInterval(tick.current);
},[running,cur,phase,inSP]);

useEffect(()=>{sRef.current?.scrollIntoView({behavior:"smooth",block:"center"});},[cur]);

const toggle=()=>{if(rem<=0&&step?.type==="exercise"){setRem(step.secPerPhase);setRunning(true);return;}setRunning(!running);};
const skip=()=>{clearInterval(tick.current);setDone(p=>{const n=new Set(p);n.add(cur);return n;});setInSP(false);if(cur<tl.length-1){pAdv.current=true;setCur(c=>c+1);}else setRunning(false);};
const prev=()=>{if(cur<=0)return;clearInterval(tick.current);setInSP(false);setRunning(false);let t=cur-1;while(t>0&&tl[t].type!=="exercise")t--;setDone(p=>{const n=new Set(p);n.delete(cur);n.delete(t);return n;});pAdv.current=false;setCur(t);};
const restart=()=>{clearInterval(tick.current);setPhase(0);setInSP(false);if(step?.type==="exercise")setRem(step.secPerPhase);else setRem(step?.seconds||0);setRunning(false);};
const startW=()=>{pAdv.current=true;setCur(0);};
const resetW=()=>{clearInterval(tick.current);setCur(-1);setPhase(0);setRem(0);setRunning(false);setDone(new Set());setInSP(false);pAdv.current=false;};

const secs=[];let cS={label:"Warmup",items:[]};
tl.forEach((s,i)=>{if(s.type==="section"){if(cS.items.length)secs.push(cS);cS={label:s.label,items:[],tIdx:i};}else cS.items.push({...s,idx:i});});
if(cS.items.length)secs.push(cS);

return(
<>
<div className="min-h-screen pb-28" style={{background:C.bg,color:C.text}}>
<style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>

{/* HEADER */}
<div className="sticky top-0 z-40" style={{background:"rgba(250,249,247,0.92)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`}}>
<div className="max-w-lg mx-auto px-5 pb-3" style={{paddingTop:"max(12px,env(safe-area-inset-top))"}}>
  <div className="flex items-center justify-between mb-2.5">
    <div>
      <h1 className="text-xs font-semibold tracking-widest uppercase" style={{color:C.accent}}>My Active Morning</h1>
      <p className="text-sm font-bold mt-0.5">{day.title} <span className="font-normal" style={{color:C.muted}}>{Math.round(totSec/60)} min</span></p>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold tabular-nums" style={{color:C.text}}>{Math.round(pct)}%</span>
    </div>
  </div>
  <div className="w-full h-1 rounded-full overflow-hidden" style={{background:C.border}}>
    <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`,background:C.accent}}/>
  </div>
  <div className="flex mt-2.5 gap-1">
    {days.map((d,i)=>(<button key={d.id} onClick={()=>setDayIdx(i)} className="flex-1 py-1.5 text-xs font-semibold transition-all rounded-lg" style={i===dayIdx?{background:C.text,color:"#fff"}:{color:C.muted}}>{d.label}</button>))}
  </div>
</div>
</div>

<div className="max-w-lg mx-auto px-5 pt-5">

{cur<0&&!allDone&&(
  <button onClick={startW} className="w-full py-3.5 rounded-xl text-white font-semibold text-sm mb-6 active:scale-[0.98] transition-all" style={{background:C.accent}}>Workout starten</button>
)}

{allDone&&(
  <div className="text-center py-10 mb-4">
    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:C.doneBg}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.done} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div className="text-base font-bold">Geschafft</div>
    <p className="text-sm mt-1" style={{color:C.muted}}>{Math.round(totSec/60)} Minuten</p>
    <button onClick={resetW} className="mt-4 px-5 py-2 rounded-lg text-sm font-medium transition-colors" style={{color:C.done,background:C.doneBg}}>Wiederholen</button>
  </div>
)}

{secs.map((sec,si)=>(
<div key={si} className="mb-5">
  <div className="flex items-center gap-3 mb-2">
    <span className="text-xs font-semibold tracking-wide uppercase" style={{color:C.muted}}>{sec.label}</span>
    <div className="flex-1 h-px" style={{background:C.border}}/>
    {sec.tIdx!==undefined&&cur===sec.tIdx&&!done.has(sec.tIdx)&&(
      <span ref={sRef} className="text-xs tabular-nums font-semibold" style={{color:C.accent}}>{fmt(rem)}</span>
    )}
  </div>
  <div className="space-y-1.5">
  {sec.items.map(s=>{
    const i=s.idx,active=i===cur,isDone=done.has(i);

    if(s.type==="pause"){
      if(isDone&&!active)return <div key={i} className="h-px mx-6" style={{background:C.border}}/>;
      const pp=active&&s.seconds>0?((s.seconds-rem)/s.seconds)*100:0;
      return(<div key={i} ref={active?sRef:null} className="flex items-center gap-2 px-3 py-1">
        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{background:C.border}}>
          {active&&<div className="h-full rounded-full transition-all duration-1000" style={{width:`${pp}%`,background:C.accent}}/>}
        </div>
        <span className="text-xs tabular-nums font-medium" style={{minWidth:24,textAlign:"right",color:C.muted}}>{isDone?"":active?fmt(rem):fmt(s.seconds)}</span>
      </div>);
    }

    /* EXERCISE CARD */
    const totalPh=s.totalPhases;
    const numSetPauses = s.totalSets - 1;
    const totalExSec = totalPh * s.secPerPhase + numSetPauses * s.setPause;
    let exPct = isDone ? 100 : 0;
    if (active && !isDone && totalExSec > 0) {
      /*
       * With deferred phase increment:
       * - During exercise: phase = current (0-indexed), exercise is in progress
       *   → completed phases = phase, current exercise progress = secPerPhase - rem
       * - During set pause (inSP): phase = same as before pause, exercise is DONE
       *   → completed phases = phase + 1, current pause progress = setPause - rem
       */
      let elapsed;
      if (inSP) {
        const donePhases = phase + 1;
        const donePauses = Math.min(phase, numSetPauses); // pauses before this one
        elapsed = donePhases * s.secPerPhase + donePauses * s.setPause + (s.setPause - rem);
      } else {
        const donePauses = Math.min(phase, numSetPauses); // phase 0 = 0 pauses before, phase 1 = 1 pause before
        elapsed = phase * s.secPerPhase + donePauses * s.setPause + (s.secPerPhase - rem);
      }
      exPct = Math.min(100, (elapsed / totalExSec) * 100);
    }

    return(<div key={i} ref={active?sRef:null}
      onClick={()=>{if(!active&&!isDone&&!running)setExp(exp===i?-1:i);}}
      className={`rounded-xl transition-all overflow-hidden ${isDone?"opacity-30":""} ${!active&&!isDone?"cursor-pointer":""}`}
      style={{background:isDone?"transparent":C.card,
        boxShadow:active&&!isDone?`0 2px 16px ${C.accent}10, 0 0 0 1px ${C.accent}30`:isDone?"none":`0 0 0 1px ${C.border}`}}>

      {/* Progress bar — INSIDE rounded corners via overflow:hidden on parent */}
      {active&&!isDone&&s.totalPhases>1&&(
        <div className="h-1" style={{background:C.border}}>
          <div className="h-full transition-all duration-500" style={{width:`${exPct}%`,background:C.accent,borderRadius:"0 2px 2px 0"}}/>
        </div>
      )}

      <div style={{padding:"10px 14px",display:"flex",alignItems:"flex-start",gap:12}}>
        {isDone?(
          <div style={{width:36,height:36,borderRadius:"50%",background:C.doneBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.done} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        ):(
          <div style={{marginTop:1}}>
          <Ring pct={active&&!inSP?(s.secPerPhase>0?((s.secPerPhase-rem)/s.secPerPhase)*100:0):0} size={38} sw={active?3:2}>
            <span style={{fontSize:12,fontWeight:600,color:active?C.text:C.muted,fontVariantNumeric:"tabular-nums"}}>
              {active&&running?fmt(rem):fmt(s.secPerPhase)}
            </span>
          </Ring>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14,fontWeight:600,color:isDone?C.muted:C.text,opacity:isDone?0.5:1}}>{s.name}</span>
            {s.tag&&<span style={{fontSize:12,color:C.muted}}>{s.tag}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.muted}}>{s.detail}</span>
            {active&&!isDone&&s.totalSets>1&&<span style={{fontSize:12,fontWeight:600,color:C.accent,fontVariantNumeric:"tabular-nums"}}>Satz {cSet}/{s.totalSets}</span>}
            {active&&!isDone&&cSide&&<span style={{fontSize:12,fontWeight:600,color:C.sub}}>{cSide==="L"?"Links":"Rechts"}</span>}
            {active&&inSP&&<span style={{fontSize:12,fontWeight:500,color:C.accent}}>Satzpause {fmt(rem)}</span>}
          </div>
          {!isDone&&<p style={{fontSize:11,lineHeight:1.4,color:C.muted,margin:"4px 0 0"}}>{s.desc}</p>}
        </div>
        {/* YouTube icon top-right */}
        {!isDone&&s.yt&&(
          <a href={ytUrl(s.yt)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
            style={{flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:6,color:"#c4302b",opacity:0.6}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.4-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
          </a>
        )}
      </div>
    </div>);
  })}
  </div>
</div>
))}

{done.size>0&&!allDone&&(<button onClick={resetW} className="w-full py-2 rounded-lg text-xs font-medium mt-2 transition-colors" style={{color:C.muted}}>Workout zurücksetzen</button>)}
<button onClick={resetPlan} className="w-full py-2 rounded-lg text-xs mt-4 mb-6 transition-colors" style={{color:C.border}}>Plan auf Standard zurücksetzen</button>
</div>

{/* ═══ COMPACT CONTROL BAR ═══ */}
{cur>=0&&step&&!allDone&&(
<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40}}>
  <div style={{maxWidth:480,margin:"0 auto",padding:"0 20px",paddingBottom:"max(16px, env(safe-area-inset-bottom))"}}>
    <div style={{background:C.text,borderRadius:R,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
      <Ring pct={step.type==="exercise"?(inSP?100:(step.secPerPhase>0?((step.secPerPhase-rem)/step.secPerPhase)*100:0)):(step.seconds>0?((step.seconds-rem)/step.seconds)*100:0)} size={40} sw={3}>
        <span style={{fontSize:13,fontWeight:700,color:"#fff",fontVariantNumeric:"tabular-nums"}}>{fmt(rem)}</span>
      </Ring>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.9)"}}>
          {step.type==="pause"||step.type==="section"?"Pause":(inSP?"Satzpause":step.name)}{cSide&&!inSP?` · ${cSide==="L"?"L":"R"}`:""}
        </div>
        {step.type==="exercise"&&step.totalSets>1&&(
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontVariantNumeric:"tabular-nums",marginTop:1}}>Satz {cSet}/{step.totalSets}</div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <button onClick={prev} disabled={cur<=0} style={{width:34,height:34,borderRadius:R,border:"none",background:"rgba(255,255,255,0.1)",cursor:cur>0?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",opacity:cur>0?1:0.25,color:"#fff"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20l-10-8 10-8V20zM5 20V4h2v16H5z"/></svg>
        </button>
        <button onClick={restart} style={{width:34,height:34,borderRadius:R,border:"none",background:"rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button onClick={toggle} style={{width:42,height:42,borderRadius:R,border:"none",background:running?"#fff":C.accent,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:running?C.text:"#fff",transition:"background 0.15s"}}>
          {running?(<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>):(<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>)}
        </button>
        <button onClick={skip} style={{width:34,height:34,borderRadius:R,border:"none",background:"rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zM19 4v16h-2V4h2z"/></svg>
        </button>
      </div>
    </div>
  </div>
</div>
)}

</div>
<AiChat days={days} onUpdateDay={updDay} di={dayIdx} footerVisible={cur>=0&&step&&!allDone}/>
</>
);
}
