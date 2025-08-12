import React, { useRef, useState } from "react";
import "./auracaredemo.css";

const MEDIA = process.env.PUBLIC_URL + "/media/";
const FILE = {
  live:  "Auracaredemo.mp4",
  meds:  "Lääkemuistutus.mp4",
  drink: "Juomamuistutus.mp4",
};

const LABEL = {
  idle:  "Valmis",
  live:  "Live-puhelu",
  meds:  "Lääkemuistutus",
  drink: "Juomamuistutus",
};

export default function AuraCareDemo() {
  const videoRef = useRef(null);
  const [kind, setKind] = useState("idle");
  const [panelOpen, setPanelOpen] = useState(false);

  const playClip = (type) => {
    setKind(type);
    const v = videoRef.current;
    if (!v) return;

    const src = MEDIA + encodeURIComponent(FILE[type]);
    if (v.src !== src) v.src = src;

    v.autoplay = true;
    v.muted = false;         // käyttäjän klikkaus -> ääni sallittu
    v.playsInline = true;
    v.load();

    // pieni viive varmistaa että selain on päivittänyt lähteen
    setTimeout(() => {
      v.play().catch(() => {
        // jos selain estää, näytetään edes kontrollit
        v.controls = true;
      });
    }, 40);
  };

  const stopAll = () => {
    const v = videoRef.current;
    if (v) {
      try { v.pause(); } catch {}
      v.removeAttribute("src");
      v.load();
      v.controls = false;
    }
    setKind("idle");
  };

  return (
    <div className="demo-container">
      {/* Ylätunniste */}
      <div className="header">
        <img src={process.env.PUBLIC_URL + "/logo.png"} alt="Logo" className="logo" />
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
            <li><strong>Turva & reagointi:</strong> havaitsee avunhuudot ja kovat äänet (kolahdus), kysyy “Onko kaikki hyvin?” ja voi hälyttää läheiset.</li>
            <li><strong>Omaisille & hoivaan:</strong> selkeä näkymä tapahtumiin ja ilmoituksiin, hallinta yhdestä paikasta.</li>
            <li><strong>Tietosuoja kunnossa:</strong> vain välttämätön tieto, läpinäkyvä käsittely, GDPR-periaatteet.</li>
          </ul>
        </div>

        {/* Keskiosa: puhelinkehys + napit */}
        <div className="middle">
          <div className="phone-frame">
            <div className={`status-chip status-${kind}`}>{LABEL[kind]}</div>
            <div className="phone-header">AuraCare VMP Demo</div>

            <video
              ref={videoRef}
              className="profile-pic"
              preload="metadata"
              playsInline
              controls={false}
            />
            <div className="error-hint">
              Videota ei löytynyt tai lataus epäonnistui.
            </div>
          </div>

          <div className="play-controls">
            <button className="btn green" onClick={() => playClip("live")}>▶ Live</button>
            <button className="btn red"   onClick={() => playClip("meds")}>💊 Lääkemuistutus</button>
            <button className="btn blue"  onClick={() => playClip("drink")}>💧 Juomamuistutus</button>
            <button className="btn gray"  onClick={stopAll}>■ Stop</button>
            <button className="btn purple" onClick={() => setPanelOpen(true)}>⚙️ Käyttöpaneeli</button>
          </div>
        </div>

        {/* OIKEA PALSTA: Hallintapaneelin tekstit + nappirivi */}
<div className="right">
  <h3>🛠 Hallintapaneeli</h3>
  <p>💊 Lääkkeet: Aamu klo 08.00 ja Ilta klo 20.00</p>
  <p>💧 Juomamuistutukset: 2h välein (08.00–20.00)</p>
  <p>👨‍👩‍👦 Läheiset: Timo, Anna</p>

  <div className="panel-card">
    <div className="panel-title">Mitä hallintapaneelissa voi tehdä?</div>
    <ul className="panel-list">
      <li>Lisää ja aikatauluta lääkemuistutukset</li>
      <li>Säädä juomaväli ja aktiiviset kellonajat</li>
      <li>Luo omia muistutuksia (esim. ruokailu)</li>
      <li>Lisää käyttäjiä (omaiset / hoitajat)</li>
      <li>Tallenna ja testaa asetukset</li>
    </ul>

    {/* TÄRKEÄ: estä oletusnavigointi ja avaa modaali */}
    <a
      href="#"
      className="panel-link"
      onClick={(e) => {
        e.preventDefault();
        setPanelOpen(true);
      }}
    >
      Avaa käyttöpaneeli ›
    </a>
  </div>

  {/* Nappirivi – nyt oikealla, ei puhelimen alla */}
  <div className="action-row">
    <button className="btn green" onClick={() => play('live')}>▶ Live</button>
    <button className="btn red"   onClick={() => play('meds')}>💊 Lääkemuistutus</button>
    <button className="btn blue"  onClick={() => play('drink')}>💧 Juomamuistutus</button>
    <button className="btn gray"  onClick={stopAll}>■ Stop</button>
  </div>
</div>


      {/* Yksinkertainen modal “päällä” (valinnainen, pysyy tyylikkäänä) */}
      {panelOpen && (
        <div className="modal" onClick={() => setPanelOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>⚙️ Käyttöpaneeli (demo)</h4>
              <button className="close" onClick={() => setPanelOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Tähän tulee varsinainen asetusnäkymä (lääkkeet, juoma, muut muistutukset, käyttäjät…).</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
