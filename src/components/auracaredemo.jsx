import React, { useState } from 'react';
import './ui/auracaredemo.css';

const BASE = process.env.PUBLIC_URL + "/audio/";

const timoHilmaAudio = [
  BASE + "1timo.mp3",
  BASE + "2hilma.mp3",
  BASE + "3timo.mp3",
  BASE + "4hilma.mp3",
  BASE + "5timo.mp3",
  BASE + "6hilma.mp3",
  BASE + "7timo.mp3",
  BASE + "8hilma.mp3",
  BASE + "9timo.mp3",
  BASE + "10hilma.mp3",
];

// Lääkemuistutus-äänitiedostot
const BASE = process.env.PUBLIC_URL + "/audio/";
const laakemuistutusAudio = [
  BASE + "1l_timo.mp3",
  BASE + "2l_hilma.mp3",
  BASE + "3l_timo.mp3",
  BASE + "4l_hilma.mp3",
  BASE + "5l_timo.mp3",
  BASE + "6l_timo.mp3",
  BASE + "7l_hilma.mp3",
];

const AuraCareDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Yleinen soittometodi
  const playAudioSequence = async (files, index = 0) => {
    if (index >= files.length) {
      setIsPlaying(false);
      return;
    }
    try {
      const audio = new Audio(files[index]);
      await audio.play();
      audio.onended = () => playAudioSequence(files, index + 1);
    } catch (err) {
      console.error("Virhe soitettaessa:", files[index], err);
      setIsPlaying(false);
    }
  };

  return (
    <div className="auracare-demo">
      {/* Timo & Hilma -nappi */}
      <button
        onClick={() => {
          console.log("🗣️ Timo & Hilma -keskustelu alkaa");
          setIsPlaying(true);
          playAudioSequence(timoHilmaAudio);
        }}
        disabled={isPlaying}
      >
        🗣️ Aloita Timo & Hilma -keskustelu
      </button>

      {/* Lääkemuistutus-nappi */}
      <button
        onClick={() => {
          console.log("💊 Lääkemuistutus alkaa");
          setIsPlaying(true);
          playAudioSequence(laakemuistutusAudio);
        }}
        disabled={isPlaying}
      >
        💊 testi
      </button>
    </div>
  );
};

export default AuraCareDemo;
