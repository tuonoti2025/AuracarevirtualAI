import React, { useCallback } from "react";

export default function Hallintapaneeli() {
  const playLaakemuistutus = useCallback(() => {
    const files = const laakemuistutusAudio = [
  "/audio/1l_timo.mp3",
  "/audio/2l_hilma.mp3",
  "/audio/3l_timo.mp3",
  "/audio/4l_hilma.mp3",
  "/audio/5l_timo.mp3",
  "/audio/6l_timo.mp3",
  "/audio/7l_hilma.mp3"
];

    // Tiedostot ovat public/audio/ -kansiossa
    const BASE = process.env.PUBLIC_URL + "/audio/";
    let index = 0;
    const audio = new Audio(BASE + files[index]);

    // Kun yksi tiedosto päättyy, soitetaan seuraava
    audio.addEventListener("ended", () => {
      index++;
      if (index < files.length) {
        audio.src = BASE + files[index];
        audio.play().catch(err => console.warn("Toisto estyi:", err));
      }
    });

    // Ensimmäinen toisto
    audio.play().catch(err => console.warn("Toisto estyi:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Hallintapaneeli</h2>
      <p>Valitse toiminto:</p>

      onClick={() => startSequence(laakemuistutusAudio)}
      <button
        onClick={playLaakemuistutus}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none"
        }}
      >
        Lääkemuistutus
      </button>
    </div>
  );
}
