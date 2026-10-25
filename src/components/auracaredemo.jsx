import React, { useEffect, useRef, useState } from "react";
import "./auracaredemo.css";
import { translator } from "../translations";
import { useDemoPlayback } from "../playback";

/* ------------ Vakiot ja polut ------------ */
const BASE = process.env.PUBLIC_URL || "";
const LOGO = `${BASE}/logo.png`;
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
function DashboardModal({ t, open, onClose, settings, onSave, onTestMeds, onTestDrink }) {
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
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-title" onClick={onClose}>
      <div className="modal-box" onClick={(e)=>e.stopPropagation()}>
        <h3 id="dashboard-title" style={{marginTop:0}}>{t("Käyttöpaneeli")}</h3>

        <form className="settings-form" onSubmit={save}>
          {/* Lääkkeet */}
          <fieldset>
            <legend>{t("💊 Lääkemuistutukset")}</legend>
            <label className="row">
              <input
                type="checkbox"
                checked={draft.meds.enabled}
                onChange={(e)=>setDraft(p=>({...p, meds:{...p.meds, enabled:e.target.checked}}))}
              />
              <span>{t("Käytössä")}</span>
            </label>
            <div className="grid-2">
              <label className="col">{t("Aamu")}
                <input
                  type="time"
                  value={draft.meds.morning}
                  disabled={!draft.meds.enabled}
                  onChange={(e)=>setDraft(p=>({...p, meds:{...p.meds, morning:e.target.value}}))}
                  required
                />
              </label>
              <label className="col">{t("Ilta")}
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
                {t("Testaa lääkemuistutus")}
              </button>
            </div>
          </fieldset>

          {/* Juominen */}
          <fieldset>
            <legend>{t("💧 Juomamuistutus")}</legend>
            <label className="row">
              <input
                type="checkbox"
                checked={draft.drink.enabled}
                onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, enabled:e.target.checked}}))}
              />
              <span>{t("Käytössä")}</span>
            </label>
            <div className="grid-3">
              <label className="col">{t("Väli (h)")}
                <input
                  type="number" min="1" max="6"
                  value={draft.drink.intervalHours}
                  disabled={!draft.drink.enabled}
                  onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, intervalHours:Number(e.target.value)}}))}
                  required
                />
              </label>
              <label className="col">{t("Alkaa")}
                <input
                  type="time"
                  value={draft.drink.start}
                  disabled={!draft.drink.enabled}
                  onChange={(e)=>setDraft(p=>({...p, drink:{...p.drink, start:e.target.value}}))}
                  required
                />
              </label>
              <label className="col">{t("Päättyy")}
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
                {t("Testaa juomamuistutus")}
              </button>
            </div>
          </fieldset>

          {/* Läheiset */}
          <fieldset>
            <legend>{t("👨‍👩‍👧‍👦 Läheiset")}</legend>
            <div className="chips">
              {draft.contacts.map((n,i)=>(
                <span className="chip" key={n+i}>
                  {n}
                  <button type="button" aria-label={`${t("Poista")} ${n}`}
                          onClick={()=>setDraft(p=>({...p, contacts:p.contacts.filter((_,ix)=>ix!==i)}))}>×</button>
                </span>
              ))}
            </div>
            <div className="row add-contact">
              <input
                type="text" placeholder={t("Uusi nimi…")} aria-label={t("Uuden läheisen nimi")}
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
              }}>{t("Lisää")}</button>
            </div>
          </fieldset>

          <div className="modal-actions">
            <button type="submit" className="pill">{t("Tallenna")}</button>
            <button type="button" className="pill stop" onClick={onClose}>{t("Sulje")}</button>
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
  const [settings, setSettings] = useState(loadSettings);
  const [panelOpen, setPanelOpen] = useState(false);

  const [language, setLanguage] = useState(() => window.AuraCareLanguage.get());
  const t = translator(language);
  const { playing, label, error, start, stop, onVideoEnded, onVideoError } = useDemoPlayback(videoRef, language);
  useEffect(() => {
    const update = () => setLanguage(window.AuraCareLanguage.get());
    window.addEventListener('auracare-language', update);
    return () => window.removeEventListener('auracare-language', update);
  }, []);
  function changeLanguage(value) {
    stop();
    window.AuraCareLanguage.set(value);
  }
  function saveSettings(s) {
    setSettings(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
    setPanelOpen(false);
  }

  return (
    <>
      <div className="desk-wrap">
        {/* Vasen: Miksi AuraCare */}
        <aside className="card left">
  <h1>{t("Miksi AuraCare?")}</h1>
  <ul>
    <li>{t("Torjuu yksinäisyyttä: lyhyet jutteluhetket pitkin päivää tuovat seuraa ja läsnäolon tunteen.")}</li>
    <li>{t("Tuttujen kasvojen ja äänten tuki: omaisen/hoitajan kasvot ja ääni vähentävät laitepelkoa ja luovat turvaa.")}</li>
    <li>{t("Helppokäyttöinen: toimii selaimessa puhelimella, tabletilla ja tietokoneella – ei erillisiä asennuksia.")}</li>
    <li>{t("Muistutukset & rutiinit: juominen, lääkitys, ruokailu ja muut arjen tehtävät, kuittaukset talteen.")}</li>
    <li>{t("Turva & reagointi: havaitsee avunhuudot ja kovat äänet (kolahdus), kysyy ”Onko kaikki hyvin?” ja voi hälyttää läheiset.")}</li>
    <li>{t("Omaisille & hoivaan: selkeä näkymä tapahtumiin ja ilmoituksiin, hallinta yhdestä paikasta.")}</li>
    <li>{t("Tietosuoja kunnossa: vain välttämätön tieto, läpinäkyvä käsittely, GDPR-periaatteet.")}</li>
  </ul>
</aside>

        {/* Keskiosa: “videopuhelu” */}
        <main className="card center">
          <nav className="language-switch" aria-label={t("Kieli")}>
            {['fi', 'en'].map(value => <button key={value} type="button" lang={value} aria-label={value === 'fi' ? 'Suomi' : 'English'} aria-pressed={language === value} onClick={() => changeLanguage(value)}>{value.toUpperCase()}</button>)}
          </nav>
          <div className="tabs">
            <button className="tab active">{t("Live-puhelu")}</button>
            <button className="tab ghost">AuraCare VMP Demo</button>
          </div>

          <div className="screen">
            <div className="badge" role="status">{t(label)}</div>
            <video
              ref={videoRef}
              className="screen-video"
              playsInline
              controls={false}
              onEnded={onVideoEnded}
              onError={onVideoError}
              aria-label={t("Live-puhelu")}
              preload="auto"
              poster={playing ? undefined : LOGO}
            />
          </div>
          {error && <p role="alert" className="playback-error">{t(error)}</p>}

          <div className="controls">
            <button onClick={()=>start("live")}  disabled={playing} className="pill live">Live</button>
            <button onClick={()=>start("meds")}  disabled={playing} className="pill meds">{t("Lääkemuistutus")}</button>
            <button onClick={()=>start("drink")} disabled={playing} className="pill water">{t("Juomamuistutus")}</button>
            <button onClick={() => stop("Keskeytetty")} className="pill stop">Stop</button>
          </div>
        </main>

        {/* Oikea: Hallintapaneeli + yhteenveto */}
        <section className="card right">
          <h2>{t("🔧 Hallintapaneeli")}</h2>
          <ul className="legend">
            <li>💊 {t("Lääkkeet:")} {settings.meds.morning} {t("ja")} {settings.meds.evening} ({settings.meds.enabled ? t("käytössä") : t("pois päältä")})</li>
            <li>💧 {t("Juominen:")} {settings.drink.intervalHours}{t("h välein")} ({settings.drink.start}–{settings.drink.end}) ({settings.drink.enabled ? t("käytössä") : t("pois päältä")})</li>
            <li>👨‍👩‍👧‍👦 {t("Läheiset:")} {settings.contacts.join(", ") || "—"}</li>
          </ul>

          <div className="hint">
            <h3>{t("Mitä hallintapaneelissa voi tehdä?")}</h3>
            <ul>
              <li>{t("Lisää ja aikatauluta lääkemuistutukset")}</li>
              <li>{t("Säädä juomaväli ja aktiiviset kellonajat")}</li>
              <li>{t("Luo omia muistutuksia (esim. ruokailu)")}</li>
              <li>{t("Lisää käyttäjiä (omaiset / hoitajat)")}</li>
              <li>{t("Tallenna ja testaa asetukset")}</li>
            </ul>
            <button className="link" onClick={()=>setPanelOpen(true)}>{t("Avaa käyttöpaneeli ›")}</button>
          </div>
        </section>
      </div>

      {/* Dashboard-modal */}
      <DashboardModal
        t={t}
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
