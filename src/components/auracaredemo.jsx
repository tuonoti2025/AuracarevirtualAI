import React, { useEffect, useRef, useState } from 'react';
import './auracaredemo.css';

// GH Pages -ystävälliset polut
const MEDIA = process.env.PUBLIC_URL + '/media/';

const VIDEO = {
  live:  MEDIA + 'Auracaredemo.mp4',
  meds:  MEDIA + 'Laakemuistutus.mp4',
  drink: MEDIA + 'Juomamuistutus.mp4',
};

const ALT = {
  meds:  MEDIA + encodeURIComponent('Lääkemuistutus.mp4'),
  drink: MEDIA + encodeURIComponent('Juomamuistutus.mp4'),
};

const LOGO = process.env.PUBLIC_URL + '/logo.png';


/* ---------------------- Asetukset + apurit ---------------------- */

const DEFAULTS = {
  meds: [
    { label: 'Aamu', time: '08:00', enabled: true },
    { label: 'Ilta', time: '20:00', enabled: true },
  ],
  drink: {
    everyMinutes: 120,
    activeHours: { start: '08:00', end: '20:00' },
    enabled: true,
  },
  other: [{ name: 'Ruokailu', time: '12:00', enabled: true }],
  users: [
    { name: 'Hilma', role: 'Asiakas' },
    { name: 'Timo', role: 'Omainen' },
  ],
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('auracare.settings');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/* ---------------------- Dashboard (modaali) ---------------------- */

function Dashboard({ open, onClose, onStart, onSave }) {
  const [tab, setTab] = useState('muistutukset');
  const [data, setData] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setData(loadSettings());
      setSaved(false);
    }
  }, [open]);

  const save = () => {
    localStorage.setItem('auracare.settings', JSON.stringify(data));
    setSaved(true);
    onSave?.(data);
    setTimeout(() => setSaved(false), 1200);
  };

  if (!open) return null;

  // helpers
  const setMed = (i, k, v) =>
    setData(s => ({ ...s, meds: s.meds.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)) }));
  const addMed = () =>
    setData(s => ({ ...s, meds: [...s.meds, { label: 'Uusi', time: '14:00', enabled: true }] }));
  const delMed = i =>
    setData(s => ({ ...s, meds: s.meds.filter((_, idx) => idx !== i) }));

  const setOther = (i, k, v) =>
    setData(s => ({ ...s, other: s.other.map((o, idx) => (idx === i ? { ...o, [k]: v } : o)) }));
  const addOther = () =>
    setData(s => ({ ...s, other: [...s.other, { name: 'Muistutus', time: '10:00', enabled: true }] }));
  const delOther = i =>
    setData(s => ({ ...s, other: s.other.filter((_, idx) => idx !== i) }));

  const setUser = (i, k, v) =>
    setData(s => ({ ...s, users: s.users.map((u, idx) => (idx === i ? { ...u, [k]: v } : u)) }));
  const addUser = () =>
    setData(s => ({ ...s, users: [...s.users, { name: 'Uusi henkilö', role: 'Omainen' }] }));
  const delUser = i =>
    setData(s => ({ ...s, users: s.users.filter((_, idx) => idx !== i) }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Käyttöpaneeli</h4>
          <div>{saved && <span className="saved-chip">Tallennettu ✓</span>}</div>
          <button className="modal-close" onClick={onClose} title="Sulje">✕</button>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'muistutukset' ? 'active' : ''}`} onClick={() => setTab('muistutukset')}>Muistutukset</button>
          <button className={`tab ${tab === 'kayttajat' ? 'active' : ''}`} onClick={() => setTab('kayttajat')}>Käyttäjät</button>
          <button className={`tab ${tab === 'asetukset' ? 'active' : ''}`} onClick={() => setTab('asetukset')}>Asetukset</button>
        </div>

        {tab === 'muistutukset' && (
          <div className="pane">
            <div className="section-title red">💊 Lääkemuistutukset</div>
            <table className="pane-table">
              <thead>
                <tr><th>Label</th><th>Aika</th><th>Käytössä</th><th></th></tr>
              </thead>
              <tbody>
                {data.meds.map((m, i) => (
                  <tr key={i}>
                    <td><input value={m.label} onChange={e => setMed(i, 'label', e.target.value)} /></td>
                    <td><input type="time" value={m.time} onChange={e => setMed(i, 'time', e.target.value)} /></td>
                    <td className="center"><input type="checkbox" checked={m.enabled} onChange={e => setMed(i, 'enabled', e.target.checked)} /></td>
                    <td className="right"><button className="tiny danger" onClick={() => delMed(i)}>Poista</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="tiny" onClick={addMed}>+ Lisää aika</button>

            <div className="section-title blue" style={{ marginTop: 14 }}>💧 Juomamuistutus</div>
            <div className="grid two">
              <label>Väli (min):
                <input type="number" min="15" step="15"
                  value={data.drink.everyMinutes}
                  onChange={e => setData(s => ({ ...s, drink: { ...s.drink, everyMinutes: +e.target.value } }))}
                />
              </label>
              <label>Käytössä:
                <input type="checkbox"
                  checked={data.drink.enabled}
                  onChange={e => setData(s => ({ ...s, drink: { ...s.drink, enabled: e.target.checked } }))}
                />
              </label>
              <label>Alkaen:
                <input type="time" value={data.drink.activeHours.start}
                  onChange={e => setData(s => ({ ...s, drink: { ...s.drink, activeHours: { ...s.drink.activeHours, start: e.target.value } } }))}
                />
              </label>
              <label>Päättyen:
                <input type="time" value={data.drink.activeHours.end}
                  onChange={e => setData(s => ({ ...s, drink: { ...s.drink, activeHours: { ...s.drink.activeHours, end: e.target.value } } }))}
                />
              </label>
            </div>

            <div className="section-title purple" style={{ marginTop: 14 }}>🔔 Muut muistutukset</div>
            <table className="pane-table">
              <thead>
                <tr><th>Nimi</th><th>Aika</th><th>Käytössä</th><th></th></tr>
              </thead>
              <tbody>
                {data.other.map((o, i) => (
                  <tr key={i}>
                    <td><input value={o.name} onChange={e => setOther(i, 'name', e.target.value)} /></td>
                    <td><input type="time" value={o.time} onChange={e => setOther(i, 'time', e.target.value)} /></td>
                    <td className="center"><input type="checkbox" checked={o.enabled} onChange={e => setOther(i, 'enabled', e.target.checked)} /></td>
                    <td className="right"><button className="tiny danger" onClick={() => delOther(i)}>Poista</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="tiny" onClick={addOther}>+ Lisää muistutus</button>
          </div>
        )}

        {tab === 'kayttajat' && (
          <div className="pane">
            <div className="section-title slate">👥 Käyttäjät</div>
            <table className="pane-table">
              <thead>
                <tr><th>Nimi</th><th>Rooli</th><th></th></tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => (
                  <tr key={i}>
                    <td><input value={u.name} onChange={e => setUser(i, 'name', e.target.value)} /></td>
                    <td>
                      <select value={u.role} onChange={e => setUser(i, 'role', e.target.value)}>
                        <option>Asiakas</option>
                        <option>Omainen</option>
                        <option>Hoitaja</option>
                        <option>Ylläpitäjä</option>
                      </select>
                    </td>
                    <td className="right"><button className="tiny danger" onClick={() => delUser(i)}>Poista</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="tiny" onClick={addUser}>+ Lisää käyttäjä</button>
          </div>
        )}

        {tab === 'asetukset' && (
          <div className="pane">
            <div className="section-title slate">⚙️ Yleiset</div>
            <p>Tähän voidaan lisätä myöhemmin teema, kieli ja integraatiot.</p>
            <div className="inline-actions">
              <button className="btn green" onClick={() => onStart?.('live')}>▶ Testaa Live</button>
              <button className="btn red" onClick={() => onStart?.('meds')}>💊 Testaa lääke</button>
              <button className="btn blue" onClick={() => onStart?.('drink')}>💧 Testaa juoma</button>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn gray" onClick={onClose}>Sulje</button>
          <button className="btn green" onClick={save}>Tallenna</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Varsinainen DEMO --------------------------- */

export default function AuraCareDemo() {
  const videoRef = useRef(null);

  // Toimintokytkimet
  const ENABLED = { live: true, meds: true, drink: true };

  // Videot (suosi ASCII-nimiä). ALT = ääkköset URL-enkoodattuna.
  const VIDEO = {
    live:  '/media/Auracaredemo.mp4',
    meds:  '/media/Laakemuistutus.mp4',
    drink: '/media/Juomamuistutus.mp4',
  };
  const ALT = {
    meds:  '/media/' + encodeURIComponent('Lääkemuistutus.mp4'),
    drink: '/media/' + encodeURIComponent('Juomamuistutus.mp4'),
  };

  // current: 'live' | 'meds' | 'drink' | 'idle'
  const [current, setCurrent] = useState('live');
  const [triedAlt, setTriedAlt] = useState({ meds: false, drink: false });
  const [errorMsg, setErrorMsg] = useState('');
  const [dashOpen, setDashOpen] = useState(false);
  const [settings, setSettings] = useState(loadSettings()); // yhteenvedot

  const label =
    current === 'meds'  ? 'Lääkemuistutus' :
    current === 'drink' ? 'Juomamuistutus' :
    current === 'idle'  ? 'Pysäytetty – valitse toiminto' :
    'Live-puhelu';

  const safePlay = (src) => {
    const v = videoRef.current;
    if (!v) return;
    try { v.pause(); } catch {}
    v.src = src;
    try { v.currentTime = 0; } catch {}
    v.load();
    v.play().catch(() => {});
  };

  const toIdle = () => {
    const v = videoRef.current;
    if (!v) return;
    try { v.pause(); } catch {}
    try { v.currentTime = 0; } catch {}
    v.removeAttribute('src');
    v.load();
    setErrorMsg('');
    setTriedAlt({ meds: false, drink: false });
    setCurrent('idle');
  };

  const swapAndPlay = (key) => {
    if (!ENABLED[key]) return;
    setErrorMsg('');
    setTriedAlt({ meds: false, drink: false });
    setCurrent(key);
    safePlay(VIDEO[key]);
  };

  const onVideoError = () => {
    if (current === 'meds' && !triedAlt.meds) {
      setTriedAlt(s => ({ ...s, meds: true })); return safePlay(ALT.meds);
    }
    if (current === 'drink' && !triedAlt.drink) {
      setTriedAlt(s => ({ ...s, drink: true })); return safePlay(ALT.drink);
    }
    setErrorMsg('Videota ei löytynyt tai lataus epäonnistui.');
  };

  // Live päälle + Esc = Stop
  useEffect(() => {
    if (!ENABLED.live) return;
    setCurrent('live');
    safePlay(VIDEO.live);
    const onKey = (e) => { if (e.key === 'Escape') toIdle(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yhteenvetotekstit oikeaan palstaan
  const medsSummary =
    settings.meds.filter(m => m.enabled).map(m => m.time).join(', ') || '—';
  const drinkSummary = settings.drink.enabled
    ? `${Math.round((settings.drink.everyMinutes / 60) * 10) / 10} h välein (${settings.drink.activeHours.start}–${settings.drink.activeHours.end})`
    : 'Pois käytöstä';

  return (
    <div className="demo-container">
      {/* Ylätunniste */}
      <div className="header">
        <img src={LOGO} alt="Logo" className="logo" />

        <h2>AuraCare – Virtuaaliavustaja ikäihmisille</h2>
      </div>

      <div className="content">
        {/* Vasen: Miksi AuraCare? */}
        <div className="left">
          <h3>🧠 Miksi AuraCare?</h3>
          <ul className="benefits">
            <li><strong>Torjuu yksinäisyyttä:</strong> lyhyet jutteluhetket pitkin päivää tuovat seuraa ja läsnäolon tunteen.</li>
            <li><strong>Tuttujen kasvojen ja äänten tuki:</strong> omaisen/hoitajan kasvot ja ääni vähentävät laitepelkoa ja luovat turvaa.</li>
            <li><strong>Helppokäyttöinen:</strong> toimii selaimessa puhelimella, tabletilla ja tietokoneella – ei erillisiä asennuksia.</li>
            <li><strong>Muistutukset & rutiinit:</strong> juominen, lääkitys, ruokailu ja muut arjen tehtävät, kuittaukset talteen.</li>
            <li><strong>Turva & reagointi:</strong> havaitsee avunhuudot ja kovat äänet (kolahdus), kysyy "Onko kaikki hyvin?" ja voi hälyttää läheiset.</li>
            <li><strong>Omaisille & hoivaan:</strong> selkeä näkymä tapahtumiin ja ilmoituksiin, hallinta yhdestä paikasta.</li>
            <li><strong>Tietosuoja kunnossa:</strong> vain välttämätön tieto, läpinäkyvä käsittely, GDPR-periaatteet.</li>
            <li><strong>Skaalautuva ja integroitava:</strong> modulaarinen rakenne, liitettävissä muihin palveluihin ja turvaratkaisuihin.</li>
          </ul>
        </div>

        {/* Keskellä: puhelin + ✕ Stop */}
        <div className="middle">
          <div className="phone-frame">
            <div className="phone-header">AuraCare VMP Demo</div>
            <div className="call-chip">{errorMsg ? 'Virhe' : label}</div>
            <button
              className="close-call"
              onClick={toIdle}
              title="Lopeta (Esc)"
              aria-label="Lopeta video"
            >✕</button>

            <video
              ref={videoRef}
              className="profile-pic"
              playsInline
              preload="metadata"
              controls={false}
              onError={onVideoError}
              onEnded={toIdle}
            >
              Selaimesi ei tue videon toistoa.
            </video>

            {errorMsg && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#b91c1c' }}>
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Oikea: Hallintapaneeli (yksi versio) */}
        <div className="right">
          <h3>🛠 Hallintapaneeli</h3>

          <p>💊 Lääkkeet: {medsSummary}</p>
          <p>💧 Juomamuistutukset: {drinkSummary}</p>
          <p>👨‍👩‍👦 Läheiset: Timo, Anna</p>

          <div className="panel-card compact">
            <div className="panel-title">Mitä hallintapaneelissa voi tehdä?</div>
            <ul className="panel-list">
              <li><span className="dot red"></span>Lisää ja aikatauluta lääkemuistutukset</li>
              <li><span className="dot blue"></span>Säädä juomaväli ja aktiiviset kellonajat</li>
              <li><span className="dot purple"></span>Luo omia muistutuksia (esim. ruokailu)</li>
              <li><span className="dot green"></span>Lisää käyttäjiä (omaiset / hoitajat)</li>
              <li><span className="dot slate"></span>Tallenna ja testaa asetukset</li>
            </ul>
            <button className="panel-link" onClick={() => setDashOpen(true)}>
              Avaa käyttöpaneeli ›
            </button>
          </div>

          <div className="buttons">
            <button className={`btn green ${current === 'live' ? 'active' : ''}`} onClick={() => swapAndPlay('live')}>▶ Live</button>
            <button className={`btn red ${current === 'meds' ? 'active' : ''}`} onClick={() => swapAndPlay('meds')}>💊 Lääkemuistutus</button>
            <button className={`btn blue ${current === 'drink' ? 'active' : ''}`} onClick={() => swapAndPlay('drink')}>💧 Juomamuistutus</button>
            <button className="btn gray" onClick={toIdle}>■ Stop</button>
            <button className="btn purple" onClick={() => setDashOpen(true)}>⚙️ Käyttöpaneeli</button>
          </div>

          <Dashboard
            open={dashOpen}
            onClose={() => setDashOpen(false)}
            onStart={(key) => { setDashOpen(false); swapAndPlay(key); }}
            onSave={(d) => setSettings(d)}
          />
        </div>
      </div>
    </div>
  );
}
