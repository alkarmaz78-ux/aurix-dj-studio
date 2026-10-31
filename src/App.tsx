import { useEffect, useRef, useState } from "react";
import { AudioLines, Disc3, FolderOpen, Headphones, Music2, Pause, Play, Plus, Radio, Search, Settings2, SkipBack, Volume2, Zap } from "lucide-react";

type Track = { name: string; url: string; path?: string };
declare global {
  interface Window {
    desktopAPI?: {
      chooseFiles: () => Promise<Track[]>;
      version: () => Promise<string>;
    };
  }
}

function Deck({ label, accent, track, onLoad, onTrackEnd }: {
  label: string; accent: "cyan" | "violet"; track?: Track;
  onLoad: () => void; onTrackEnd?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(1);
  const [volume, setVolume] = useState(80);
  const [eq, setEq] = useState([50, 50, 50]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = tempo;
    audio.volume = volume / 100;
  }, [tempo, volume, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setProgress(audio.currentTime);
    const loaded = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("ended", () => { setPlaying(false); onTrackEnd?.(); });
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", loaded);
    };
  }, [track, onTrackEnd]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) { await audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  };
  const seek = (value: number) => {
    if (audioRef.current && Number.isFinite(duration)) audioRef.current.currentTime = value;
    setProgress(value);
  };
  const fmt = (n: number) => {
    if (!Number.isFinite(n)) return "0:00";
    return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
  };

  return <section className={`deck deck-${accent}`}>
    <audio ref={audioRef} src={track?.url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <div className="deck-head"><div className="deck-letter">{label}</div><div><div className="eyebrow">PLAYER DECK</div><h2>DECK {label}</h2></div><span className="live-dot">● READY</span></div>
    <div className="record-area">
      <div className={`record ${playing ? "spinning" : ""}`}><div className="record-grooves"><div className="record-label"><Disc3 size={42}/><small>{label}</small></div></div></div>
      <div className="track-meta"><span className="eyebrow">NOW PLAYING</span><strong>{track?.name || "Загрузите трек"}</strong><span className="muted">{track ? "Локальный аудиофайл" : "MP3 · WAV · FLAC · M4A"}</span></div>
    </div>
    <div className="waveform" aria-label="Индикатор воспроизведения">
      {Array.from({length: 72}, (_, i) => <i key={i} style={{height: `${18 + ((i * 37 + (label === "A" ? 13 : 29)) % 76)}%`, opacity: i / 72 < (duration ? progress / duration : 0) ? 1 : .42}} />)}
    </div>
    <div className="timeline"><span>{fmt(progress)}</span><input aria-label="Позиция трека" type="range" min="0" max={duration || 100} step=".1" value={Math.min(progress, duration || 100)} onChange={e => seek(Number(e.target.value))}/><span>{fmt(duration)}</span></div>
    <div className="transport">
      <button className="icon-btn" title="В начало" onClick={() => seek(0)}><SkipBack size={18}/></button>
      <button className="play-btn" onClick={toggle} disabled={!track}>{playing ? <Pause fill="currentColor"/> : <Play fill="currentColor"/>}</button>
      <button className="icon-btn" title="Cue — в начало" onClick={() => {seek(0); if (audioRef.current) {audioRef.current.pause(); setPlaying(false);} }}><Radio size={18}/></button>
      <button className="load-btn" onClick={onLoad}><FolderOpen size={16}/> ЗАГРУЗИТЬ</button>
    </div>
    <div className="control-grid">
      <div className="control"><div className="control-label"><span>TEMPO</span><b>{tempo.toFixed(2)}x</b></div><input type="range" min=".8" max="1.2" step=".01" value={tempo} onChange={e => setTempo(Number(e.target.value))}/></div>
      <div className="control"><div className="control-label"><span>VOLUME</span><b>{volume}%</b></div><input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))}/></div>
    </div>
    <div className="eq-row">{["LOW","MID","HIGH"].map((name, i) => <label key={name}><span>{name}</span><input aria-label={name} type="range" min="0" max="100" value={eq[i]} onChange={e => setEq(old => old.map((v, j) => i === j ? Number(e.target.value) : v))}/></label>)}</div>
  </section>;
}

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState("");
  const [deckA, setDeckA] = useState<Track>();
  const [deckB, setDeckB] = useState<Track>();
  const [cross, setCross] = useState(50);
  const [master, setMaster] = useState(85);
  const [version, setVersion] = useState("0.1.0");
  const [status, setStatus] = useState("AUDIO ENGINE READY");

  useEffect(() => { window.desktopAPI?.version().then(setVersion).catch(() => undefined); }, []);
  const importTracks = async () => {
    if (!window.desktopAPI) { setStatus("Откройте приложение AURIX для импорта файлов"); return; }
    const selected = await window.desktopAPI.chooseFiles();
    if (selected.length) { setTracks(old => [...old, ...selected]); setStatus(`ДОБАВЛЕНО ФАЙЛОВ: ${selected.length}`); }
  };
  const load = (track: Track, deck: "A" | "B") => {
    deck === "A" ? setDeckA(track) : setDeckB(track);
    setStatus(`ЗАГРУЖЕНО В DECK ${deck}`);
  };
  const filtered = tracks.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><AudioLines size={24}/></div><div><strong>AURIX <span>DJ STUDIO</span></strong><small>PROFESSIONAL DJ WORKSPACE</small></div></div>
      <div className="top-status"><span className="status-light"/> {status}</div>
      <div className="top-actions"><button className="ghost-btn"><Settings2 size={17}/> SETTINGS</button><span className="version">v{version}</span></div>
    </header>
    <section className="welcome"><div><div className="eyebrow"><Zap size={13}/> PERFORMANCE MODE</div><h1>PLAY YOUR <em>ENERGY.</em></h1><p>Two decks. One mix. Your sound.</p></div><div className="welcome-orb"><Disc3 size={76}/><span/></div></section>
    <div className="workspace">
      <div className="decks">
        <Deck label="A" accent="cyan" track={deckA} onLoad={importTracks}/>
        <Deck label="B" accent="violet" track={deckB} onLoad={importTracks}/>
      </div>
      <aside className="mixer">
        <div className="panel-title"><SlidersIcon/> <span>MASTER MIXER</span></div>
        <div className="master-display"><Volume2 size={22}/><strong>MASTER</strong><b>{master}%</b></div>
        <input className="vertical-wide" aria-label="Master volume" type="range" min="0" max="100" value={master} onChange={e => setMaster(Number(e.target.value))}/>
        <div className="mixer-divider"/>
        <div className="eyebrow">CROSSFADER</div>
        <div className="cross-labels"><span>DECK A</span><span>DECK B</span></div>
        <input className="crossfader" aria-label="Crossfader" type="range" min="0" max="100" value={cross} onChange={e => setCross(Number(e.target.value))}/>
        <div className="cross-value">{cross < 45 ? "A SIDE" : cross > 55 ? "B SIDE" : "CENTER"}</div>
        <div className="mixer-divider"/>
        <div className="meter-title">OUTPUT LEVEL</div><div className="meter"><i style={{width: `${Math.min(master, 100)}%`}}/></div>
        <div className="mixer-note"><Headphones size={17}/><span>Headphone cue routing will be added with the dedicated audio engine.</span></div>
      </aside>
    </div>
    <section className="library">
      <div className="library-head"><div className="panel-title"><Music2 size={19}/><span>MUSIC LIBRARY</span><small>{tracks.length} TRACKS</small></div><button className="add-btn" onClick={importTracks}><Plus size={17}/> ADD TRACKS</button></div>
      <div className="library-tools"><div className="search"><Search size={16}/><input placeholder="Поиск по трекам..." value={query} onChange={e => setQuery(e.target.value)}/></div><span className="muted">Локальная сессия · файлы не отправляются в облако</span></div>
      {filtered.length === 0 ? <div className="empty-library"><div className="empty-icon"><FolderOpen size={26}/></div><strong>Ваша музыкальная библиотека пуста</strong><span>Добавьте аудиофайлы, чтобы начать микширование</span><button className="load-btn" onClick={importTracks}><Plus size={15}/> ИМПОРТИРОВАТЬ МУЗЫКУ</button></div> :
        <div className="track-list">{filtered.map((track, i) => <div className="track-row" key={track.path || track.url}><span className="track-number">{String(i+1).padStart(2,"0")}</span><Disc3 size={18}/><span className="track-name">{track.name}</span><button onClick={() => load(track,"A")}>LOAD A</button><button onClick={() => load(track,"B")}>LOAD B</button></div>)}</div>}
    </section>
    <footer><span>AURIX DJ STUDIO <b>·</b> BUILT FOR THE MIX</span><span>LOCAL AUDIO WORKSPACE</span></footer>
  </main>;
}

function SlidersIcon() { return <AudioLines size={19}/>; }