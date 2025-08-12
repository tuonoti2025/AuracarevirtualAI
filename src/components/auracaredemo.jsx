import React, { useEffect, useRef, useState } from "react";
import "./auracaredemo.css";

/* ------------ Vakiot ja polut ------------ */
const BASE = process.env.PUBLIC_URL || "";
const LOGO = `${BASE}/logo.png`;
const VIDEO = {
  live:  [`${BASE}/media/Auracaredemo.mp4`],
  // Lääkemuistutus – tuetaan sekä ASCII- että URL-koodattua ääkkösnimeä
  meds:  [
    `${BASE}/media/Laakemuistutus.mp4`,
    `${BASE}/media/L%C3%A4%C3%A4kemuistutus.mp4`,
  ],
  drink: [`${BASE}/media/Juomamuistutus.mp4`],
};

/* ------------ Asetukset (LocalStorage) ------------ */
const STORAGE_KEY = "auracare.settings";
const defaultSettings = {
  meds:  { enabled: true, morning: "08:00", evening: "20:00" },
  drink: { enabled: true, intervalHours: 2, start: "08:00", end: "20:00" },
  contacts: ["Timo", "Anna"],
};
function loadSettings() {
  try {
    return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return defaultSettings;
  }
}

/* ------------ Dashboard-modal ------------ */
function DashboardModal({ open, onClose, settings, onSave, onTestMeds, onTestDrink }) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => setDraft(settings), [open, settings]);

  useEffect(() => {
    function onKey(e){ if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function save(e){
    e.preventDefault();
    onSave(draft);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-box" onClick={(e)=>e.stopPropagation()}>
        <h3 style={{marginTop:0}}>Käyttöpaneeli</h3>

        <form className="settings-form" onSubmit={save}>
          {/* Lääkkeet */}
          <fieldset>
            <legend>💊 Lääkemuistutukset</legend>
            <label className="row">
              <input
                type="checkbox"
                checked={draft.meds.enabled}
                onChange={(e)=>setDraft(p=>({...p, meds:{...p.meds, enabled:e.target.checked}}))}
              />
              <span>Käytössä</span>
            </label>
            <div className="grid-2">
              <label className="col">Aamu
                <input
                  type="time"
                  value={draft.meds.morning}
                  disabled={!draft.meds.enabled}
                  onChange={(e)=>setDraft(p=>({...p, meds:{...p.meds, morning:e.target.value}}))}
                  required
                />
              </label>
              <label className="col">Ilta
                <input
                  type="time"
                  value={draft.meds.evening}
                  disabled={!draft.meds.enabled}
                  onChange={(e)=>setDraft(p=>({...p, meds:{...p.meds, evening:e.target.value}}))}
                  required
                />
              </label>
            </div>
            <div className="actions-inline">
              <button type="button" className="pill meds" onClick={onTestMeds} disabled={!draft.meds.enabled}>
                Testaa lääkemuistutus
              </button>
            </div>
          </fieldset>

          {/* Juominen */}
          <fieldset>
            <legend>💧 Juomamuistutus</legend>
            <label className="row">
              <input
                type="checkbox"
                checked={draft.drink.enabled}
                onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, enabled:e.target.checked}}))}
              />
              <span>Käytössä</span>
            </label>
            <div className="grid-3">
              <label className="col">Väli (h)
                <input
                  type="number" min="1" max="6"
                  value={draft.drink.intervalHours}
                  disabled={!draft.drink.enabled}
                  onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, intervalHours:Number(e.target.value)}}))}
                  required
                />
              </label>
              <label className="col">Alkaa
                <input
                  type="time"
                  value={draft.drink.start}
                  disabled={!draft.drink.enabled}
                  onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, start:e.target.value}}))}
                  required
                />
              </label>
              <label className="col">Päättyy
                <input
                  type="time"
                  value={draft.drink.end}
                  disabled={!draft.drink.enabled}
                  onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, end:e.target.value}}))}
                  required
                />
              </label>
            </div>
            <div className="actions-inline">
              <button type="button" className="pill water" onClick={onTestDrink} disabled={!draft.drink.enabled}>
                Testaa juomamuistutus
              </button>
            </div>
          </fieldset>

          {/* Läheiset */}
          <fieldset>
            <legend>👨‍👩‍👧‍👦 Läheiset</legend>
            <div className="chips">
              {draft.contacts.map((n,i)=>(
                <span className="chip" key={n+i}>
                  {n}
                  <button type="button" aria-label={`Poista ${n}`}
                          onClick={()=>setDraft(p=>({...p, contacts:p.contacts.filter((_,ix)=>ix!==i)}))}>×</button>
                </span>
              ))}
            </div>
            <div className="row add-contact">
              <input
                type="text" placeholder="Uusi nimi…"
                onKeyDown={(e)=>{
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = e.currentTarget.value.trim();
                    if (v) setDraft(p=>({...p, contacts:[...p.contacts, v]}));
                    e.currentTarget.value="";
                  }
                }}
              />
              <button type="button" className="pill" onClick={(e)=>{
                const inp = e.currentTarget.previousElementSibling;
                const v = inp.value.trim();
                if (v){ setDraft(p=>({...p, contacts:[...p.contacts, v]})); inp.value=""; }
              }}>Lisää</button>
            </div>
          </fieldset>

          <div className="modal-actions">
            <button type="submit" className="pill">Tallenna</button>
            <button type="button" className="pill stop" onClick={onClose}>Sulje</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------ Pääkomponentti ------------ */
export default function AuraCareDemo() {
  const videoRef = useRef(null);

  // Asetukset & dashboard
  const [settings, setSettings] = useState(loadSettings());
  const [panelOpen, setPanelOpen] = useState(false);

  // Toisto
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("Valmis");
  const [srcList, setSrcList] = useState([]);
  const [srcIndex, setSrcIndex] = useState(-1);

  // Videon eventit
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onEnded = () => { resetToIdle(); };
    const onError = () => {
      setSrcIndex((i) => {
        const next = i + 1;
        if (next < srcList.length) return next;
        resetToIdle();
        return -1;
      });
    };

    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
    };
  }, [srcList]);

  // Kun lähde vaihtuu → aseta ja play
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (srcIndex >= 0 && srcIndex < srcList.length) {
      v.src = srcList[srcIndex];
      v.currentTime = 0;
      v.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false));
    }
  }, [srcIndex, srcList]);

  // Tallenna asetukset
  function saveSettings(s){
    setSettings(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
    setPanelOpen(false);
  }

  // Palauta idletila (logo/poster näkyy)
  function resetToIdle(){
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.removeAttribute("src");
    v.poster = LOGO;
    v.load();
    setPlaying(false);
    setLabel("Valmis");
    setSrcList([]);
    setSrcIndex(-1);
  }

  // Käynnistä puhelu/klippi
  function start(kind){
    const list = VIDEO[kind] || [];
    if (!list.length) return;

    setLabel(kind==="live" ? "Live-puhelu" : kind==="meds" ? "Lääkemuistutus" : "Juomamuistutus");

    const v = videoRef.current;
    if (v) v.poster = ""; // piilota logo toiston ajaksi

    setSrcList(list);
    setSrcIndex(0);
  }

  // Stop
  function stopAll(){
    resetToIdle();
    setLabel("Keskeytetty");
  }

  return (
    <>
      <div className="desk-wrap">
        {/* Vasen: Miksi AuraCare */}
        <aside className="card left">
  <h1>Miksi AuraCare?</h1>
  <ul>
    <li>Torjuu yksinäisyyttä: lyhyet jutteluhetket pitkin päivää tuovat seuraa ja läsnäolon tunteen.</li>
    <li>Tuttujen kasvojen ja äänten tuki: omaisen/hoitajan kasvot ja ääni vähentävät laitepelkoa ja luovat turvaa.</li>
    <li>Helppokäyttöinen: toimii selaimessa puhelimella, tabletilla ja tietokoneella – ei erillisiä asennuksia.</li>
    <li>Muistutukset & rutiinit: juominen, lääkitys, ruokailu ja muut arjen tehtävät, kuittaukset talteen.</li>
    <li>Turva & reagointi: havaitsee avunhuudot ja kovat äänet (kolahdus), kysyy ”Onko kaikki hyvin?” ja voi hälyttää läheiset.</li>
    <li>Omaisille & hoivaan: selkeä näkymä tapahtumiin ja ilmoituksiin, hallinta yhdestä paikasta.</li>
    <li>Tietosuoja kunnossa: vain välttämätön tieto, läpinäkyvä käsittely, GDPR-periaatteet.</li>
  </ul>
</aside>


        {/* Keskiosa: “videopuhelu” */}
        <main className="card center">
          <div className="tabs">
            <button className="tab active">Live-puhelu</button>
            <button className="tab ghost">AuraCare VMP Demo</button>
          </div>

          <div className="screen">
            <div className="badge">{label}</div>
            <video
              ref={videoRef}
              className="screen-video"
              playsInline
              controls={false}
              muted={false}
              preload="auto"
              poster={LOGO}   /* logo näkyy idlenä */
            />
          </div>

          <div className="controls">
            <button onClick={()=>start("live")}  disabled={playing} className="pill live">Live</button>
            <button onClick={()=>start("meds")}  disabled={playing} className="pill meds">Lääkemuistutus</button>
            <button onClick={()=>start("drink")} disabled={playing} className="pill water">Juomamuistutus</button>
            <button onClick={stopAll} className="pill stop">Stop</button>
          </div>
        </main>

        {/* Oikea: Hallintapaneeli + yhteenveto */}
        <section className="card right">
          <h2>🔧 Hallintapaneeli</h2>
          <ul className="legend">
            <li>💊 Lääkkeet: {settings.meds.morning} ja {settings.meds.evening} ({settings.meds.enabled ? "käytössä" : "pois päältä"})</li>
            <li>💧 Juominen: {settings.drink.intervalHours}h välein ({settings.drink.start}–{settings.drink.end}) ({settings.drink.enabled ? "käytössä" : "pois päältä"})</li>
            <li>👨‍👩‍👧‍👦 Läheiset: {settings.contacts.join(", ") || "—"}</li>
          </ul>

          <div className="hint">
            <h3>Mitä hallintapaneelissa voi tehdä?</h3>
            <ul>
              <li>Lisää ja aikatauluta lääkemuistutukset</li>
              <li>Säädä juomaväli ja aktiiviset kellonajat</li>
              <li>Luo omia muistutuksia (esim. ruokailu)</li>
              <li>Lisää käyttäjiä (omaiset / hoitajat)</li>
              <li>Tallenna ja testaa asetukset</li>
            </ul>
            <button className="link" onClick={()=>setPanelOpen(true)}>Avaa käyttöpaneeli ›</button>
          </div>
        </section>
      </div>

      {/* Dashboard-modal */}
      <DashboardModal
        open={panelOpen}
        onClose={()=>setPanelOpen(false)}
        settings={settings}
        onSave={saveSettings}
        onTestMeds={()=>start("meds")}
        onTestDrink={()=>start("drink")}
      />
    </>
  );
}
