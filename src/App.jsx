import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ HELPERS ═══ */
const parseSec = d => { const m=d.match(/(\d+)\s*Sek/); if(m)return+m[1]; const m2=d.match(/(\d+)\s*Min/); if(m2)return m2[1]*60; return 0; };
const parseSets = d => { const m=d.match(/^(\d+)×/); return m?+m[1]:1; };
const hasSides = d => /Seite|\/Bein|\/Arm/.test(d);
const ytUrl = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q.replace(/\+/g," "))}`;
const fmt = s => { const m=Math.floor(s/60),r=s%60; return m?`${m}:${r.toString().padStart(2,"0")}`:`${r}`; };

/* ═══ DEFAULT EXERCISE DATA ═══ */
const DEFAULT_DAYS=[
{id:"mo",label:"MO",title:"Oberkörper + Core",color:"#2E7D32",accent:"#43A047",icon:"💪",pauseEx:60,pauseCore:45,
warmup:[
{name:"Cat-Cow",detail:"60 Sek.",desc:"Vierfüßlerstand, fließend Buckel und Hohlkreuz.",yt:"cat+cow+übung+anleitung+deutsch"},
{name:"World's Greatest Stretch",detail:"40 Sek./Seite",desc:"Ausfallschritt, Hand neben Fuß, Arm zur Decke.",yt:"worlds+greatest+stretch+anleitung"},
{name:"Schulter-CARs",detail:"30 Sek./Arm",desc:"Arm in großem Kreis langsam rotieren.",yt:"shoulder+CARs+mobility+übung+anleitung"},
],
main:[
{name:"Knie-Liegestütze",detail:"3×40 Sek.",desc:"Hände schulterbreit, Knie am Boden. Kontrolliert hoch und runter.",yt:"knie+liegestütze+anfänger+richtige+ausführung",tag:"Brust"},
{name:"Tisch-Rudern",detail:"3×40 Sek.",desc:"Tischkante greifen, Brust zur Kante ziehen, langsam ablassen.",yt:"bodyweight+row+tisch+rudern+zuhause",tag:"Rücken"},
{name:"Stuhl-Dips",detail:"3×35 Sek.",desc:"Stuhlkante, Arme beugen bis 90°, hochdrücken.",yt:"stuhl+dips+trizeps+übung+anleitung",tag:"Trizeps"},
{name:"Pike Push-ups",detail:"3×30 Sek.",desc:"Hüfte hoch in V-Form, Kopf Richtung Boden senken.",yt:"pike+push+up+ausführung+deutsch+anleitung",tag:"Schultern"},
],
core:[
{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Rückenlage, Arme+Beine anheben. Rücken am Boden.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},
{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, alles anheben. Gesäß anspannen.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},
{name:"Plank",detail:"3×30 Sek.",desc:"Unterarme, Körper gerade, Bauch fest.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"},
],
cooldown:[
{name:"Brustdehnung Türrahmen",detail:"40 Sek./Seite",desc:"Unterarm am Rahmen, nach vorne lehnen.",yt:"brustdehnung+türrahmen+anleitung"},
{name:"Kindshaltung",detail:"45 Sek.",desc:"Knie am Boden, Arme strecken, Stirn ab.",yt:"childs+pose+yoga+anleitung+deutsch"},
{name:"Kobra-Stretch",detail:"30 Sek.",desc:"Bauchlage, Arme strecken, Hüfte am Boden.",yt:"cobra+stretch+yoga+rücken+anleitung"},
]},

{id:"di",label:"DI",title:"Unterkörper + Core",color:"#1565C0",accent:"#42A5F5",icon:"🦵",pauseEx:45,pauseCore:30,
warmup:[
{name:"Cat-Cow",detail:"45 Sek.",desc:"Fließend Buckel und Hohlkreuz.",yt:"cat+cow+übung+anleitung+deutsch"},
{name:"Hüft-CARs",detail:"30 Sek./Bein",desc:"Knie anheben, großer Kreis.",yt:"hip+CARs+mobility+übung+hüfte"},
{name:"Tiefe Kniebeuge",detail:"45 Sek.",desc:"Fersen am Boden, Ellbogen gegen Knie.",yt:"deep+squat+hold+mobility+deutsch"},
],
main:[
{name:"Kniebeugen",detail:"3×40 Sek.",desc:"Schulterbreit, tief gehen, Rücken gerade.",yt:"bodyweight+kniebeugen+richtige+ausführung",tag:"Beine"},
{name:"Reverse Lunges",detail:"3×30 Sek./Seite",desc:"Schritt nach hinten, Knie zum Boden, zurück auf der Stelle.",yt:"reverse+lunges+anleitung+auf+der+stelle",tag:"Beine"},
{name:"Glute Bridges",detail:"3×35 Sek.",desc:"Rückenlage, Hüfte hoch bis Linie entsteht.",yt:"glute+bridge+anleitung+anfänger",tag:"Gesäß"},
{name:"Wadenheben",detail:"3×30 Sek.",desc:"Treppenabsatz, voller Bewegungsumfang.",yt:"wadenheben+stehend+anleitung+bodyweight",tag:"Waden"},
],
core:[
{name:"Dead Bugs",detail:"3×25 Sek./Seite",desc:"Arme senkrecht, gegengleich strecken.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Bauch"},
{name:"Side Plank",detail:"3×20 Sek./Seite",desc:"Unterarm stützen, Körper seitlich gerade.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Obliques"},
{name:"Superman Hold",detail:"3×25 Sek.",desc:"Bauchlage, alles anheben.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},
],
cooldown:[
{name:"Tauben-Stretch",detail:"30 Sek./Seite",desc:"Vorderbein angewinkelt, in Dehnung atmen.",yt:"pigeon+stretch+hüfte+dehnen+anleitung"},
{name:"Oberschenkel-Dehnung",detail:"30 Sek./Bein",desc:"Fuß zum Gesäß ziehen.",yt:"quadrizeps+dehnung+stehend+anleitung"},
{name:"Wadendehnung",detail:"25 Sek./Seite",desc:"Wand, Ferse in den Boden.",yt:"wadendehnung+wand+anleitung"},
]},

{id:"mi",label:"MI",title:"Mobility & Beweglichkeit",color:"#7B1FA2",accent:"#AB47BC",icon:"🧘",pauseEx:15,pauseCore:15,
warmup:[
{name:"Cat-Cow",detail:"60 Sek.",desc:"Bewusst langsam, Atmung betonen.",yt:"cat+cow+übung+anleitung+deutsch"},
{name:"Schulter-CARs",detail:"45 Sek./Arm",desc:"Maximaler Radius, kontrolliert.",yt:"shoulder+CARs+mobility+übung+anleitung"},
{name:"Hüft-CARs",detail:"45 Sek./Bein",desc:"So groß wie möglich rotieren.",yt:"hip+CARs+mobility+übung+hüfte"},
],
main:[
{name:"World's Greatest Stretch",detail:"60 Sek./Seite",desc:"Ausfallschritt, Arm zur Decke. Langsam & tief.",yt:"worlds+greatest+stretch+mobility+flow",tag:"Ganzkörper"},
{name:"Tiefer Squat-Flow",detail:"2 Min.",desc:"Tiefe Hocke, Ellbogen gegen Knie. Sanft wippen.",yt:"deep+squat+hold+mobility+routine",tag:"Hüfte"},
{name:"Tauben-Pose",detail:"60 Sek./Seite",desc:"Vorderbein angewinkelt, in die Dehnung atmen.",yt:"pigeon+pose+yoga+anleitung+deutsch",tag:"Hüfte"},
{name:"Brücke vom Boden",detail:"5×20 Sek.",desc:"Hüfte hoch, Brust öffnen, Schultern in Boden.",yt:"glute+bridge+brücke+mobility",tag:"Wirbelsäule"},
{name:"Thorakale Rotation",detail:"50 Sek./Seite",desc:"Vierfüßler, Ellbogen zur Decke drehen.",yt:"thorakale+rotation+vierfüßler+mobilität",tag:"BWS"},
{name:"Cobra-Stretch",detail:"5×20 Sek.",desc:"Bauchlage, Arme strecken. Hüfte am Boden.",yt:"cobra+stretch+yoga+rücken+deutsch",tag:"LWS"},
{name:"Scorpion-Stretch",detail:"45 Sek./Seite",desc:"Bauchlage, ein Bein über den Körper zur Gegenseite. Öffnet BWS und Hüfte.",yt:"scorpion+stretch+übung+mobility",tag:"BWS/Hüfte"},
],
core:[
{name:"Side Plank (Mobility)",detail:"45 Sek./Seite",desc:"Seitlich, Hüfte hoch, oberen Arm zur Decke.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Rumpf"},
{name:"Dead Bug (langsam)",detail:"40 Sek./Seite",desc:"Bewusst langsam, Atmung betonen.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Core"},
],
cooldown:[
{name:"Knie zur Brust",detail:"45 Sek./Seite",desc:"Rückenlage, Knie sanft zur Brust.",yt:"knie+zur+brust+rückenlage+dehnung"},
{name:"Wirbelsäulendrehung",detail:"50 Sek./Seite",desc:"Knie zur Seite, Blick gegenüber.",yt:"liegende+wirbelsäulendrehung+yoga+anleitung"},
{name:"Bauchatmung",detail:"90 Sek.",desc:"Tief atmen, komplett entspannen.",yt:"bauchatmung+entspannung+übung"},
]},

{id:"do",label:"DO",title:"Core Power + Oberkörper",color:"#E65100",accent:"#FF9100",icon:"🔥",pauseEx:30,pauseCore:25,
warmup:[
{name:"Cat-Cow",detail:"45 Sek.",desc:"Buckel und Hohlkreuz.",yt:"cat+cow+übung+anleitung+deutsch"},
{name:"World's Greatest Stretch",detail:"30 Sek./Seite",desc:"Ausfallschritt mit Rotation.",yt:"worlds+greatest+stretch+anleitung"},
{name:"Schulter-CARs",detail:"30 Sek./Arm",desc:"Große Kreise.",yt:"shoulder+CARs+mobility+übung+anleitung"},
],
main:[],
core:[
{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Bananenform halten, Rücken am Boden.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},
{name:"Bicycle Crunches",detail:"3×35 Sek.",desc:"Ellbogen zum Gegenknie rotieren.",yt:"bicycle+crunches+richtige+ausführung+deutsch",tag:"Obliques"},
{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, alles anheben.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},
{name:"Dead Bugs",detail:"3×25 Sek./Seite",desc:"Gegengleich strecken, Rücken am Boden.",yt:"dead+bug+übung+core+anleitung+deutsch",tag:"Bauch"},
{name:"Side Plank",detail:"3×25 Sek./Seite",desc:"Seitlich, Körper gerade halten.",yt:"side+plank+seitstütz+anleitung+deutsch",tag:"Obliques"},
{name:"Plank",detail:"3×40 Sek.",desc:"Unterarme, Körper gerade, Bauch fest.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"},
],
extra:[
{name:"Breite Liegestütze",detail:"3×30 Sek.",desc:"Weiter als schulterbreit aufstellen.",yt:"breite+liegestütze+ausführung+anleitung",tag:"Brust"},
{name:"Tisch-Rudern (eng)",detail:"3×30 Sek.",desc:"Enger Griff, Ellbogen am Körper vorbei.",yt:"bodyweight+row+tisch+rudern+zuhause",tag:"Rücken"},
],
cooldown:[
{name:"Brustdehnung Türrahmen",detail:"30 Sek./Seite",desc:"Unterarm am Rahmen.",yt:"brustdehnung+türrahmen+anleitung"},
{name:"Kobra-Stretch",detail:"30 Sek.",desc:"Arme strecken, Hüfte am Boden.",yt:"cobra+stretch+yoga+rücken+anleitung"},
{name:"Seitliche Rumpfdehnung",detail:"25 Sek./Seite",desc:"Arm über Kopf zur Seite.",yt:"seitliche+rumpfdehnung+stehend+anleitung"},
]},

{id:"fr",label:"FR",title:"Ganzkörper Kraft + Core",color:"#00695C",accent:"#26A69A",icon:"⚡",pauseEx:20,pauseCore:15,
warmup:[
{name:"Cat-Cow",detail:"60 Sek.",desc:"Buckel und Hohlkreuz, fließend.",yt:"cat+cow+übung+anleitung+deutsch"},
{name:"Hüft-CARs",detail:"40 Sek./Bein",desc:"Kontrolliert rotieren.",yt:"hip+CARs+mobility+übung+hüfte"},
{name:"Arm Circles + Hüftkreise",detail:"60 Sek.",desc:"Große Armkreise vorwärts/rückwärts, dann Hüften kreisen.",yt:"arm+circles+hüftkreise+warmup+anleitung"},
],
main:[
{name:"Squat to Stand",detail:"3×40 Sek.",desc:"Tiefe Kniebeuge, explosiv hoch, Arme über Kopf schwingen. Leise, kein Sprung.",yt:"squat+to+stand+übung+anleitung",tag:"Ganzkörper"},
{name:"Glute Bridge Marsch",detail:"3×40 Sek.",desc:"Brücke halten, abwechselnd ein Bein anheben wie Marschieren.",yt:"glute+bridge+march+übung+anleitung",tag:"Gesäß"},
{name:"Plank Knee Taps",detail:"3×40 Sek.",desc:"Plank-Position, abwechselnd Knie langsam zur Brust ziehen.",yt:"plank+knee+taps+übung+anleitung",tag:"Core/Cardio"},
{name:"Liegestütze",detail:"3×40 Sek.",desc:"Volle oder Knie-Variante im Tempo.",yt:"knie+liegestütze+anfänger+richtige+ausführung",tag:"Brust"},
{name:"Birddog",detail:"3×40 Sek.",desc:"Vierfüßler, gegengleich Arm und Bein strecken. Rumpf stabil.",yt:"birddog+übung+anleitung+core",tag:"Ganzkörper"},
],
core:[
{name:"Plank",detail:"3×40 Sek.",desc:"Unterarme, Körper gerade halten.",yt:"plank+unterarmstütz+richtige+ausführung",tag:"Core"},
{name:"Hollow Body Hold",detail:"3×30 Sek.",desc:"Rückenlage, alles anheben.",yt:"hollow+body+hold+anleitung+anfänger+core",tag:"Bauch"},
{name:"Superman Hold",detail:"3×30 Sek.",desc:"Bauchlage, alles anheben.",yt:"superman+übung+rücken+anleitung+bodyweight",tag:"Rücken"},
],
cooldown:[
{name:"Stehende Vorbeuge",detail:"45 Sek.",desc:"Locker nach vorne hängen lassen.",yt:"stehende+vorbeuge+dehnung+anleitung"},
{name:"Tauben-Stretch",detail:"45 Sek./Seite",desc:"Intensiver Hüftöffner.",yt:"pigeon+stretch+hüfte+dehnen+anleitung"},
{name:"Bauchatmung",detail:"90 Sek.",desc:"Tief atmen, Puls runterbringen.",yt:"bauchatmung+entspannung+übung"},
]},
];

/* ═══ BUILD TIMELINE ═══ */
function buildTimeline(day) {
const steps = [];
const pushEx = (ex, color, autoStart) => {
const sec = parseSec(ex.detail) || 35;
const sets = parseSets(ex.detail);
const sides = hasSides(ex.detail);
for (let s = 0; s < sets; s++) {
if (sides) {
steps.push({type:"exercise",...ex,side:"Links",seconds:sec,color,setNum:s+1,totalSets:sets,autoStart});
steps.push({type:"exercise",...ex,side:"Rechts",seconds:sec,color,setNum:s+1,totalSets:sets,autoStart:true});
} else {
steps.push({type:"exercise",...ex,side:null,seconds:sec,color,setNum:s+1,totalSets:sets,autoStart});
}
if (s < sets-1) steps.push({type:"pause",seconds:Math.min(25,day.pauseEx),label:"Satzpause",autoStart:true});
}
};
const pushSection = (exs, color, pause, autoEx) => {
exs.forEach((ex,i) => {
pushEx(ex, color, autoEx);
if (i < exs.length-1 && pause > 0)
steps.push({type:"pause",seconds:pause,label:"Pause",autoStart:true});
});
};

pushSection(day.warmup, day.color, 8, false);
if (day.warmup.length && (day.main.length || (day.core||[]).length))
steps.push({type:"pause",seconds:15,label:"▸ Hauptteil",autoStart:true});
if (day.main.length) {
pushSection(day.main, day.accent, day.pauseEx, false);
if ((day.core||[]).length)
steps.push({type:"pause",seconds:45,label:"▸ Core-Block",autoStart:true});
}
if ((day.core||[]).length) {
pushSection(day.core, "#D84315", day.pauseCore, false);
if ((day.extra||[]).length)
steps.push({type:"pause",seconds:45,label:"▸ Oberkörper",autoStart:true});
}
if ((day.extra||[]).length)
pushSection(day.extra, day.accent, day.pauseEx, false);
if (day.cooldown.length && steps.length)
steps.push({type:"pause",seconds:10,label:"▸ Cooldown",autoStart:true});
pushSection(day.cooldown, "#546E7A", 5, false);
return steps;
}

/* ═══ WAKE LOCK ═══ */
function useWakeLock() {
const wakeLockRef = useRef(null);
useEffect(() => {
let wl = null;
const tryWakeLock = async () => {
try {
if ("wakeLock" in navigator) {
wl = await navigator.wakeLock.request("screen");
wakeLockRef.current = wl;
}
} catch(e) {}
};
tryWakeLock();
const reacquire = () => { if (document.visibilityState==="visible") tryWakeLock(); };
document.addEventListener("visibilitychange", reacquire);

const video = document.createElement("video");
video.setAttribute("playsinline","");
video.setAttribute("muted","");
video.muted = true;
video.setAttribute("loop","");
video.style.cssText = "position:fixed;top:-1px;left:-1px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;";
video.src = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2NCByMzEwOCAzMWUxOWY5IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTI1IHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAPZWWIhAAz//727L4FNf2f0JcRLMXaSnA+KqSAgHc0wAAAAwAAAwAAFgn0IAYYAAADAABVP/cewAAAAwAAAwAAAwAAAwAAAwAJQAAAAwAAAwAAAwAAAwAAAwAAAwAAA";
document.body.appendChild(video);
const playVideo = () => { try { video.play().catch(()=>{}); } catch(e){} };
playVideo();
document.addEventListener("click", playVideo, {once:true});
document.addEventListener("touchstart", playVideo, {once:true});

return () => {
  document.removeEventListener("visibilitychange", reacquire);
  if (wakeLockRef.current) wakeLockRef.current.release().catch(()=>{});
  video.pause(); video.remove();
};
}, []);
}

/* ═══ BEEP ═══ */
function useBeep() {
const c = useRef(null);
return useCallback((f=880,d=0.15) => {
try {
if(!c.current) c.current=new(window.AudioContext||window.webkitAudioContext)();
const o=c.current.createOscillator(),g=c.current.createGain();
o.connect(g);g.connect(c.current.destination);o.frequency.value=f;g.gain.value=0.25;o.start();
g.gain.exponentialRampToValueAtTime(0.001,c.current.currentTime+d);o.stop(c.current.currentTime+d);
}catch(e){}
},[]);
}

/* ═══ RING ═══ */
function Ring({pct,color,size=48,children}){
const r=(size-8)/2,c=2*Math.PI*r,d=c-(pct/100)*c;
return(<div className="relative flex-shrink-0" style={{width:size,height:size}}>
<svg width={size} height={size} className="transform -rotate-90">
<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color+"20"} strokeWidth="4"/>
<circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={d} style={{transition:"stroke-dashoffset 0.3s"}}/>
</svg>
<div className="absolute inset-0 flex items-center justify-center">{children}</div>
</div>);
}

/* ═══ AI CHAT SYSTEM PROMPT ═══ */
const SYSTEM_PROMPT = `Du bist ein Calisthenics-Trainingsplan-Assistent. Du hilfst beim Anpassen des Trainingsplans.

REGELN:
- Antworte NUR auf Deutsch
- Du darfst NUR den Trainingsplan anpassen (Übungen, Dauer, Fokus, Sätze, Pausen)
- Keine medizinischen Ratschläge, keine Ernährung, kein Smalltalk
- Halte dich kurz (max 2-3 Sätze Antwort + die JSON-Änderung)
- Wenn die Anfrage nichts mit dem Trainingsplan zu tun hat, lehne freundlich ab

Wenn du eine Änderung am Plan vornimmst, füge am Ende deiner Antwort einen JSON-Block ein:
\`\`\`json
{
  "action": "update_day",
  "dayIndex": 0,
  "changes": {
    "title": "Neuer Titel",
    "icon": "💪",
    "pauseEx": 60,
    "pauseCore": 45,
    "warmup": [...],
    "main": [...],
    "core": [...],
    "extra": [...],
    "cooldown": [...]
  }
}
\`\`\`

Jede Übung hat das Format:
{ "name": "Name", "detail": "3×30 Sek.", "desc": "Beschreibung", "yt": "suchbegriffe+für+youtube", "tag": "Muskelgruppe" }

Detail-Format: "30 Sek." oder "3×40 Sek." oder "30 Sek./Seite" oder "3×25 Sek./Seite" oder "2 Min."
"/Seite" für links/rechts, "/Bein" oder "/Arm" ebenfalls.

Der aktuelle Plan hat 5 Tage (Index 0-4): MO, DI, MI, DO, FR.
Gib nur die Felder zurück, die sich ändern. Wenn z.B. nur main geändert wird, gib nur "main" in changes.

Wenn der Nutzer nach dem aktuellen Plan fragt, beschreibe ihn kurz ohne JSON.`;

/* ═══ AI CHAT COMPONENT ═══ */
function AiChat({ days, onUpdateDay, currentDayIdx }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hallo! Ich kann deinen Trainingsplan anpassen. Sag mir z.B.:\n• \"Montag kürzer, nur 20 Min.\"\n• \"Mehr Schulterübungen am Donnerstag\"\n• \"Keine Liegestütze am Freitag\"\n• \"Dienstag Fokus auf Hüftmobilität\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildContext = () => {
    const dayLabels = ["MO","DI","MI","DO","FR"];
    return days.map((d, i) => {
      const sections = [];
      if (d.warmup?.length) sections.push(`Warmup: ${d.warmup.map(e=>e.name).join(", ")}`);
      if (d.main?.length) sections.push(`Hauptteil: ${d.main.map(e=>`${e.name} (${e.detail})`).join(", ")}`);
      if (d.core?.length) sections.push(`Core: ${d.core.map(e=>`${e.name} (${e.detail})`).join(", ")}`);
      if (d.extra?.length) sections.push(`Extra: ${d.extra.map(e=>`${e.name} (${e.detail})`).join(", ")}`);
      if (d.cooldown?.length) sections.push(`Cooldown: ${d.cooldown.map(e=>e.name).join(", ")}`);
      return `${dayLabels[i]} - ${d.title} ${d.icon} (Pause: ${d.pauseEx}s/${d.pauseCore}s)\n${sections.join("\n")}`;
    }).join("\n\n");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setApplied(null);

    try {
      const contextMsg = `AKTUELLER TRAININGSPLAN:\n${buildContext()}\n\nAktuell ausgewählter Tag: ${["MO","DI","MI","DO","FR"][currentDayIdx]} (Index ${currentDayIdx})\n\nNutzer-Anfrage: ${text}`;

      // Build valid message history: only prior user/assistant pairs (skip initial greeting), then current
      const history = messages.slice(1); // skip the static greeting
      const apiHistory = [];
      for (let i = 0; i < history.length; i++) {
        const m = history[i];
        if (m.role === "user" || m.role === "assistant") {
          apiHistory.push({ role: m.role, content: m.content });
        }
      }
      // Ensure alternation: trim from start until we begin with "user"
      while (apiHistory.length > 0 && apiHistory[0].role !== "user") {
        apiHistory.shift();
      }
      // Keep last 8 messages for context window
      const trimmed = apiHistory.slice(-8);
      // Add the current user message with full context
      trimmed.push({ role: "user", content: contextMsg });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: trimmed,
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("API response error:", response.status, errBody);
        throw new Error(`API ${response.status}`);
      }

      const data = await response.json();
      const fullText = data.content?.map(b => b.type === "text" ? b.text : "").join("") || "Entschuldigung, es gab ein Problem.";

      // Extract JSON block if present
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
      let displayText = fullText.replace(/```json[\s\S]*?```/g, "").trim();

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.action === "update_day" && typeof parsed.dayIndex === "number" && parsed.changes) {
            onUpdateDay(parsed.dayIndex, parsed.changes);
            const dayLabel = ["MO","DI","MI","DO","FR"][parsed.dayIndex] || "?";
            setApplied(dayLabel);
            displayText += `\n\n✅ Änderungen für ${dayLabel} übernommen.`;
          }
        } catch (e) {
          console.error("JSON parse error:", e);
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: displayText }]);
    } catch (err) {
      console.error("API error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Verbindungsfehler. Bitte nochmal versuchen." }]);
    }
    setLoading(false);
  };

  const dayColor = days[currentDayIdx]?.color || "#333";

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 300); }}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-2xl"
        style={{
          background: `linear-gradient(135deg, ${dayColor}, ${days[currentDayIdx]?.accent || "#666"})`,
          animation: "pulse-glow 2s ease-in-out infinite",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          <path d="M8 9h8M8 13h4" strokeOpacity="0.7"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 4px 25px rgba(0,0,0,0.5), 0 0 20px ${dayColor}40; }
        }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .chat-panel { animation: slideUp 0.3s ease-out; }
        .msg-anim { animation: msgIn 0.25s ease-out; }
        .typing-dot { animation: typing 1.4s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%,60%,100% { opacity: 0.3; } 30% { opacity: 1; } }
      `}</style>

      {/* Tap outside to close */}
      <div className="flex-shrink-0 h-16" onClick={() => setOpen(false)} />

      {/* Chat panel */}
      <div className="chat-panel flex-1 flex flex-col rounded-t-3xl overflow-hidden" style={{ background: "#fafafa", maxHeight: "calc(100vh - 64px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: "white" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${dayColor}, ${days[currentDayIdx]?.accent})` }}>
              KI
            </div>
            <div>
              <div className="font-bold text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Plan-Assistent</div>
              <div className="text-xs text-gray-400">Trainingsplan anpassen</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg hover:bg-gray-200 transition-colors">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`msg-anim flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={
                  msg.role === "user"
                    ? { background: dayColor, color: "white", borderBottomRightRadius: 6 }
                    : { background: "white", color: "#333", border: "1px solid #e8e8e8", borderBottomLeftRadius: 6 }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-anim flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex gap-1.5 items-center" style={{ borderBottomLeftRadius: 6 }}>
                <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
                <span className="typing-dot w-2 h-2 rounded-full bg-gray-400 inline-block" />
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            `${["MO","DI","MI","DO","FR"][currentDayIdx]} kürzer machen`,
            "Mehr Core-Übungen",
            "Pausen verlängern",
            "Plan zeigen",
          ].map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); }}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: dayColor + "40", color: dayColor }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 px-4 py-2 shadow-sm focus-within:border-gray-400 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Trainingsplan anpassen..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-300"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-all"
              style={{
                background: input.trim() && !loading ? dayColor : "#ddd",
                transform: input.trim() && !loading ? "scale(1)" : "scale(0.9)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ APP ═══ */
export default function App(){
const STORAGE_KEY = "mam-training-plan";

const [days, setDays] = useState(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DAYS));
});
const [dayIdx,setDayIdx]=useState(()=>({1:0,2:1,3:2,4:3,5:4})[new Date().getDay()]??0);
const [mode,setMode]=useState("manual");
const [cur,setCur]=useState(-1);
const [rem,setRem]=useState(0);
const [running,setRunning]=useState(false);
const [done,setDone]=useState(new Set());
const tick=useRef(null);
const beep=useBeep();
const scrollRef=useRef(null);
const pendingAdvance=useRef(false);

useWakeLock();

// Persist plan changes to localStorage
useEffect(() => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(days)); } catch(e) {}
}, [days]);

const resetPlanToDefault = () => {
  if (confirm("Trainingsplan auf Standard zurücksetzen? Alle KI-Anpassungen gehen verloren.")) {
    localStorage.removeItem(STORAGE_KEY);
    setDays(JSON.parse(JSON.stringify(DEFAULT_DAYS)));
    clearInterval(tick.current);
    setCur(-1); setRem(0); setRunning(false); setDone(new Set());
    pendingAdvance.current = false;
  }
};

const day=days[dayIdx];
const tl=buildTimeline(day);
const step=cur>=0&&cur<tl.length?tl[cur]:null;

const totalSec=tl.reduce((a,s)=>a+s.seconds,0);
const doneSec=tl.reduce((a,s,i)=>a+(done.has(i)?s.seconds:0),0)+(step&&running?step.seconds-rem:0);
const pct=totalSec>0?Math.min(100,doneSec/totalSec*100):0;
const allDone=done.size===tl.length&&tl.length>0;

const handleUpdateDay = useCallback((dayIndex, changes) => {
  setDays(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    if (dayIndex >= 0 && dayIndex < next.length) {
      Object.keys(changes).forEach(key => {
        next[dayIndex][key] = changes[key];
      });
    }
    return next;
  });
  // Reset workout state if the modified day is the current one
  if (dayIndex === dayIdx) {
    clearInterval(tick.current);
    setCur(-1); setRem(0); setRunning(false); setDone(new Set());
    pendingAdvance.current = false;
  }
}, [dayIdx]);

useEffect(()=>{
clearInterval(tick.current);setCur(-1);setRem(0);setRunning(false);setDone(new Set());
},[dayIdx]);

useEffect(()=>{
if(cur<0||cur>=tl.length)return;
const s=tl[cur];
setRem(s.seconds);
const shouldAuto = mode==="auto" || s.autoStart;
if(shouldAuto && pendingAdvance.current){
setRunning(true);
} else {
setRunning(false);
}
pendingAdvance.current=false;
},[cur]);

useEffect(()=>{
if(!running||rem<=0||cur<0)return;
tick.current=setInterval(()=>{
setRem(r=>{
if(r<=1){
clearInterval(tick.current);
beep(1200,0.3);setTimeout(()=>beep(1400,0.25),180);
setDone(p=>{const n=new Set(p);n.add(cur);return n;});
if(cur<tl.length-1){
pendingAdvance.current=true;
setTimeout(()=>setCur(c=>c+1),500);
} else {setRunning(false);}
return 0;
}
if(r<=4&&step?.type==="exercise")beep(660,0.08);
return r-1;
});
},1000);
return()=>clearInterval(tick.current);
},[running,rem,cur]);

useEffect(()=>{scrollRef.current?.scrollIntoView({behavior:"smooth",block:"center"});},[cur]);

const selectStep=(i)=>{
if(done.has(i))return;
clearInterval(tick.current);
pendingAdvance.current=false;
setCur(i);setRem(tl[i].seconds);setRunning(false);
};

const startAt=(i)=>{
clearInterval(tick.current);
pendingAdvance.current=false;
setCur(i);setRem(tl[i].seconds);
setTimeout(()=>setRunning(true),50);
};

const togglePause=()=>{
if(rem<=0){setRem(step?.seconds||0);setRunning(true);return;}
setRunning(!running);
};

const skip=()=>{
clearInterval(tick.current);
setDone(p=>{const n=new Set(p);n.add(cur);return n;});
if(cur<tl.length-1){pendingAdvance.current=true;setCur(c=>c+1);}
else{setRunning(false);}
};

const startWorkout=()=>{pendingAdvance.current=true;setCur(0);};
const resetAll=()=>{clearInterval(tick.current);setCur(-1);setRem(0);setRunning(false);setDone(new Set());pendingAdvance.current=false;};

return(
<div className="min-h-screen pb-32" style={{background:"linear-gradient(180deg,#f5f5f5,#e8e8e8)",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>

  {/* HEADER */}
  <div className="sticky top-0 z-40 backdrop-blur-xl" style={{background:"rgba(255,255,255,0.92)",borderBottom:"1px solid rgba(0,0,0,0.08)"}}>
    <div className="max-w-lg mx-auto px-4 pb-2" style={{paddingTop:"max(12px, env(safe-area-inset-top))"}}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-sm font-bold tracking-tight" style={{fontFamily:"'Space Mono',monospace"}}>MY ACTIVE MORNING</h1>
          <p className="text-xs text-gray-400">Routine · ~{Math.round(totalSec/60)} Min.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={()=>{setMode(m=>m==="manual"?"auto":"manual");resetAll();}}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={{background:mode==="auto"?day.color+"15":"#f0f0f0",color:mode==="auto"?day.color:"#999",border:`1.5px solid ${mode==="auto"?day.color:"#ddd"}`}}>
            {mode==="auto"?"⚡ Auto":"✋ Manuell"}
          </button>
          <div className="text-xl font-bold tabular-nums" style={{color:day.color,fontFamily:"'Space Mono',monospace"}}>{Math.round(pct)}%</div>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-200 mb-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`,background:`linear-gradient(90deg,${day.color},${day.accent})`}}/>
      </div>
      <div className="flex gap-1">
        {days.map((d,i)=>(
          <button key={d.id} onClick={()=>setDayIdx(i)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${i===dayIdx?"text-white shadow":"text-gray-400 hover:bg-gray-100"}`}
            style={i===dayIdx?{background:`linear-gradient(135deg,${d.color},${d.accent})`}:{}}>
            <span className="text-sm block">{d.icon}</span>{d.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* CONTENT */}
  <div className="max-w-lg mx-auto px-4 pt-4">
    <h2 className="text-lg font-bold mb-4">{day.icon} {day.title}</h2>

    {mode==="auto" && cur<0 && (
      <button onClick={startWorkout}
        className="w-full py-4 rounded-2xl text-white font-bold text-base mb-5 shadow-lg active:scale-95 transition-all"
        style={{background:`linear-gradient(135deg,${day.color},${day.accent})`}}>
        ▶ Workout starten
      </button>
    )}

    {allDone&&(
      <div className="text-center py-8 mb-4">
        <div className="text-5xl mb-3">🎉</div>
        <div className="text-lg font-bold">Workout geschafft!</div>
        <p className="text-sm text-gray-400 mt-1">~{Math.round(totalSec/60)} Min. · Alles erledigt</p>
        <button onClick={resetAll} className="mt-4 px-6 py-2 rounded-xl text-sm font-medium" style={{color:day.color,background:day.color+"12"}}>Nochmal</button>
      </div>
    )}

    {/* TIMELINE */}
    <div className="flex flex-col gap-1.5">
      {tl.map((s,i)=>{
        const active=i===cur;
        const isDone=done.has(i);
        const stepPct=active&&s.seconds>0?((s.seconds-rem)/s.seconds)*100:isDone?100:0;

        if(s.type==="pause"){
          return(
            <div key={i} ref={active?scrollRef:null}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDone?"opacity-30":""} ${active&&running?"ring-2 ring-amber-400 bg-amber-50":"bg-gray-50"}`}>
              <Ring pct={stepPct} color="#F9A825" size={36}>
                <span className="text-xs font-bold tabular-nums" style={{fontFamily:"'Space Mono',monospace",color:isDone?"#bbb":"#F57F17"}}>
                  {isDone?"✓":active?fmt(rem):fmt(s.seconds)}
                </span>
              </Ring>
              <span className="text-xs font-semibold text-amber-800 flex-1">⏸ {s.label} <span className="text-gray-400 font-normal">{s.seconds}s</span></span>
              {active&&!isDone&&(
                <button onClick={skip} className="px-2 py-1 rounded text-xs text-gray-400 bg-gray-100">Skip</button>
              )}
            </div>
          );
        }

        const setLabel=s.totalSets>1?` · Satz ${s.setNum}/${s.totalSets}`:"";
        return(
          <div key={i} ref={active?scrollRef:null}
            onClick={()=>!isDone&&!running&&mode==="manual"&&selectStep(i)}
            className={`rounded-xl border-2 transition-all cursor-pointer
              ${active?"shadow-lg":""}
              ${isDone?"opacity-40 border-green-300 bg-green-50 cursor-default":"border-transparent bg-white"}
            `}
            style={active&&!isDone?{borderColor:s.color,boxShadow:`0 4px 20px ${s.color}20`}:{boxShadow:isDone?"none":"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div className="p-3 flex items-start gap-3">
              <Ring pct={stepPct} color={isDone?"#4CAF50":s.color||"#666"} size={46}>
                <span className="font-bold tabular-nums" style={{fontSize:12,fontFamily:"'Space Mono',monospace",color:isDone?"#4CAF50":active?s.color:"#999"}}>
                  {isDone?"✓":active&&running?fmt(rem):fmt(s.seconds)}
                </span>
              </Ring>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-semibold text-sm ${isDone?"line-through text-gray-400":""}`}>{s.name}</span>
                  {s.tag&&<span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:(s.color||"#666")+"15",color:s.color}}>{s.tag}</span>}
                  {s.side&&<span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{background:s.side==="Links"?"#E3F2FD":"#FCE4EC",color:s.side==="Links"?"#1565C0":"#C62828"}}>{s.side}</span>}
                </div>
                <div className="text-xs mt-0.5">
                  <span className="font-bold" style={{color:s.color}}>{s.detail}</span>
                  <span className="text-gray-400">{setLabel}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.desc}</p>

                {mode==="manual"&&!isDone&&!active&&s.type==="exercise"&&(
                  <button onClick={(e)=>{e.stopPropagation();startAt(i);}}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all"
                    style={{background:s.color}}>
                    ▶ Start
                  </button>
                )}

                {active&&!isDone&&(
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={(e)=>{e.stopPropagation();togglePause();}}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white active:scale-95 transition-all"
                      style={{background:running?"#EF5350":s.color}}>
                      {rem===0?"↺ Nochmal":running?"⏸ Stopp":"▶ Start"}
                    </button>
                    <button onClick={(e)=>{e.stopPropagation();skip();}} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-gray-100">Weiter</button>
                    {running&&<span className="text-xs font-medium animate-pulse" style={{color:s.color}}>Läuft...</span>}
                  </div>
                )}

                {s.yt&&(
                  <div className="mt-2 pt-1.5" style={{borderTop:"1px solid #f0f0f0"}}>
                    <a href={ytUrl(s.yt)} target="_blank" rel="noopener noreferrer"
                      onClick={(e)=>e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline" style={{color:"#D32F2F"}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1c.4-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                      Video-Anleitung
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {done.size>0&&!allDone&&(
      <button onClick={resetAll} className="w-full py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-white mt-4">Zurücksetzen</button>
    )}

    {/* Reset plan to defaults */}
    <button onClick={resetPlanToDefault}
      className="w-full py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-red-400 hover:bg-red-50 mt-6 mb-4 transition-colors">
      ↺ Trainingsplan auf Standard zurücksetzen
    </button>

  </div>

  {/* FLOATING BAR */}
  {running&&step&&(
    <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl" style={{background:"rgba(255,255,255,0.95)",borderTop:"1px solid rgba(0,0,0,0.1)"}}>
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        <Ring pct={step.seconds>0?((step.seconds-rem)/step.seconds)*100:0} color={step.type==="pause"?"#F9A825":step.color||day.color} size={44}>
          <span className="font-bold text-xs tabular-nums" style={{fontFamily:"'Space Mono',monospace",color:step.type==="pause"?"#F57F17":step.color||day.color}}>{fmt(rem)}</span>
        </Ring>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{step.type==="pause"?`⏸ ${step.label}`:step.name}{step.side?` · ${step.side}`:""}</div>
          <div className="text-xs text-gray-400">{cur+1}/{tl.length}</div>
        </div>
        <button onClick={togglePause} className="px-3 py-2 rounded-xl text-white font-bold text-sm" style={{background:"#EF5350"}}>⏸</button>
        <button onClick={skip} className="px-3 py-2 rounded-xl text-sm font-medium text-gray-500 bg-gray-100">⏭</button>
      </div>
    </div>
  )}

  {/* AI CHAT */}
  <AiChat
    days={days}
    onUpdateDay={handleUpdateDay}
    currentDayIdx={dayIdx}
  />
</div>
);
}
